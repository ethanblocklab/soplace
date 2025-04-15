import { Queue, Worker, QueueEvents } from 'bullmq'
import IORedis from 'ioredis'
import { config } from './config'
import { logger } from './logger'
import {
  storeItemPlacedEvent,
  storeItemUpdatedEvent,
  ItemPlacedEvent,
  ItemUpdatedEvent,
} from './supabase'

// Connect to Redis
const connection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
})

// Create queues for different event types
export const itemPlacedQueue = new Queue('item-placed-events', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
})

export const itemUpdatedQueue = new Queue('item-updated-events', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
})

// Process ItemPlaced events
const itemPlacedWorker = new Worker(
  'item-placed-events',
  async (job) => {
    const event = job.data as ItemPlacedEvent
    logger.info({ event }, 'Processing ItemPlaced event')

    await storeItemPlacedEvent(event)

    logger.info(
      {
        blockNumber: event.blockNumber,
        tx: event.transactionHash,
      },
      'Successfully processed ItemPlaced event',
    )
  },
  { connection },
)

// Process ItemUpdated events
const itemUpdatedWorker = new Worker(
  'item-updated-events',
  async (job) => {
    const event = job.data as ItemUpdatedEvent
    logger.info({ event }, 'Processing ItemUpdated event')

    await storeItemUpdatedEvent(event)

    logger.info(
      {
        blockNumber: event.blockNumber,
        tx: event.transactionHash,
      },
      'Successfully processed ItemUpdated event',
    )
  },
  { connection },
)

// Set up error handling for workers
itemPlacedWorker.on('failed', (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      error: error.message,
      attemptsMade: job?.attemptsMade,
    },
    'ItemPlaced job failed',
  )
})

itemUpdatedWorker.on('failed', (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      error: error.message,
      attemptsMade: job?.attemptsMade,
    },
    'ItemUpdated job failed',
  )
})

// Graceful shutdown
export const closeQueues = async (): Promise<void> => {
  logger.info('Closing queues and workers...')
  await Promise.all([
    itemPlacedWorker.close(),
    itemUpdatedWorker.close(),
    itemPlacedQueue.close(),
    itemUpdatedQueue.close(),
    connection.quit(),
  ])
  logger.info('Queues and workers closed')
}
