#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createToolDefinitions } from "./tools.js";
import { setupRequestHandlers } from "./requestHandler.js";
import * as HFService from "./huggingFaceService.js";
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import express from 'express';

// Set up logging to a file instead of console
const logDir = path.join(os.tmpdir(), 'huggingface-mcp-server-logs');
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (error) {
  // Silently fail if we can't create the log directory
}

const logFile = path.join(logDir, 'huggingface-mcp-server.log');

export function logToFile(message: string): void {
  try {
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
  } catch (error) {
    // Silently fail if we can't write to the log file
  }
}

// Store active transports by session ID
const transports = new Map<string, SSEServerTransport>();

/**
 * Main function to run the Hugging Face Hub MCP server
 */
async function runServer() {
  try {
    const app = express();
    app.use(express.json());

    // Parse configuration from query parameters
    app.use((req: any, res: any, next: any) => {
      const config = {
        apiToken: req.query.huggingface_api_token as string || process.env.HUGGINGFACE_API_TOKEN
      };
      HFService.setConfig(config);
      next();
    });

    // Initialize the MCP server
    const server = new Server(
      {
        name: "huggingface-hub-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    // Set error handler
    server.onerror = (error) => logToFile(`[MCP Error] ${error}`);

    // Create tool definitions and setup handlers
    const TOOLS = createToolDefinitions();
    await setupRequestHandlers(server, TOOLS);

    // SSE endpoint for establishing connection
    app.get('/sse', async (req: any, res: any) => {
      try {
        // Create SSE transport with the messages endpoint
        const transport = new SSEServerTransport('/messages', res);
        
        // Store transport by session ID
        transports.set(transport.sessionId, transport);
        
        // Set up transport cleanup on close
        transport.onclose = () => {
          transports.delete(transport.sessionId);
          logToFile(`SSE connection closed for session ${transport.sessionId}`);
        };
        
        // Connect server to transport
        await server.connect(transport);
        logToFile(`SSE connection established for session ${transport.sessionId}`);
      } catch (error) {
        logToFile(`SSE connection error: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({ error: 'Failed to establish SSE connection' });
      }
    });

    // Messages endpoint for handling client requests
    app.post('/messages', async (req: any, res: any) => {
      try {
        // Extract session ID from query parameters
        const sessionId = req.query.sessionId as string;
        
        if (!sessionId) {
          res.status(400).json({ error: 'Missing sessionId parameter' });
          return;
        }
        
        // Get the transport for this session
        const transport = transports.get(sessionId);
        
        if (!transport) {
          res.status(404).json({ error: 'Session not found. Please establish SSE connection first.' });
          return;
        }
        
        // Handle the message through the transport
        await transport.handlePostMessage(req, res);
      } catch (error) {
        logToFile(`Message handling error: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    // Health check endpoint
    app.get('/health', (req: any, res: any) => {
      res.json({ status: 'ok', activeSessions: transports.size });
    });

    // Basic MCP endpoint for direct JSON-RPC over HTTP (Smithery compatibility)
    app.post('/mcp', async (req: any, res: any) => {
      try {
        const message = req.body;
        logToFile(`Received MCP request: ${JSON.stringify(message)}`);
        
        // Handle based on method
        if (message.method === 'tools/list') {
          const TOOLS = createToolDefinitions();
          res.json({
            jsonrpc: "2.0",
            id: message.id,
            result: {
              tools: Object.values(TOOLS)
            }
          });
        } else if (message.method === 'tools/call') {
          // This would need to be implemented to handle tool calls
          // For now, just return an error
          res.json({
            jsonrpc: "2.0",
            id: message.id,
            error: {
              code: -32601,
              message: "Method not implemented for /mcp endpoint"
            }
          });
        } else {
          res.json({
            jsonrpc: "2.0",
            id: message.id,
            error: {
              code: -32601,
              message: "Method not found"
            }
          });
        }
      } catch (error) {
        logToFile(`MCP endpoint error: ${error instanceof Error ? error.message : String(error)}`);
        res.status(500).json({ 
          jsonrpc: "2.0",
          id: req.body?.id || null,
          error: {
            code: -32603,
            message: "Internal error",
            data: error instanceof Error ? error.message : String(error)
          }
        });
      }
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logToFile(`Hugging Face Hub MCP Server started on port ${port}`);
      console.log(`Hugging Face Hub MCP Server running on port ${port}`);
      console.log(`SSE endpoint: http://localhost:${port}/sse`);
      console.log(`Messages endpoint: http://localhost:${port}/messages`);
    });
    
  } catch (error) {
    logToFile(`Server failed to start: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run the server
runServer().catch((error) => {
  logToFile(`Server failed to start: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}); 