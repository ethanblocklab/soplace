import {
  createPublicClient,
  http,
  type PublicClient,
  type HttpTransport,
  type Log,
  decodeEventLog,
  type Chain,
  type Abi,
  type Address,
  getContract,
} from 'viem'
import { somniaTestnet } from 'viem/chains'
import { config } from './config'
import { logger } from './logger'
import { getLatestProcessedBlock, storeItemPlaced } from './supabase'
import { isometricTilemapAbi } from './contracts'

// HTTP client
let httpClient: PublicClient<HttpTransport, Chain>

// Contract address typed for viem
const contractAddress = config.blockchain.contractAddress as Address

// Poll interval ID
let pollIntervalId: NodeJS.Timeout | null = null

// Initialize the HTTP connection
export const initializeHttpBlockchainConnection = async (): Promise<void> => {
  try {
    // Extract HTTP URL from WSS URL or use a provided HTTP URL
    const httpRpcEndpoint = config.blockchain.httpRpcEndpoint

    // Create HTTP client
    httpClient = createPublicClient({
      chain: somniaTestnet,
      transport: http(httpRpcEndpoint),
    })

    // Initial setup of polling
    await setupPolling()

    logger.info(
      {
        contractAddress: config.blockchain.contractAddress,
        transport: 'HTTP',
        endpoint: httpRpcEndpoint,
      },
      'HTTP blockchain connection initialized',
    )
  } catch (error) {
    logger.error({ error }, 'Failed to initialize HTTP blockchain connection')
    throw error
  }
}

// Clean up polling
const cleanupPolling = () => {
  if (pollIntervalId) {
    clearInterval(pollIntervalId)
    pollIntervalId = null
  }

  logger.info('HTTP polling stopped')
}

// Define types for ItemPlaced event args
interface ItemPlacedEventArgs {
  player: Address
  x: bigint
  y: bigint
  itemId: bigint
}

// Define types for ItemUpdated event args
interface ItemUpdatedEventArgs {
  player: Address
  x: bigint
  y: bigint
  newItemId: bigint
}

// Setup polling for contract events
const setupPolling = async (): Promise<void> => {
  try {
    // Clean up any existing polling
    cleanupPolling()

    logger.info('Setting up HTTP polling...')

    let startBlock: bigint
    let endBlock: bigint

    // Try to get the latest processed block from the database
    const latestProcessedBlock = await getLatestProcessedBlock()

    if (latestProcessedBlock) {
      // If we have a processed block, start from the next block
      startBlock = BigInt(latestProcessedBlock + 1)
      logger.info(
        { startBlock: startBlock.toString() },
        'Resuming from last processed block',
      )
    } else if (
      !isNaN(Number(config.blockchain.startingBlock)) &&
      config.blockchain.startingBlock !== 'latest'
    ) {
      startBlock = BigInt(config.blockchain.startingBlock)
      logger.info(
        { startBlock: startBlock.toString() },
        'Starting from configured block',
      )
    } else {
      // If no starting block is specified, get the latest block
      const latestBlock = await httpClient.getBlockNumber()
      startBlock = latestBlock
      logger.info(
        { startBlock: startBlock.toString() },
        'Starting from latest block',
      )
    }

    // Set up polling interval
    pollIntervalId = setInterval(async () => {
      try {
        // Get the latest block
        const latestBlock = await httpClient.getBlockNumber()
        endBlock = latestBlock

        // Skip if there are no new blocks
        if (endBlock < startBlock) {
          return
        }

        // Limit the number of blocks processed in each batch
        const maxBlocksPerBatch = BigInt(config.blockchain.maxBlocksPerBatch)
        const batchEndBlock =
          endBlock - startBlock > maxBlocksPerBatch
            ? startBlock + maxBlocksPerBatch
            : endBlock

        logger.info(
          {
            startBlock: startBlock.toString(),
            endBlock: batchEndBlock.toString(),
          },
          'Polling for events',
        )

        // Get logs for the batch
        const logs = await httpClient.getLogs({
          address: contractAddress,
          fromBlock: startBlock,
          toBlock: batchEndBlock,
        })

        // Process logs
        for (const log of logs) {
          await processContractEvent(log)
        }

        // Update start block for next poll
        startBlock = batchEndBlock + BigInt(1)
      } catch (error) {
        logger.error({ error }, 'Error while polling for events')
      }
    }, config.blockchain.pollInterval)

    logger.info('HTTP polling set up successfully')
  } catch (error) {
    logger.error({ error }, 'Failed to set up HTTP polling')
    throw error
  }
}

// Process contract events
const processContractEvent = async (log: Log) => {
  try {
    const block = await httpClient.getBlock({
      blockHash: log.blockHash as `0x${string}`,
    })

    // First try to decode as ItemPlaced event
    try {
      const placedResult = decodeEventLog({
        abi: isometricTilemapAbi as Abi,
        eventName: 'ItemPlaced',
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        data: log.data,
      })

      const args = placedResult.args as unknown as ItemPlacedEventArgs

      logger.info(
        {
          event: 'ItemPlaced',
          player: args.player,
          x: args.x.toString(),
          y: args.y.toString(),
          itemId: args.itemId.toString(),
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
        },
        'Received ItemPlaced event',
      )

      const eventData = {
        player: args.player,
        x: Number(args.x),
        y: Number(args.y),
        itemId: Number(args.itemId),
        blockNumber: Number(log.blockNumber),
        blockTimestamp: new Date(Number(block.timestamp) * 1000),
        transactionHash: log.transactionHash ?? '',
      }

      await storeItemPlaced(eventData)

      logger.info(
        {
          event: 'ItemPlaced',
          blockNumber: eventData.blockNumber,
          tx: eventData.transactionHash,
        },
        'Successfully stored ItemPlaced event',
      )

      return
    } catch (placedError) {
      // Not an ItemPlaced event, try ItemUpdated
    }

    // Then try to decode as ItemUpdated event
    try {
      const updatedResult = decodeEventLog({
        abi: isometricTilemapAbi as Abi,
        eventName: 'ItemUpdated',
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        data: log.data,
      })

      const args = updatedResult.args as unknown as ItemUpdatedEventArgs

      logger.info(
        {
          event: 'ItemUpdated',
          player: args.player,
          x: args.x.toString(),
          y: args.y.toString(),
          newItemId: args.newItemId.toString(),
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
        },
        'Received ItemUpdated event',
      )

      const eventData = {
        player: args.player,
        x: Number(args.x),
        y: Number(args.y),
        itemId: Number(args.newItemId), // Use newItemId as itemId for updates
        blockNumber: Number(log.blockNumber),
        blockTimestamp: new Date(Number(block.timestamp) * 1000),
        transactionHash: log.transactionHash ?? '',
      }

      await storeItemPlaced(eventData)

      logger.info(
        {
          event: 'ItemUpdated',
          blockNumber: eventData.blockNumber,
          tx: eventData.transactionHash,
        },
        'Successfully stored ItemUpdated event',
      )

      return
    } catch (updatedError) {
      // Not an ItemUpdated event either, log for debugging
      logger.debug(
        {
          topics: log.topics,
          data: log.data,
          blockNumber: log.blockNumber,
        },
        'Received unrecognized event',
      )
    }
  } catch (error) {
    logger.error({ error, log }, 'Failed to process contract event')
  }
}

// Clean up HTTP connection
export const closeHttpBlockchainConnection = async (): Promise<void> => {
  try {
    // Clean up polling
    cleanupPolling()

    logger.info('HTTP blockchain connection closed')
  } catch (error) {
    logger.error({ error }, 'Error closing HTTP blockchain connection')
    throw error
  }
}
