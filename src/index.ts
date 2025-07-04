#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createToolDefinitions } from "./tools.js";
import { setupRequestHandlers } from "./requestHandler.js";
import * as HFService from "./huggingFaceService.js";

// Simple logging function
export function logToFile(message: string): void {
  // For stdio MCP servers, we avoid file logging to prevent interference
  // console.error could be used for debugging but should be minimal
}

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

// Set up configuration from environment variables
const config = {
  apiToken: process.env.HUGGINGFACE_API_TOKEN
};
HFService.setConfig(config);

// Create tool definitions
const TOOLS = createToolDefinitions();

async function main() {
  // Setup request handlers inside main function to avoid top-level await
  await setupRequestHandlers(server, TOOLS);
  
  // Use stdio transport for MCP protocol compliance
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(error => {
  console.error("Error starting server:", error);
  process.exit(1);
}); 