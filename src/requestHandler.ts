import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { 
  Tool, 
  CallToolRequestSchema, 
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { logToFile } from "./index.js";
import * as HFService from "./huggingFaceService.js";

/**
 * Generate a UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Setup request handlers for the MCP server
 */
export async function setupRequestHandlers(
  server: Server,
  tools: Record<string, Tool>,
): Promise<void> {
  // Handle tool listing
  server.setRequestHandler(
    ListToolsRequestSchema,
    async () => {
      return {
        tools: Object.values(tools),
      };
    }
  );

  // Handle tool calls
  server.setRequestHandler(
    CallToolRequestSchema,
    async (request) => {
      const toolName = request.params.name;
      const toolParams = request.params.arguments || {};

      // Check if the tool exists
      if (!tools[toolName]) {
        throw new Error(`Tool '${toolName}' not found`);
      }

      logToFile(`Tool called: ${toolName} with params: ${JSON.stringify(toolParams)}`);

      // Execute the tool based on its name
      switch (toolName) {
        case "list-my-spaces":
          return await handleListMySpaces();
        
        case "get-spaces-by-user":
          return await handleGetSpacesByUser(toolParams);
        
        case "get-space":
          return await handleGetSpace(toolParams);
        
        case "create-space":
          return await handleCreateSpace(toolParams);
        
        case "duplicate-space":
          return await handleDuplicateSpace(toolParams);
        
        case "update-space":
          return await handleUpdateSpace(toolParams);
        
        case "delete-space":
          return await handleDeleteSpace(toolParams);
        
        case "get-space-hardware":
          return await handleGetSpaceHardware();
        
        case "list-space-files":
          return await handleListSpaceFiles(toolParams);
        
        case "get-space-file":
          return await handleGetSpaceFile(toolParams);
        
        case "upload-text-file":
          return await handleUploadTextFile(toolParams);
        
        case "upload-file":
          return await handleUploadFile(toolParams);
        
        case "delete-space-file":
          return await handleDeleteSpaceFile(toolParams);
        
        case "get-space-logs":
          return await handleGetSpaceLogs(toolParams);
        
        case "restart-space":
          return await handleRestartSpace(toolParams);
        
        case "pause-space":
          return await handlePauseSpace(toolParams);
        
        case "search-spaces":
          return await handleSearchSpaces(toolParams);
        
        case "rename-space":
          return await handleRenameSpace(toolParams);
        
        case "get-space-runtimes":
          return await handleGetSpaceRuntimes();
        
        default:
          throw new Error(`Tool handler for '${toolName}' not implemented`);
      }
    }
  );
}

/**
 * Handle the list-my-spaces tool
 */
async function handleListMySpaces() {
  try {
    const spaces = await HFService.getMySpaces();
    return { spaces };
  } catch (error) {
    logToFile(`Error in handleListMySpaces: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the get-spaces-by-user tool
 */
async function handleGetSpacesByUser(params: any) {
  try {
    const { user } = params;
    const spaces = await HFService.getSpacesByUser(user);
    return { spaces };
  } catch (error) {
    logToFile(`Error in handleGetSpacesByUser: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the get-space tool
 */
async function handleGetSpace(params: any) {
  try {
    const { spaceId } = params;
    const space = await HFService.getSpaceById(spaceId);
    return { space };
  } catch (error) {
    logToFile(`Error in handleGetSpace: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the create-space tool
 */
async function handleCreateSpace(params: any) {
  try {
    const {
      name,
      organization,
      private: isPrivate,
      sdk,
      hardwareType
    } = params;
    
    const creationParams: HFService.SpaceCreationParams = {
      name,
      organization,
      private: isPrivate,
      sdk,
      hardwareType
    };
    
    const space = await HFService.createSpace(creationParams);
    return { 
      space,
      message: `Space ${space.id} created successfully` 
    };
  } catch (error) {
    logToFile(`Error in handleCreateSpace: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the duplicate-space tool
 */
async function handleDuplicateSpace(params: any) {
  try {
    const {
      sourceSpaceId,
      name,
      organization,
      private: isPrivate,
      sdk,
      hardwareType
    } = params;
    
    const creationParams: HFService.SpaceCreationParams = {
      name,
      organization,
      private: isPrivate,
      sdk,
      hardwareType
    };
    
    const space = await HFService.duplicateSpace(sourceSpaceId, creationParams);
    return { 
      space,
      message: `Space ${space.id} duplicated successfully from ${sourceSpaceId}` 
    };
  } catch (error) {
    logToFile(`Error in handleDuplicateSpace: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the update-space tool
 */
async function handleUpdateSpace(params: any) {
  try {
    const { spaceId, ...updateParams } = params;
    
    const space = await HFService.updateSpace(spaceId, updateParams as HFService.SpaceUpdateParams);
    return { 
      space,
      message: `Space ${spaceId} updated successfully` 
    };
  } catch (error) {
    logToFile(`Error in handleUpdateSpace: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the delete-space tool
 */
async function handleDeleteSpace(params: any) {
  try {
    const { spaceId } = params;
    
    await HFService.deleteSpace(spaceId);
    return { 
      success: true,
      message: `Space ${spaceId} deleted successfully` 
    };
  } catch (error) {
    logToFile(`Error in handleDeleteSpace: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the get-space-hardware tool
 */
async function handleGetSpaceHardware() {
  try {
    const hardware = await HFService.getSpaceHardware();
    return { hardware };
  } catch (error) {
    logToFile(`Error in handleGetSpaceHardware: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the list-space-files tool
 */
async function handleListSpaceFiles(params: any) {
  try {
    const { spaceId, path = '' } = params;
    
    const files = await HFService.listSpaceFiles(spaceId, path);
    return { 
      files,
      path,
      spaceId 
    };
  } catch (error) {
    logToFile(`Error in handleListSpaceFiles: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the get-space-file tool
 */
async function handleGetSpaceFile(params: any) {
  try {
    const { spaceId, path } = params;
    
    const fileParams: HFService.SpaceFileOperationParams = {
      spaceId,
      path
    };
    
    const content = await HFService.getSpaceFileContent(fileParams);
    return { 
      content,
      path,
      spaceId 
    };
  } catch (error) {
    logToFile(`Error in handleGetSpaceFile: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the upload-text-file tool
 */
async function handleUploadTextFile(params: any) {
  try {
    const { spaceId, path, content } = params;
    
    const fileParams: HFService.SpaceFileOperationParams = {
      spaceId,
      path,
      content
    };
    
    await HFService.uploadFileToSpace(fileParams);
    return { 
      success: true,
      message: `File ${path} uploaded successfully to ${spaceId}` 
    };
  } catch (error) {
    logToFile(`Error in handleUploadTextFile: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the upload-file tool
 */
async function handleUploadFile(params: any) {
  try {
    const { spaceId, path, filePath } = params;
    
    const fileParams: HFService.SpaceFileOperationParams = {
      spaceId,
      path,
      filePath
    };
    
    await HFService.uploadFileToSpace(fileParams);
    return { 
      success: true,
      message: `File from ${filePath} uploaded successfully to ${spaceId} at ${path}` 
    };
  } catch (error) {
    logToFile(`Error in handleUploadFile: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the delete-space-file tool
 */
async function handleDeleteSpaceFile(params: any) {
  try {
    const { spaceId, path } = params;
    
    const fileParams: HFService.SpaceFileOperationParams = {
      spaceId,
      path
    };
    
    await HFService.deleteSpaceFile(fileParams);
    return { 
      success: true,
      message: `File ${path} deleted successfully from ${spaceId}` 
    };
  } catch (error) {
    logToFile(`Error in handleDeleteSpaceFile: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the get-space-logs tool
 */
async function handleGetSpaceLogs(params: any) {
  try {
    const { spaceId, count } = params;
    
    const logParams: HFService.SpaceLogParams = {
      spaceId,
      count
    };
    
    const logs = await HFService.getSpaceLogs(logParams);
    return { 
      logs,
      spaceId 
    };
  } catch (error) {
    logToFile(`Error in handleGetSpaceLogs: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the restart-space tool
 */
async function handleRestartSpace(params: any) {
  try {
    const { spaceId, hardwareType } = params;
    
    const restartParams: HFService.SpaceRestartParams = {
      spaceId,
      hardwareType
    };
    
    await HFService.restartSpace(restartParams);
    return { 
      success: true,
      message: `Space ${spaceId} restarted successfully` 
    };
  } catch (error) {
    logToFile(`Error in handleRestartSpace: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the pause-space tool
 */
async function handlePauseSpace(params: any) {
  try {
    const { spaceId } = params;
    
    await HFService.pauseSpace(spaceId);
    return { 
      success: true,
      message: `Space ${spaceId} paused successfully` 
    };
  } catch (error) {
    logToFile(`Error in handlePauseSpace: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the search-spaces tool
 */
async function handleSearchSpaces(params: any) {
  try {
    const { query } = params;
    
    const spaces = await HFService.searchSpaces(query);
    return { 
      spaces,
      query 
    };
  } catch (error) {
    logToFile(`Error in handleSearchSpaces: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the rename-space tool
 */
async function handleRenameSpace(params: any) {
  try {
    const { spaceId, newName } = params;
    
    const space = await HFService.renameSpace(spaceId, newName);
    return { 
      space,
      message: `Space ${spaceId} renamed successfully to ${newName}` 
    };
  } catch (error) {
    logToFile(`Error in handleRenameSpace: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Handle the get-space-runtimes tool
 */
async function handleGetSpaceRuntimes() {
  try {
    const runtimes = await HFService.getSpaceRuntimes();
    return { runtimes };
  } catch (error) {
    logToFile(`Error in handleGetSpaceRuntimes: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
} 