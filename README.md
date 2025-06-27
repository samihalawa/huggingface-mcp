# Hugging Face Hub MCP Server

This is a Model Context Protocol (MCP) server for interacting with the Hugging Face Hub API, focusing on managing Spaces.

## Features

- List, create, update, and delete Hugging Face Spaces
- Manage files within Spaces (list, get, upload, delete)
- Get Space logs and runtime information
- Search for Spaces
- Change Space settings (hardware, privacy, SDK)
- Duplicate existing Spaces
- Restart and pause Spaces

## Installation

1. Clone this repository
2. Install dependencies:

```bash
cd mcp-server-huggingface
npm install
```

3. Build the TypeScript code:

```bash
npm run build
```

## Usage

Start the server:

```bash
npm start
```

## Available Tools

The following MCP tools are available:

### Space Management

- `list-my-spaces`: List all Hugging Face spaces for the authenticated user
- `get-spaces-by-user`: List Hugging Face spaces by a specific user or organization
- `get-space`: Get details about a specific Hugging Face space
- `create-space`: Create a new Hugging Face space
- `duplicate-space`: Duplicate an existing Hugging Face space
- `update-space`: Update metadata of a Hugging Face space
- `delete-space`: Delete a Hugging Face space
- `rename-space`: Rename a Hugging Face space

### Space Configuration

- `get-space-hardware`: Get available hardware options for Hugging Face spaces
- `get-space-runtimes`: Get available runtime options for Hugging Face spaces
- `restart-space`: Restart a Hugging Face space
- `pause-space`: Pause a running Hugging Face space

### File Management

- `list-space-files`: List files in a Hugging Face space
- `get-space-file`: Get the content of a file from a Hugging Face space
- `upload-text-file`: Upload text content to a file in a Hugging Face space
- `upload-file`: Upload a file from the local filesystem to a Hugging Face space
- `delete-space-file`: Delete a file from a Hugging Face space

### Space Inspection

- `get-space-logs`: Get logs for a Hugging Face space
- `search-spaces`: Search for Hugging Face spaces

## Example Tool Calls

### Listing Your Spaces

```json
{
  "name": "list-my-spaces",
  "arguments": {}
}
```

### Creating a New Space

```json
{
  "name": "create-space",
  "arguments": {
    "name": "my-demo-space",
    "private": true,
    "sdk": "gradio"
  }
}
```

### Uploading a File to a Space

```json
{
  "name": "upload-text-file",
  "arguments": {
    "spaceId": "username/my-demo-space",
    "path": "app.py",
    "content": "import gradio as gr\n\ndef greet(name):\n    return \"Hello, \" + name + \"!\"\n\ndemo = gr.Interface(fn=greet, inputs=\"text\", outputs=\"text\")\ndemo.launch()"
  }
}
```

### Getting Space Logs

```json
{
  "name": "get-space-logs",
  "arguments": {
    "spaceId": "username/my-demo-space",
    "count": 50
  }
}
```

## Notes

- This MCP server uses a hardcoded API token for authentication.
- All operations are performed using this API token.

## License

MIT 