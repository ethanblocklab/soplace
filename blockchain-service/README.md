# Blockchain Event Monitor Service

A service that monitors IsometricTilemap smart contract events and stores them in a Supabase database.

## Features

- Real-time monitoring of blockchain events using WebSocket connection
- Reliable event processing with queue system (BullMQ)
- Persistent storage of events in Supabase
- Automatic reconnection with exponential backoff
- Graceful error handling and shutdown

## Prerequisites

- Node.js 18 or higher
  - Render
- Redis server (for BullMQ)
  - upstash
- Supabase account with required tables set up

## Setup

1. Clone the repository
2. Install dependencies:

```bash
cd blockchain-service
npm install
```

3. Copy the example environment file:

```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your actual values:
   - `WSS_RPC_ENDPOINT` - WebSocket RPC URL for the blockchain
   - `CONTRACT_ADDRESS` - The smart contract address to monitor
   - `SUPABASE_URL` and `SUPABASE_KEY` - Your Supabase credentials
   - `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` - Redis connection details

## Supabase Setup

Create the following tables in your Supabase database:

### item_placed_events

```sql
CREATE TABLE item_placed (

);
```

## Running the Service

### Development

```bash
npm run dev
```

### Production

Build and run:

```bash
npm run build
npm start
```

## Deployment

This service is designed to be deployed as a background worker on platforms like Render.

1. Push your code to GitHub
2. Connect your repository to Render
3. Create a new Background Worker
4. Set environment variables
5. Deploy

## Monitoring

The service logs using Pino. In production, consider setting up a log aggregator or monitoring service to track the health of your service.
