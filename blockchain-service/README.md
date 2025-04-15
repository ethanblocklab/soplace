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
- Redis server (for BullMQ)
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
CREATE TABLE item_placed_events (
  id SERIAL PRIMARY KEY,
  player TEXT NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  block_number INTEGER NOT NULL,
  block_timestamp TIMESTAMP NOT NULL,
  transaction_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_item_placed_block_number ON item_placed_events(block_number);
CREATE INDEX idx_item_placed_player ON item_placed_events(player);
CREATE INDEX idx_item_placed_coordinates ON item_placed_events(x, y);
```

### item_updated_events

```sql
CREATE TABLE item_updated_events (
  id SERIAL PRIMARY KEY,
  player TEXT NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  new_item_id INTEGER NOT NULL,
  block_number INTEGER NOT NULL,
  block_timestamp TIMESTAMP NOT NULL,
  transaction_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_item_updated_block_number ON item_updated_events(block_number);
CREATE INDEX idx_item_updated_player ON item_updated_events(player);
CREATE INDEX idx_item_updated_coordinates ON item_updated_events(x, y);
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
