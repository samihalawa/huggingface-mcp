import axios from 'axios';
import FormData from 'form-data';
import { logToFile } from './index.js';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://huggingface.co/api';

// Create axios instance without authentication initially
let api = axios.create({
  baseURL: BASE_URL
});

// Configuration management
let currentConfig: { apiToken?: string } = {};

export function setConfig(config: { apiToken?: string }) {
  currentConfig = config;
  
  // Update axios instance with new authentication
  api = axios.create({
    baseURL: BASE_URL,
    headers: currentConfig.apiToken ? {
      'Authorization': `Bearer ${currentConfig.apiToken}`
    } : {}
  });
}

function requireAuth(): void {
  if (!currentConfig.apiToken) {
    throw new Error('HuggingFace API token is required for this operation');
  }
}

export interface Space {
  id: string;
  owner: string;
  name: string;
  modelId?: string;
  private: boolean;
  cardData?: any;
  lastModified?: string;
  likes?: number;
  sdk?: string;
  runtime?: {
    stage: string;
    hardware: {
      current: string;
    };
  };
}

export interface User {
  name: string;
  fullname?: string;
  email?: string;
  [key: string]: any;
}

export interface SpaceHardware {
  name: string;
  description: string;
}

export interface SpaceRuntime {
  runtime: string;
  version: string;
}

export interface SpaceCreationParams {
  name: string;
  organization?: string;
  private?: boolean;
  sdk?: string;
  hardwareType?: string;
}

export interface SpaceUpdateParams {
  private?: boolean;
  title?: string;
  emoji?: string;
  colorFrom?: string;
  colorTo?: string;
  pinned?: boolean;
  sdk?: string;
  duplicateFrom?: string;
  hardwareType?: string;
}

export interface SpaceFileOperationParams {
  spaceId: string;
  path: string;
  content?: string;
  filePath?: string;
}

export interface SpaceLogParams {
  spaceId: string;
  count?: number;
}

export interface SpaceRestartParams {
  spaceId: string;
  hardwareType?: string;
}

/**
 * Get all spaces for the authenticated user
 */
export async function getMySpaces(): Promise<Space[]> {
  requireAuth();
  try {
    // Use the /me endpoint to get user info first
    const userResponse = await api.get('/me');
    const userData = userResponse.data as User;
    const username = userData.name;
    
    // Then get spaces for this user
    const response = await api.get(`/spaces?owner=${username}`);
    return response.data as Space[];
  } catch (error) {
    logToFile(`Error getting spaces: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Get spaces by user/organization
 */
export async function getSpacesByUser(user: string): Promise<Space[]> {
  try {
    const response = await api.get(`/spaces?owner=${user}`);
    return response.data as Space[];
  } catch (error) {
    logToFile(`Error getting spaces for user ${user}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Get a specific space by ID
 */
export async function getSpaceById(spaceId: string): Promise<Space> {
  try {
    const response = await api.get(`/spaces/${spaceId}`);
    return response.data as Space;
  } catch (error) {
    logToFile(`Error getting space ${spaceId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Create a new space
 */
export async function createSpace(params: SpaceCreationParams): Promise<Space> {
  requireAuth();
  try {
    const payload = {
      name: params.name,
      organization: params.organization,
      private: params.private ?? false,
      sdk: params.sdk || 'gradio',
      hardware: params.hardwareType || 'cpu-basic'
    };
    
    const response = await api.post('/spaces/create', payload);
    return response.data as Space;
  } catch (error) {
    logToFile(`Error creating space: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Duplicate a space
 */
export async function duplicateSpace(sourceSpaceId: string, params: SpaceCreationParams): Promise<Space> {
  requireAuth();
  try {
    // Create a new space first
    const newSpace = await createSpace(params);
    const newSpaceId = `${params.organization || newSpace.owner}/${params.name}`;
    
    // Use the duplicate endpoint
    await api.post(`/spaces/${newSpaceId}/duplicate`, { 
      from: sourceSpaceId 
    });
    
    return getSpaceById(newSpaceId);
  } catch (error) {
    logToFile(`Error duplicating space: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Update a space's metadata
 */
export async function updateSpace(spaceId: string, params: SpaceUpdateParams): Promise<Space> {
  requireAuth();
  try {
    const response = await api.put(`/spaces/${spaceId}`, params);
    return response.data as Space;
  } catch (error) {
    logToFile(`Error updating space ${spaceId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Delete a space
 */
export async function deleteSpace(spaceId: string): Promise<void> {
  requireAuth();
  try {
    await api.delete(`/spaces/${spaceId}`);
  } catch (error) {
    logToFile(`Error deleting space ${spaceId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Get space hardware options
 */
export async function getSpaceHardware(): Promise<SpaceHardware[]> {
  try {
    const response = await api.get('/spaces/hardware');
    return response.data as SpaceHardware[];
  } catch (error) {
    logToFile(`Error getting space hardware options: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Get files in a space
 */
export async function listSpaceFiles(spaceId: string, path: string = ''): Promise<string[]> {
  requireAuth();
  try {
    const encodedPath = encodeURIComponent(path);
    const response = await api.get(`/spaces/${spaceId}/tree/${encodedPath}`);
    return response.data as string[];
  } catch (error) {
    logToFile(`Error listing files in space ${spaceId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Get file content from a space
 */
export async function getSpaceFileContent(params: SpaceFileOperationParams): Promise<string> {
  requireAuth();
  try {
    const encodedPath = encodeURIComponent(params.path);
    const response = await api.get(`/spaces/${params.spaceId}/raw/${encodedPath}`);
    return response.data as string;
  } catch (error) {
    logToFile(`Error getting file content from space ${params.spaceId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Upload a file to a space
 */
export async function uploadFileToSpace(params: SpaceFileOperationParams): Promise<void> {
  requireAuth();
  try {
    if (params.content) {
      // Upload text content
      await api.post(
        `/spaces/${params.spaceId}/upload/${encodeURIComponent(params.path)}`,
        params.content,
        { headers: { 'Content-Type': 'text/plain' } }
      );
    } else if (params.filePath) {
      // Upload binary file
      const form = new FormData();
      form.append('file', fs.createReadStream(params.filePath));
      
      await api.post(
        `/spaces/${params.spaceId}/upload/${encodeURIComponent(params.path)}`,
        form,
        { headers: { ...form.getHeaders() } }
      );
    } else {
      throw new Error('Either content or filePath must be provided');
    }
  } catch (error) {
    logToFile(`Error uploading file to space ${params.spaceId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Delete a file from a space
 */
export async function deleteSpaceFile(params: SpaceFileOperationParams): Promise<void> {
  requireAuth();
  try {
    const encodedPath = encodeURIComponent(params.path);
    await api.delete(`/spaces/${params.spaceId}/delete/${encodedPath}`);
  } catch (error) {
    logToFile(`Error deleting file from space ${params.spaceId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Get space logs
 */
export async function getSpaceLogs(params: SpaceLogParams): Promise<string> {
  requireAuth();
  try {
    const count = params.count || 100;
    const response = await api.get(`/spaces/${params.spaceId}/logs?n=${count}`);
    return response.data as string;
  } catch (error) {
    logToFile(`Error getting logs for space ${params.spaceId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Restart a space
 */
export async function restartSpace(params: SpaceRestartParams): Promise<void> {
  requireAuth();
  try {
    const payload = params.hardwareType ? { hardware: params.hardwareType } : {};
    await api.post(`/spaces/${params.spaceId}/restart`, payload);
  } catch (error) {
    logToFile(`Error restarting space ${params.spaceId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Pause a space
 */
export async function pauseSpace(spaceId: string): Promise<void> {
  requireAuth();
  try {
    await api.post(`/spaces/${spaceId}/pause`);
  } catch (error) {
    logToFile(`Error pausing space ${spaceId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Search spaces
 */
export async function searchSpaces(query: string): Promise<Space[]> {
  try {
    const response = await api.get(`/spaces?search=${encodeURIComponent(query)}`);
    return response.data as Space[];
  } catch (error) {
    logToFile(`Error searching spaces: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Rename a space
 */
export async function renameSpace(spaceId: string, newName: string): Promise<Space> {
  requireAuth();
  try {
    const response = await api.post(`/spaces/${spaceId}/rename`, { name: newName });
    return response.data as Space;
  } catch (error) {
    logToFile(`Error renaming space ${spaceId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Get available space runtimes
 */
export async function getSpaceRuntimes(): Promise<SpaceRuntime[]> {
  try {
    const response = await api.get('/spaces/runtimes');
    return response.data as SpaceRuntime[];
  } catch (error) {
    logToFile(`Error getting space runtimes: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
} 