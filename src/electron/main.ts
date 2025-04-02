import { app, ipcMain, protocol, BrowserWindow, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import Sharp from 'sharp';
import Store  from 'electron-store';

// Initialize the store with a schema
const store = new Store({
    name: 'metadata-store', // specific name for the store
    defaults: {
        metadata: {} // default empty metadata object
    }
});

const tempMetadataDir = path.join(app.getPath('temp'), 'app-temp-metadata');

app.whenReady().then(() => {
  // Create temp metadata directory
  if (!existsSync(tempMetadataDir)) {
    mkdirSync(tempMetadataDir, { recursive: true });
  }

  // Register protocol handler
  protocol.registerFileProtocol('local-file', (request, callback) => {
    try {
      const filePath = decodeURIComponent(request.url.slice('local-file://'.length));
      console.log('Attempting to load file:', filePath);
      callback({ path: filePath });
    } catch (error) {
      console.error('Protocol handler error:', error);
      callback({ error: -2 });
    }
  });

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      preload: getPreloadPath(),
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5000');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
  }
});

ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  });
  return canceled ? [] : filePaths;
});

// Add this function for thumbnail generation
async function generateThumbnail(filePath: string): Promise<string> {
  const thumbnailsDir = path.join(app.getPath('userData'), 'thumbnails');
  
  // Create thumbnails directory if it doesn't exist
  if (!existsSync(thumbnailsDir)) {
    mkdirSync(thumbnailsDir);
  }

  const thumbnailName = `${Buffer.from(filePath).toString('base64')}.jpg`;
  const thumbnailPath = path.join(thumbnailsDir, thumbnailName);

  // Generate thumbnail if it doesn't exist
  if (!existsSync(thumbnailPath)) {
    await Sharp(filePath)
      .resize(200, 150, {  // Smaller size for grid view
        fit: 'fill',
        // position: 'centre'
      })
      .jpeg({ 
        quality: 80,
        chromaSubsampling: '4:4:4'  // Better quality for small images
      })
      .toFile(thumbnailPath);
  }

  return thumbnailPath;
}

// Add this IPC handler
ipcMain.handle('generate-thumbnail', async (_, filePath: string) => {
  try {
    const thumbnailPath = await generateThumbnail(filePath);
    return thumbnailPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
});

// Add these IPC handlers
ipcMain.handle('get-settings', (_, key: string) => {
  console.log('Getting settings for key:', key);
  const value = store.get(key);
  console.log('Retrieved settings:', value);
  return value;
});

ipcMain.handle('save-settings', (_, key: string, value: any) => {
  console.log('Saving settings:', { key, value });
  store.set(key, value);
});

// Add this IPC handler for reading files
ipcMain.handle('read-file-base64', async (_event, filePath: string) => {
  try {
    // Read the file as a buffer
    const buffer = await fs.readFile(filePath);
    
    // Convert to base64
    const base64String = buffer.toString('base64');
    
    // For images, we should include the data URL prefix
    const extension = path.extname(filePath).toLowerCase();
    const mimeType = getMimeType(extension);
    const dataUrl = `data:${mimeType};base64,${base64String}`;
    
    return dataUrl;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

// Helper function to get MIME type
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}

// Add this function for image resizing
async function resizeImageForAI(filePath: string): Promise<string> {
  const size = 256;  // Standard size for most AI vision models
  
  const tempDir = path.join(app.getPath('temp'), 'ai-processing');
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }
  
  const tempFileName = `${Date.now()}-${path.basename(filePath)}`;
  const tempFilePath = path.join(tempDir, tempFileName);

  // Resize the image with optimized settings for AI processing
  await Sharp(filePath)
    .resize(size, size, {
      fit: 'contain',     // Changed to 'contain' to ensure the entire image is visible
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background for padding
      withoutEnlargement: true
    })
    .jpeg({ 
      quality: 80,        // Slightly increased quality since file size will be smaller anyway
      mozjpeg: true,
      chromaSubsampling: '4:2:0'
    })
    .toFile(tempFilePath);

  const buffer = await fs.readFile(tempFilePath);
  const base64 = buffer.toString('base64');
  
  // Clean up the temporary file
  await fs.unlink(tempFilePath).catch(console.error);
  
  return base64;
}

// Add this IPC handler
ipcMain.handle('resize-image-for-ai', async (_, filePath: string) => {
  try {
    return await resizeImageForAI(filePath);
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
});

// Add these handlers for metadata operations
ipcMain.handle('get-file-metadata', async (_, filePath: string) => {
  try {
    // Create a safe key from the file path
    const key = Buffer.from(filePath).toString('base64');
    console.log('Getting metadata with key:', key);
    
    // Retrieve metadata
    const metadata = store.get(`metadata.${key}`);
    console.log('Retrieved metadata:', metadata);
    
    return metadata || null; // Return null instead of undefined if not found
  } catch (error) {
    console.error('Failed to get metadata:', error);
    throw error;
  }
});

ipcMain.handle('save-file-metadata', async (_, filePath: string, metadata: any) => {
  try {
    // Create a safe key from the file path
    const key = Buffer.from(filePath).toString('base64');
    console.log('Saving metadata with key:', key);
    
    // Store metadata
    store.set(`metadata.${key}`, metadata);
    
    // Verify the save
    const saved = store.get(`metadata.${key}`);
    console.log('Verified saved metadata:', saved);
    
    return true;
  } catch (error) {
    console.error('Failed to save metadata:', error);
    throw error;
  }
});

// Add a handler to clear specific metadata
ipcMain.handle('clear-file-metadata', async (_event, filePath: string) => {
  try {
    const metadataPath = path.join(
      tempMetadataDir,
      `${Buffer.from(filePath).toString('base64')}.json`
    );
    
    if (existsSync(metadataPath)) {
      await fs.unlink(metadataPath);
    }
    return true;
  } catch (error) {
    console.error('Error clearing metadata:', error);
    throw error;
  }
});

// Clean up temp files when app closes
app.on('will-quit', () => {
  try {
    if (existsSync(tempMetadataDir)) {
      rmSync(tempMetadataDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('Error cleaning up temp metadata:', error);
  }
});

// Prevent window from being garbage collected
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('minimize-window', () => {
  const win = BrowserWindow.getFocusedWindow()
  win?.minimize()
})

ipcMain.on('maximize-window', () => {
  const win = BrowserWindow.getFocusedWindow()
  if (win?.isMaximized()) {
    win.unmaximize()
  } else {
    win?.maximize()
  }
})

ipcMain.on('close-window', () => {
  const win = BrowserWindow.getFocusedWindow()
  win?.close()
})
