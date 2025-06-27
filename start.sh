#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting Hugging Face Hub MCP Server in $SCRIPT_DIR..."

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the TypeScript files if not already built
if [ ! -d "build" ]; then
  echo "Building TypeScript files..."
  npm run build
fi

# The server uses the @modelcontextprotocol/sdk and should be started via its main js file in build/
echo "Launching Hugging Face Hub MCP server..."
node build/index.js "$@"

echo "Hugging Face Hub MCP server script finished." 