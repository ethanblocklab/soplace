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
export interface ItemPlaced {
  player: string
  x: number
  y: number
  itemId: number
  blockNumber: number
  blockTimestamp: Date
  transactionHash: string
}

// Database operations
export const storeItemPlaced = async (event: ItemPlaced): Promise<void> => {
  try {
    // Create an object with the event data, mapping to database column names
    const eventData = {
      player: event.player,
      x: event.x,
      y: event.y,
      item_id: event.itemId,
      block_number: event.blockNumber,
      tx_hash: event.transactionHash,
      // created_at is handled by the database DEFAULT NOW()
    }

    // Use upsert - this will update the row if (x,y) already exists, otherwise insert
    const { error } = await supabase
      .from('item_placed')
      .upsert(eventData)
      .select()

    if (error) {
      logger.error({ error, event }, 'Failed to store ItemPlaced')
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

// Get the latest processed block number to resume from
export const getLatestProcessedBlock = async (): Promise<number | null> => {
  try {
    // First try to get from the dedicated processed_blocks table
    const processedBlockResult = await supabase
      .from('processed_blocks')
      .select('block_number')
      .eq('id', 1)
      .single()

    if (processedBlockResult.data) {
      return processedBlockResult.data.block_number
    }

    // Fall back to checking the event tables
    const [itemPlacedResult] = await Promise.all([
      supabase
        .from('item_placed')
        .select('block_number')
        .order('block_number', { ascending: false })
        .limit(1)
        .single(),
    ])

    return itemPlacedResult.data?.block_number || null
  } catch (error) {
    logger.error({ error }, 'Failed to get latest processed block')
    return null
  }
}

// Store the last processed block number
export const storeLastProcessedBlock = async (
  blockNumber: number,
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('processed_blocks')
      .upsert({ id: 1, block_number: blockNumber, updated_at: new Date() })
      .select()

    if (error) {
      logger.error(
        { error, blockNumber },
        'Failed to store last processed block',
      )
      throw error
    }

    logger.debug({ blockNumber }, 'Stored last processed block')
  } catch (error) {
    logger.error(
      { error, blockNumber },
      'Supabase error when storing last processed block',
    )
    throw error
  }
}
