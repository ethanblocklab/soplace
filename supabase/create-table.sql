-- Run this in the Supabase SQL Editor
CREATE TABLE item_placed (
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  block_number BIGINT NOT NULL,
  tx_hash TEXT NOT NULL,
  player TEXT NOT NULL,
  item_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (x, y)
);

-- Create indexes for efficient queries
CREATE INDEX idx_player ON item_placed(player);

-- Create a view for the latest state of the grid (one item per coordinate)
CREATE VIEW current_grid AS
SELECT DISTINCT ON (x, y) 
  player, item_id, x, y, block_number, created_at
FROM item_placed
ORDER BY x, y DESC;

-- Add Row Level Security (optional but recommended)
ALTER TABLE item_placed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON item_placed FOR SELECT USING (true);