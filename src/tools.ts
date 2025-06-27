import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Create tool definitions
 */
export function createToolDefinitions(): Record<string, Tool> {
  return {
    "list-my-spaces": {
      name: "list-my-spaces",
      description: "List all Hugging Face spaces for the authenticated user",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    
    "get-spaces-by-user": {
      name: "get-spaces-by-user",
      description: "List Hugging Face spaces by a specific user or organization",
      inputSchema: {
        type: "object",
        properties: {
          user: {
            type: "string",
            description: "Username or organization to list spaces for"
          }
        },
        required: ["user"]
      }
    },
    
    "get-space": {
      name: "get-space",
      description: "Get details about a specific Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: {
            type: "string",
            description: "The ID of the space (format: 'username/space-name')"
          }
        },
        required: ["spaceId"]
      }
    },
    
    "create-space": {
      name: "create-space",
      description: "Create a new Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name for the new space"
          },
          organization: {
            type: "string",
            description: "Optional organization to create the space under"
          },
          private: {
            type: "boolean",
            description: "Whether the space should be private (default: false)"
          },
          sdk: {
            type: "string",
            description: "SDK to use for the space (e.g., 'gradio', 'streamlit', 'static', 'docker')"
          },
          hardwareType: {
            type: "string",
            description: "Hardware type for the space (e.g., 'cpu-basic', 'gpu-t4')"
          }
        },
        required: ["name"]
      }
    },
    
    "duplicate-space": {
      name: "duplicate-space",
      description: "Duplicate an existing Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          sourceSpaceId: {
            type: "string",
            description: "ID of the space to duplicate (format: 'username/space-name')"
          },
          name: {
            type: "string",
            description: "Name for the new space"
          },
          organization: {
            type: "string",
            description: "Optional organization to create the space under"
          },
          private: {
            type: "boolean",
            description: "Whether the space should be private (default: false)"
          },
          sdk: {
            type: "string",
            description: "SDK to use for the space (e.g., 'gradio', 'streamlit', 'static', 'docker')"
          },
          hardwareType: {
            type: "string",
            description: "Hardware type for the space (e.g., 'cpu-basic', 'gpu-t4')"
          }
        },
        required: ["sourceSpaceId", "name"]
      }
    },
    
    "update-space": {
      name: "update-space",
      description: "Update metadata of a Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: {
            type: "string",
            description: "ID of the space to update (format: 'username/space-name')"
          },
          private: {
            type: "boolean",
            description: "Whether the space should be private"
          },
          title: {
            type: "string",
            description: "Title of the space"
          },
          emoji: {
            type: "string",
            description: "Emoji for the space"
          },
          colorFrom: {
            type: "string",
            description: "Starting color for gradient"
          },
          colorTo: {
            type: "string",
            description: "Ending color for gradient"
          },
          pinned: {
            type: "boolean",
            description: "Whether the space should be pinned"
          },
          sdk: {
            type: "string",
            description: "SDK to use for the space"
          },
          hardwareType: {
            type: "string",
            description: "Hardware type for the space"
          }
        },
        required: ["spaceId"]
      }
    },
    
    "delete-space": {
      name: "delete-space",
      description: "Delete a Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: {
            type: "string",
            description: "ID of the space to delete (format: 'username/space-name')"
          }
        },
        required: ["spaceId"]
      }
    },
    
    "get-space-hardware": {
      name: "get-space-hardware",
      description: "Get available hardware options for Hugging Face spaces",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    
    "list-space-files": {
      name: "list-space-files",
      description: "List files in a Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: {
            type: "string",
            description: "ID of the space (format: 'username/space-name')"
          },
          path: {
            type: "string",
            description: "Path within the space to list files for (default: root)"
          }
        },
        required: ["spaceId"]
      }
    },
    
    "get-space-file": {
      name: "get-space-file",
      description: "Get the content of a file from a Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: {
            type: "string",
            description: "ID of the space (format: 'username/space-name')"
          },
          path: {
            type: "string",
            description: "Path to the file within the space"
          }
        },
        required: ["spaceId", "path"]
      }
    },
    
    "upload-text-file": {
      name: "upload-text-file",
      description: "Upload text content to a file in a Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: {
            type: "string",
            description: "ID of the space (format: 'username/space-name')"
          },
          path: {
            type: "string",
            description: "Path where the file should be created/updated within the space"
          },
          content: {
            type: "string",
            description: "Text content to upload"
          }
        },
        required: ["spaceId", "path", "content"]
      }
    },
    
    "upload-file": {
      name: "upload-file",
      description: "Upload a file from the local filesystem to a Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: {
            type: "string",
            description: "ID of the space (format: 'username/space-name')"
          },
          path: {
            type: "string",
            description: "Path where the file should be created/updated within the space"
          },
          filePath: {
            type: "string",
            description: "Path to the local file to upload"
          }
        },
        required: ["spaceId", "path", "filePath"]
      }
    },
    
    "delete-space-file": {
      name: "delete-space-file",
      description: "Delete a file from a Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: {
            type: "string",
            description: "ID of the space (format: 'username/space-name')"
          },
          path: {
            type: "string",
            description: "Path to the file within the space"
          }
        },
        required: ["spaceId", "path"]
      }
    },
    
    "get-space-logs": {
      name: "get-space-logs",
      description: "Get logs for a Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: {
            type: "string",
            description: "ID of the space (format: 'username/space-name')"
          },
          count: {
            type: "number",
            description: "Number of log lines to retrieve (default: 100)"
          }
        },
        required: ["spaceId"]
      }
    },
    
    "restart-space": {
      name: "restart-space",
      description: "Restart a Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: {
            type: "string",
            description: "ID of the space (format: 'username/space-name')"
          },
          hardwareType: {
            type: "string",
            description: "Optional new hardware type to use when restarting"
          }
        },
        required: ["spaceId"]
      }
    },
    
    "pause-space": {
      name: "pause-space",
      description: "Pause a running Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: {
            type: "string",
            description: "ID of the space (format: 'username/space-name')"
          }
        },
        required: ["spaceId"]
      }
    },
    
    "search-spaces": {
      name: "search-spaces",
      description: "Search for Hugging Face spaces",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query"
          }
        },
        required: ["query"]
      }
    },
    
    "rename-space": {
      name: "rename-space",
      description: "Rename a Hugging Face space",
      inputSchema: {
        type: "object",
        properties: {
          spaceId: {
            type: "string",
            description: "ID of the space (format: 'username/space-name')"
          },
          newName: {
            type: "string",
            description: "New name for the space"
          }
        },
        required: ["spaceId", "newName"]
      }
    },
    
    "get-space-runtimes": {
      name: "get-space-runtimes",
      description: "Get available runtime options for Hugging Face spaces",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    }
  };
} 