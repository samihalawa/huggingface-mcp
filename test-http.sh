#!/bin/bash

echo "Testing Hugging Face MCP Server HTTP Transport"
echo "============================================="

# Start the server in background
echo "Starting server..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
echo -e "\n1. Testing health endpoint..."
curl -s http://localhost:3000/health | jq .

# Test SSE connection and capture session ID
echo -e "\n2. Establishing SSE connection..."
SSE_RESPONSE=$(curl -s -N http://localhost:3000/sse 2>&1 | head -n 20)
echo "$SSE_RESPONSE"

# Extract session ID from the response (looking for the endpoint event)
SESSION_ID=$(echo "$SSE_RESPONSE" | grep -oP 'sessionId=\K[^&\s]+' | head -1)
echo -e "\nExtracted Session ID: $SESSION_ID"

if [ -z "$SESSION_ID" ]; then
    echo "Failed to extract session ID"
    kill $SERVER_PID
    exit 1
fi

# Test sending an initialize message
echo -e "\n3. Sending initialize request..."
curl -X POST "http://localhost:3000/messages?sessionId=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    },
    "id": 1
  }' | jq .

# Test listing tools
echo -e "\n4. Listing available tools..."
curl -X POST "http://localhost:3000/messages?sessionId=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
  }' | jq .

# Clean up
echo -e "\nCleaning up..."
kill $SERVER_PID

echo -e "\nTest complete!"