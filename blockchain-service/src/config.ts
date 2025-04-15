import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') })

export const config = {
  blockchain: {
    wssRpcEndpoint: process.env.WSS_RPC_ENDPOINT || '',
    contractAddress:
      process.env.CONTRACT_ADDRESS ||
      '0x25347B4f8449cCCDEEB52912c0d0d3a1613C98E4',
    pollInterval: parseInt(process.env.POLL_INTERVAL || '15000', 10),
    maxBlocksPerBatch: parseInt(
      process.env.MAX_BLOCKS_PER_BATCH || '10000',
      10,
    ),
    startingBlock: process.env.STARTING_BLOCK || 'latest',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
}

// Validate required configuration
if (!config.blockchain.wssRpcEndpoint) {
  throw new Error('WSS_RPC_ENDPOINT is required')
}

if (!config.blockchain.contractAddress) {
  throw new Error('CONTRACT_ADDRESS is required')
}

if (!config.supabase.url || !config.supabase.key) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY are required')
}
