import { createClient } from '@supabase/supabase-js'
import { config } from './config'
import { logger } from './logger'

// Create a Supabase client
export const supabase = createClient(config.supabase.url, config.supabase.key, {
  auth: {
    persistSession: false,
  },
})

// Define types for the events we'll be storing
export interface ItemPlacedEvent {
  player: string
  x: number
  y: number
  itemId: number
  blockNumber: number
  blockTimestamp: Date
  transactionHash: string
}

export interface ItemUpdatedEvent {
  player: string
  x: number
  y: number
  newItemId: number
  blockNumber: number
  blockTimestamp: Date
  transactionHash: string
}

// Database operations
export const storeItemPlacedEvent = async (
  event: ItemPlacedEvent,
): Promise<void> => {
  try {
    const { error } = await supabase.from('item_placed_events').insert(event)

    if (error) {
      logger.error({ error, event }, 'Failed to store ItemPlaced event')
      throw error
    }

    logger.debug({ event }, 'Stored ItemPlaced event')
  } catch (error) {
    logger.error(
      { error, event },
      'Supabase error when storing ItemPlaced event',
    )
    throw error
  }
}

export const storeItemUpdatedEvent = async (
  event: ItemUpdatedEvent,
): Promise<void> => {
  try {
    const { error } = await supabase.from('item_updated_events').insert(event)

    if (error) {
      logger.error({ error, event }, 'Failed to store ItemUpdated event')
      throw error
    }

    logger.debug({ event }, 'Stored ItemUpdated event')
  } catch (error) {
    logger.error(
      { error, event },
      'Supabase error when storing ItemUpdated event',
    )
    throw error
  }
}

// Get the latest processed block number to resume from
export const getLatestProcessedBlock = async (): Promise<number | null> => {
  try {
    // Try from both event tables and get the higher value
    const [itemPlacedResult, itemUpdatedResult] = await Promise.all([
      supabase
        .from('item_placed_events')
        .select('block_number')
        .order('block_number', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('item_updated_events')
        .select('block_number')
        .order('block_number', { ascending: false })
        .limit(1)
        .single(),
    ])

    const itemPlacedBlock = itemPlacedResult.data?.block_number || 0
    const itemUpdatedBlock = itemUpdatedResult.data?.block_number || 0

    const latestBlock = Math.max(itemPlacedBlock, itemUpdatedBlock)
    return latestBlock > 0 ? latestBlock : null
  } catch (error) {
    logger.error({ error }, 'Failed to get latest processed block')
    return null
  }
}
