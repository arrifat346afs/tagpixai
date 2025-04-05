import { app, ipcMain, protocol, BrowserWindow, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import Sharp from 'sharp';
import Store from 'electron-store';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the store with a schema
const store = new Store({
    name: 'metadata-store',
    defaults: {
        settings: {
            metadata: {},
            api: {}
        },
        generatedMetadata: {}
    }
});

const tempMetadataDir = path.join(app.getPath('temp'), 'app-temp-metadata');
const thumbnailsDir = path.join(app.getPath('userData'), 'thumbnails');

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
    icon: path.join(__dirname, 'assets', 'TagPix AI.icns'),
    frame: false,
    webPreferences: {
      preload: getPreloadPath(),
      webSecurity: true,
    }
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5000');
  } else {
    // Ensure proper path resolution in production
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    mainWindow.webContents.openDevTools();
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
  const value = store.get(`settings.${key}`);
  console.log('Retrieved settings:', value);
  return value;
});

ipcMain.handle('save-settings', (_, key: string, value: any) => {
  console.log('Saving settings:', { key, value });
  store.set(`settings.${key}`, value);
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

// Function for image resizing optimized for AI processing
async function resizeImageForAI(filePath: string): Promise<string> {
  // Get image metadata for logging purposes
  const metadata = await Sharp(filePath).metadata();

  const tempDir = path.join(app.getPath('temp'), 'ai-processing');
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  const tempFileName = `${Date.now()}-${path.basename(filePath)}`;
  const tempFilePath = path.join(tempDir, tempFileName);

  // Fixed size of 225 pixels for all images
  const targetSize = 256;

  // Fixed quality setting - balanced for size and quality
  const quality = 70;

  // Log original image info
  const originalSizeMB = (metadata.size || 0) / (1024 * 1024);
  console.log(`Processing image: ${path.basename(filePath)} (${originalSizeMB.toFixed(2)}MB, ${metadata.width}x${metadata.height})`);

  // Resize the image with optimized settings for AI processing
  await Sharp(filePath)
    .resize(targetSize, targetSize, {
      fit: 'contain',     // Ensure the entire image is visible
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background for padding
      withoutEnlargement: false // Allow upscaling small images to the target size
    })
    .jpeg({
      quality,            // Fixed quality for all images
      mozjpeg: true,      // Use mozjpeg for better compression
      progressive: true,  // Progressive loading
      chromaSubsampling: '4:2:0', // Standard subsampling for compression
      trellisQuantisation: true,  // Additional compression
      overshootDeringing: true,   // Reduce ringing artifacts
      optimizeScans: true         // Optimize progressive scans
    })
    .toFile(tempFilePath);

  console.log(`Image resized to ${targetSize}x${targetSize} pixels with quality: ${quality}`);

  const buffer = await fs.readFile(tempFilePath);
  const base64 = buffer.toString('base64');

  // Clean up the temporary file
  await fs.unlink(tempFilePath).catch(console.error);

  // Log the size reduction
  const originalSize = metadata.size || 0;
  const newSize = buffer.length;
  const reductionPercent = ((originalSize - newSize) / originalSize * 100).toFixed(2);
  console.log(`Image optimized: ${reductionPercent}% reduction (${(originalSize/1024/1024).toFixed(2)}MB → ${(newSize/1024/1024).toFixed(2)}MB)`);

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
    const key = Buffer.from(filePath).toString('base64');
    console.log('Getting metadata with key:', key);
    const metadata = store.get(`generatedMetadata.${key}`);
    console.log('Retrieved metadata:', metadata);
    return metadata || null;
  } catch (error) {
    console.error('Failed to get metadata:', error);
    throw error;
  }
});

ipcMain.handle('save-file-metadata', async (_, filePath: string, metadata: any) => {
  try {
    const key = Buffer.from(filePath).toString('base64');
    console.log('Saving metadata with key:', key);
    store.set(`generatedMetadata.${key}`, metadata);
    return true;
  } catch (error) {
    console.error('Failed to save metadata:', error);
    throw error;
  }
});

// Clean up temp files when app closes
app.on('will-quit', () => {
  try {
    // Clean up temp metadata directory
    if (existsSync(tempMetadataDir)) {
      rmSync(tempMetadataDir, { recursive: true, force: true });
    }

    // Clean up thumbnails directory
    if (existsSync(thumbnailsDir)) {
      rmSync(thumbnailsDir, { recursive: true, force: true });
    }

    // Only clear generated metadata, not settings
    store.set('generatedMetadata', {});

    console.log('Successfully cleared AI-generated content on quit');
  } catch (error) {
    console.error('Error cleaning up AI-generated content:', error);
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
