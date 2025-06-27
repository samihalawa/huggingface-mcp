# HTTP Transport Guide for MCP Servers

## Overview

MCP servers can use HTTP-based transports instead of stdio for deployment on platforms like Smithery. The most common HTTP transport is SSE (Server-Sent Events) combined with HTTP POST for bidirectional communication.

## How SSE Transport Works

1. **Client establishes SSE connection**: GET request to `/sse` endpoint
2. **Server sends endpoint URL**: Through SSE, tells client where to POST messages
3. **Client sends messages**: POST requests to `/messages?sessionId={id}`
4. **Server responds through SSE**: Sends responses back through the SSE connection

## Implementation Steps

### 1. Import SSEServerTransport

```typescript
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
```

### 2. Create SSE Endpoint

```typescript
app.get('/sse', async (req, res) => {
  // Create transport with messages endpoint
  const transport = new SSEServerTransport('/messages', res);
  
  // Connect server to transport
  await server.connect(transport);
});
```

### 3. Handle POST Messages

```typescript
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports.get(sessionId);
  
  if (transport) {
    await transport.handlePostMessage(req, res);
  }
});
```

## Key Differences from stdio

1. **Multiple Sessions**: HTTP servers handle multiple concurrent clients
2. **Session Management**: Track transports by session ID
3. **Two Endpoints**: SSE for server→client, POST for client→server
4. **Stateless Requests**: Each POST is independent

## Common Mistakes

1. **Using `server.request()`**: This is for making outgoing requests, not handling incoming ones
2. **Not storing transports**: Each SSE connection needs to be tracked
3. **Missing session ID**: Client must include sessionId in POST requests
4. **Not cleaning up**: Remove transports when connections close

## Testing

```bash
# Start server
npm start

# Test SSE connection
curl -N http://localhost:3000/sse

# Send message (use sessionId from SSE response)
curl -X POST http://localhost:3000/messages?sessionId=xxx \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}'
```

## Migration from stdio

When converting from stdio to HTTP:

1. Replace stdio transport with SSEServerTransport
2. Add Express routes for /sse and /messages
3. Add session management for multiple clients
4. Update deployment configuration for HTTP server

## Notes for Smithery Deployment

- Ensure PORT environment variable is respected
- Add health check endpoint for monitoring
- Log to files instead of console for debugging
- Handle API tokens through query parameters or headers