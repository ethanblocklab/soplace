#!/bin/bash

# Make the script exit on any error
set -e

echo "Setting up Blockchain Event Monitor Service..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env
  echo "Please update the .env file with your actual values."
fi

# Create dist directory
mkdir -p dist

# Build TypeScript
echo "Building TypeScript..."
npm run build

echo "Setup complete! You can now run the service with 'npm start'"
echo "Make sure to update your .env file with the correct values before starting." 