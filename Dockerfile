FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY smithery.yaml ./

# Build the project
RUN npm run build

# Set environment
ENV NODE_ENV=production

# Start the MCP server with stdio transport
CMD ["node", "build/index.js"]