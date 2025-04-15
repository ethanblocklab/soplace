import { logger } from './logger'
import {
  initializeBlockchainConnection,
  closeBlockchainConnection,
} from './blockchain'
import {
  initializeHttpBlockchainConnection,
  closeHttpBlockchainConnection,
} from './blockchain_http'
import { config } from './config'

// Main function
async function main() {
  logger.info('Starting blockchain event monitoring service')

  try {
    // Initialize blockchain connection and event listeners
    // Choose between WebSocket and HTTP implementation
    if (config.blockchain.httpRpcEndpoint) {
      logger.info('Using HTTP connection for blockchain monitoring')
      await initializeHttpBlockchainConnection()
    } else {
      logger.info('Using WebSocket connection for blockchain monitoring')
      await initializeBlockchainConnection()
    }

    logger.info('Service started successfully')

    // Setup graceful shutdown
    setupShutdown()
  } catch (error) {
    logger.error({ error }, 'Failed to start service')
    process.exit(1)
  }
}

// Setup graceful shutdown
function setupShutdown() {
  const shutdown = async () => {
    logger.info('Shutting down...')

    try {
      // Close blockchain connection based on which one was used
      if (config.blockchain.httpRpcEndpoint) {
        await closeHttpBlockchainConnection()
      } else {
        await closeBlockchainConnection()
      }

      logger.info('Service stopped gracefully')
      process.exit(0)
    } catch (error) {
      logger.error({ error }, 'Error during shutdown')
      process.exit(1)
    }
  }

  // Listen for shutdown signals
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
  process.on('uncaughtException', (error) => {
    logger.error({ error }, 'Uncaught exception')
    shutdown()
  })

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection')
    shutdown()
  })
}

// Start the service
main()
