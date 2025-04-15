import {
  createPublicClient,
  webSocket,
  type PublicClient,
  type WebSocketTransport,
  type Log,
  decodeEventLog,
  type Chain,
  type Abi,
  type Address,
} from 'viem'
import { somniaTestnet } from 'viem/chains'
import { config } from './config'
import { logger } from './logger'
import { getLatestProcessedBlock, storeItemPlaced } from './supabase'
import { isometricTilemapAbi } from './contracts'

// Setup WebSocket client
let wsClient: PublicClient<WebSocketTransport, Chain>
let wsTransport: WebSocketTransport

// Contract address typed for viem
const contractAddress = config.blockchain.contractAddress as Address

// Track connection status
let isConnected = false
let watchItemPlacedUnwatch: (() => void) | null = null
let watchItemUpdatedUnwatch: (() => void) | null = null

// Initialize the WebSocket connection and contract
export const initializeBlockchainConnection = async (): Promise<void> => {
  try {
    // Create WebSocket transport with built-in reconnection logic
    wsTransport = webSocket(config.blockchain.wssRpcEndpoint, {
      reconnect: {
        attempts: 10, // Max reconnection attempts
        delay: 2000, // Base delay in ms (uses exponential backoff)
      },
      retryCount: 5, // Max retry count for failed requests
      retryDelay: 150, // Base delay between retries
    })

    // Create WebSocket client
    wsClient = createPublicClient({
      chain: somniaTestnet,
      transport: wsTransport,
    })

    // Initial setup of event listeners
    await setupEventListeners()

    isConnected = true
    logger.info(
      {
        contractAddress: config.blockchain.contractAddress,
      },
      'Blockchain connection initialized',
    )
  } catch (error) {
    logger.error({ error }, 'Failed to initialize blockchain connection')
    throw error
  }
}

// Clean up event watchers
const cleanupWatchers = () => {
  if (watchItemPlacedUnwatch) {
    watchItemPlacedUnwatch()
    watchItemPlacedUnwatch = null
  }

  if (watchItemUpdatedUnwatch) {
    watchItemUpdatedUnwatch()
    watchItemUpdatedUnwatch = null
  }

  logger.info('Event watchers cleaned up')
}

// Setup event listeners for the contract
const setupEventListeners = async (): Promise<void> => {
  try {
    // Clean up any existing watchers first
    cleanupWatchers()

    logger.info('Setting up event listeners...')

    let startBlock: bigint | 'latest' = 'latest'

    // Try to get the latest processed block from the database
    const latestProcessedBlock = await getLatestProcessedBlock()

    if (latestProcessedBlock) {
      // If we have a processed block, start from the next block
      startBlock = BigInt(latestProcessedBlock + 1)
      logger.info(
        { startBlock: startBlock.toString() },
        'Resuming from last processed block',
      )
    } else if (!isNaN(Number(config.blockchain.startingBlock))) {
      startBlock = BigInt(config.blockchain.startingBlock)
      logger.info(
        { startBlock: startBlock.toString() },
        'Starting from configured block',
      )
    } else {
      logger.info('Starting from latest block')
    }

    // Set up log watching for ItemPlaced events
    watchItemPlacedUnwatch = wsClient.watchContractEvent({
      address: contractAddress,
      abi: isometricTilemapAbi as Abi,
      eventName: 'ItemPlaced',
      fromBlock: startBlock === 'latest' ? undefined : startBlock,
      onLogs: async (logs) => {
        for (const log of logs) {
          await processItemPlacedEvent(log)
        }
      },
      onError: (error) => {
        logger.error({ error }, 'Error while watching ItemPlaced events')
      },
    })

    // Watch for ItemUpdated events
    watchItemUpdatedUnwatch = wsClient.watchContractEvent({
      address: contractAddress,
      abi: isometricTilemapAbi as Abi,
      eventName: 'ItemUpdated',
      fromBlock: startBlock === 'latest' ? undefined : startBlock,
      onLogs: async (logs) => {
        for (const log of logs) {
          await processItemUpdatedEvent(log)
        }
      },
      onError: (error) => {
        logger.error({ error }, 'Error while watching ItemUpdated events')
      },
    })

    logger.info('Event listeners set up successfully')
  } catch (error) {
    logger.error({ error }, 'Failed to set up event listeners')
    throw error
  }
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

// Process ItemPlaced events
const processItemPlacedEvent = async (log: Log) => {
  try {
    // Get the block for timestamp
    const block = await wsClient.getBlock({
      blockHash: log.blockHash as `0x${string}`,
    })

    // Parse the event data
    const result = decodeEventLog({
      abi: isometricTilemapAbi as Abi,
      eventName: 'ItemPlaced',
      topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      data: log.data,
    })

    // Cast args to the correct type
    const args = result.args as unknown as ItemPlacedEventArgs

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

    // Store the event directly in the database instead of queueing
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
        blockNumber: eventData.blockNumber,
        tx: eventData.transactionHash,
      },
      'Successfully stored ItemPlaced event',
    )
  } catch (error) {
    logger.error({ error, log }, 'Failed to process ItemPlaced event')
  }
}

// Process ItemUpdated events
const processItemUpdatedEvent = async (log: Log) => {
  try {
    // Get the block for timestamp
    const block = await wsClient.getBlock({
      blockHash: log.blockHash as `0x${string}`,
    })

    // Parse the event data
    const result = decodeEventLog({
      abi: isometricTilemapAbi as Abi,
      eventName: 'ItemUpdated',
      topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      data: log.data,
    })

    // Cast args to the correct type
    const args = result.args as unknown as ItemUpdatedEventArgs

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

    // For ItemUpdated we can also just use the storeItemPlaced function to update the record
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
        blockNumber: eventData.blockNumber,
        tx: eventData.transactionHash,
      },
      'Successfully stored ItemUpdated event',
    )
  } catch (error) {
    logger.error({ error, log }, 'Failed to process ItemUpdated event')
  }
}

// Close the WebSocket connection
export const closeBlockchainConnection = async (): Promise<void> => {
  cleanupWatchers()

  if (isConnected) {
    logger.info('Closing blockchain connection...')
    isConnected = false
  }
}
