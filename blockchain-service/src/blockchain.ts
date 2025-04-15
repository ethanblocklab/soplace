import { ethers } from 'ethers'
import { config } from './config'
import { logger } from './logger'
import { getLatestProcessedBlock } from './supabase'
import { itemPlacedQueue, itemUpdatedQueue } from './queue'
import { isometricTilemapAbi } from './contracts'

// Setup WebSocket provider
let provider: ethers.WebSocketProvider

// Create contract instance
let contract: ethers.Contract

// Track connection status
let isConnected = false
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10

// Initialize the WebSocket connection and contract
export const initializeBlockchainConnection = async (): Promise<void> => {
  try {
    // Create WebSocket provider
    provider = new ethers.WebSocketProvider(config.blockchain.wssRpcEndpoint)

    // Create contract instance
    contract = new ethers.Contract(
      config.blockchain.contractAddress,
      isometricTilemapAbi,
      provider,
    )

    // Set up connection monitoring
    provider._websocket.on('open', () => {
      logger.info('WebSocket connection established')
      isConnected = true
      reconnectAttempts = 0
    })

    provider._websocket.on('close', async () => {
      logger.warn('WebSocket connection closed, attempting to reconnect...')
      isConnected = false

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
    })

    provider._websocket.on('error', (error) => {
      logger.error({ error }, 'WebSocket error')
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

// Setup event listeners for the contract
const setupEventListeners = async (): Promise<void> => {
  try {
    // Get the last processed block to resume from
    let startBlock: number | string = config.blockchain.startingBlock

    if (startBlock === 'latest') {
      const latestBlock = await provider.getBlockNumber()
      startBlock = latestBlock
      logger.info({ blockNumber: latestBlock }, 'Starting from latest block')
    } else if (startBlock === 'resume') {
      const lastProcessedBlock = await getLatestProcessedBlock()
      startBlock = lastProcessedBlock ? lastProcessedBlock + 1 : 'latest'
      logger.info(
        { blockNumber: startBlock },
        'Resuming from last processed block',
      )
    }

    // Listen for ItemPlaced events
    contract.on('ItemPlaced', async (player, x, y, itemId, event) => {
      const block = await event.getBlock()

      logger.info(
        {
          event: 'ItemPlaced',
          player,
          x: x.toString(),
          y: y.toString(),
          itemId: itemId.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        },
        'Received ItemPlaced event',
      )

      // Queue the event for processing
      await itemPlacedQueue.add('process-item-placed', {
        player,
        x: Number(x),
        y: Number(y),
        itemId: Number(itemId),
        blockNumber: event.blockNumber,
        blockTimestamp: new Date(block.timestamp * 1000),
        transactionHash: event.transactionHash,
      })
    })

    // Listen for ItemUpdated events
    contract.on('ItemUpdated', async (player, x, y, newItemId, event) => {
      const block = await event.getBlock()

      logger.info(
        {
          event: 'ItemUpdated',
          player,
          x: x.toString(),
          y: y.toString(),
          newItemId: newItemId.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        },
        'Received ItemUpdated event',
      )

      // Queue the event for processing
      await itemUpdatedQueue.add('process-item-updated', {
        player,
        x: Number(x),
        y: Number(y),
        newItemId: Number(newItemId),
        blockNumber: event.blockNumber,
        blockTimestamp: new Date(block.timestamp * 1000),
        transactionHash: event.transactionHash,
      })
    })

    logger.info('Event listeners set up successfully')
  } catch (error) {
    logger.error({ error }, 'Failed to set up event listeners')
    throw error
  }
}

// Close the WebSocket connection
export const closeBlockchainConnection = async (): Promise<void> => {
  if (provider && provider._websocket.readyState === WebSocket.OPEN) {
    logger.info('Closing blockchain connection...')
    provider._websocket.close()
  }
}
