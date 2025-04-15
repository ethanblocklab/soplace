import {
  createPublicClient,
  http,
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
import { getLatestProcessedBlock } from './supabase'
import { itemPlacedQueue, itemUpdatedQueue } from './queue'
import { isometricTilemapAbi, isometricTilemapAddress } from './contracts'

// Setup WebSocket client
let wsClient: PublicClient<WebSocketTransport, Chain>
let httpClient: PublicClient
let wsTransport: WebSocketTransport

// Contract address typed for viem
const contractAddress = config.blockchain.contractAddress as Address

// Track connection status
let isConnected = false
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10
let watchLogsUnwatch: (() => void) | null = null

// Initialize the WebSocket connection and contract
export const initializeBlockchainConnection = async (): Promise<void> => {
  try {
    // Create WebSocket transport
    wsTransport = webSocket(config.blockchain.wssRpcEndpoint)

    // Create WebSocket client
    wsClient = createPublicClient({
      chain: somniaTestnet,
      transport: wsTransport,
    })

    // Setup WebSocket connection handlers
    if ('on' in wsTransport) {
      const typedTransport = wsTransport as unknown as {
        on(event: string, listener: any): void
        destroy?: () => void
      }

      typedTransport.on('open', () => {
        logger.info('WebSocket connection established')
        isConnected = true
        reconnectAttempts = 0
      })

      typedTransport.on('close', handleDisconnect)

      typedTransport.on('error', (error: Error) => {
        logger.error({ error }, 'WebSocket error')
      })
    }

    // Create HTTP client as fallback
    httpClient = createPublicClient({
      chain: somniaTestnet,
      transport: http(
        config.blockchain.wssRpcEndpoint.replace('wss://', 'https://'),
      ),
    })

    // Listen for events
    await setupEventListeners()

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

// Handle WebSocket disconnection
const handleDisconnect = async () => {
  logger.warn('WebSocket connection closed, attempting to reconnect...')
  isConnected = false

  // Clean up existing watchers
  if (watchLogsUnwatch) {
    watchLogsUnwatch()
    watchLogsUnwatch = null
  }

  // Reconnect with backoff
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000)
    logger.info(
      `Waiting ${delay}ms before reconnecting (attempt ${
        reconnectAttempts + 1
      }/${MAX_RECONNECT_ATTEMPTS})`,
    )

    setTimeout(() => {
      reconnectAttempts++
      initializeBlockchainConnection()
    }, delay)
  } else {
    logger.error('Maximum reconnection attempts reached. Exiting...')
    process.exit(1)
  }
}

// Setup event listeners for the contract
const setupEventListeners = async (): Promise<void> => {
  try {
    // Get the last processed block to resume from
    let startBlock: bigint | 'latest' = 'latest'

    if (config.blockchain.startingBlock === 'latest') {
      const latestBlock = await wsClient.getBlockNumber()
      startBlock = latestBlock
      logger.info(
        { blockNumber: latestBlock.toString() },
        'Starting from latest block',
      )
    } else if (config.blockchain.startingBlock === 'resume') {
      const lastProcessedBlock = await getLatestProcessedBlock()
      startBlock = lastProcessedBlock
        ? BigInt(lastProcessedBlock + 1)
        : 'latest'
      logger.info(
        {
          blockNumber:
            typeof startBlock === 'bigint' ? startBlock.toString() : startBlock,
        },
        'Resuming from last processed block',
      )
    } else if (!isNaN(Number(config.blockchain.startingBlock))) {
      startBlock = BigInt(config.blockchain.startingBlock)
    }

    // Set up log watching for ItemPlaced events
    watchLogsUnwatch = wsClient.watchContractEvent({
      address: contractAddress,
      abi: isometricTilemapAbi as Abi,
      eventName: 'ItemPlaced',
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
    wsClient.watchContractEvent({
      address: contractAddress,
      abi: isometricTilemapAbi as Abi,
      eventName: 'ItemUpdated',
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

    // Queue the event for processing
    await itemPlacedQueue.add('process-item-placed', {
      player: args.player,
      x: Number(args.x),
      y: Number(args.y),
      itemId: Number(args.itemId),
      blockNumber: Number(log.blockNumber),
      blockTimestamp: new Date(Number(block.timestamp) * 1000),
      transactionHash: log.transactionHash,
    })
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

    // Queue the event for processing
    await itemUpdatedQueue.add('process-item-updated', {
      player: args.player,
      x: Number(args.x),
      y: Number(args.y),
      newItemId: Number(args.newItemId),
      blockNumber: Number(log.blockNumber),
      blockTimestamp: new Date(Number(block.timestamp) * 1000),
      transactionHash: log.transactionHash,
    })
  } catch (error) {
    logger.error({ error, log }, 'Failed to process ItemUpdated event')
  }
}

// Close the WebSocket connection
export const closeBlockchainConnection = async (): Promise<void> => {
  if (watchLogsUnwatch) {
    watchLogsUnwatch()
  }

  if (wsTransport && isConnected) {
    logger.info('Closing blockchain connection...')
    if ('destroy' in wsTransport) {
      // Use destroy method if available
      ;(wsTransport as unknown as { destroy: () => void }).destroy()
    }
    isConnected = false
  }
}
