import { logger } from './logger'
import {
  initializeBlockchainConnection,
  closeBlockchainConnection,
} from './blockchain'
import { config } from './config'

// Main function
async function main() {
  logger.info('Starting blockchain event monitoring service')

  try {
    // Initialize blockchain connection and event listeners
    await initializeBlockchainConnection()

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
      // Close blockchain connection
      await closeBlockchainConnection()

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
