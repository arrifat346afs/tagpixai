import { ipcMain } from "electron";
import { BrowserWindow, dialog, app } from "electron";
import { generateThumbnail } from "../Thumbnail/generateThumbnail.js";
import { getMimeType, store, tempCategoryStore } from "../main.js";
import fs from "fs/promises";
import path from "path";
import { embedMetadata } from '../metadata/embedMetadata.js';
import { resizeImageForAI } from "../resizeImage/resizeImageForAI.js";
// import fetch from "node-fetch";
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

ipcMain.on("minimize-window", () => {
  const win = BrowserWindow.getFocusedWindow();
  win?.minimize();
});

ipcMain.on("maximize-window", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.on("close-window", () => {
  const win = BrowserWindow.getFocusedWindow();
  win?.close();
});

// Add handler for checking if window is maximized
ipcMain.handle("is-maximized", () => {
  try {
    const win = BrowserWindow.getFocusedWindow();
    return win ? win.isMaximized() : false;
  } catch (error) {
    console.error("Error checking maximized state:", error);
    return false;
  }
});

// Add handler for checking if window is focused
ipcMain.handle("is-focused", () => {
  try {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) {
      return false;
    }
    return win.isFocused();
  } catch (error) {
    console.error(error);
    return false;
  }
});

ipcMain.handle("open-file-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "Media Files",
        extensions: [
          // Images
          "jpg",
          "jpeg",
          "png",
          "gif",
          "webp",
          "bmp",
          // Videos
          "mp4",
          "mov",
          "avi",
          "mkv",
        ],
      },
    ],
  });
  return result.filePaths;
});

ipcMain.handle("open-directory-dialog", async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
    });
    console.log("Directory dialog result:", result); // Add logging for debugging
    return result.canceled ? [] : result.filePaths;
  } catch (error) {
    console.error("Directory dialog error:", error);
    throw error; // Propagate error to renderer
  }
});


ipcMain.handle("generate-thumbnail", async (_, filePath: string) => {
  try {
    const result = await generateThumbnail(filePath);
    return result.path;
  } catch (error) {
    console.error("IPC generate-thumbnail error:", error);
    throw error; // This will be caught by the renderer process
  }
});

// Add these IPC handlers
ipcMain.handle("get-settings", (_, key: string) => {
  console.log("Getting settings for key:", key);
  const value = store.get(`settings.${key}`);
  console.log("Retrieved settings:", value);
  return value;
});

ipcMain.handle("save-settings", (_, key: string, value: any) => {
  console.log("Saving settings:", { key, value });
  store.set(`settings.${key}`, value);
});

// Add this IPC handler for reading files
ipcMain.handle("read-file-base64", async (_event, filePath: string) => {
  try {
    // Read the file as a buffer
    const buffer = await fs.readFile(filePath);

    // Convert to base64
    const base64String = buffer.toString("base64");

    // For images, we should include the data URL prefix
    const extension = path.extname(filePath).toLowerCase();
    const mimeType = getMimeType(extension);
    const dataUrl = `data:${mimeType};base64,${base64String}`;

    return dataUrl;
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
});


ipcMain.handle("resize-image-for-ai", async (_, filePath: string) => {
  try {
    return await resizeImageForAI(filePath);
  } catch (error) {
    console.error("Error in resize-image-for-ai handler:", error);
    throw error;
  }
});

ipcMain.handle("get-file-metadata", async (_, filePath: string) => {
  try {
    const key = Buffer.from(filePath).toString("base64");
    console.log("Getting metadata with key:", key);
    const metadata = store.get(`generatedMetadata.${key}`);
    console.log("Retrieved metadata:", metadata);
    return metadata || null;
  } catch (error) {
    console.error("Failed to get metadata:", error);
    throw error;
  }
});

ipcMain.handle(
  "save-file-metadata",
  async (_, filePath: string, metadata: any) => {
    try {
      const key = Buffer.from(filePath).toString("base64");
      console.log("Saving metadata with key:", key);
      store.set(`generatedMetadata.${key}`, metadata);
      return true;
    } catch (error) {
      console.error("Failed to save metadata:", error);
      throw error;
    }
  }
);

// Add this IPC handler for saving CSV files
ipcMain.handle(
  "save-csv-file",
  async (_, filePath: string, content: string) => {
    try {
      await fs.writeFile(filePath, content, "utf-8");
      return true;
    } catch (error) {
      console.error("Error saving CSV file:", error);
      throw error;
    }
  }
);

// Add these IPC handlers
ipcMain.handle(
  "save-temp-categories",
  async (_, filePath: string, categories: any) => {
    const currentCategories = tempCategoryStore.get("categories") as Record<
      string,
      any
    >;
    currentCategories[filePath] = categories;
    tempCategoryStore.set("categories", currentCategories);
    console.log("Saved temp categories:", categories);
  }
);

ipcMain.handle("get-temp-categories", async (_, filePath: string) => {
  const categories = tempCategoryStore.get("categories") as Record<string, any>;
  return categories[filePath] || null;
});


ipcMain.handle('embed-metadata', async (_, filePath: string, metadata: any) => {
  try {
    console.log(`Starting metadata embedding for: ${filePath}`);
    console.log('Metadata to embed:', metadata);
    console.log('App is packaged:', app.isPackaged);
    console.log('Process resourcesPath:', process.resourcesPath);
    console.log('Process platform:', process.platform);

    // Add a timeout wrapper to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Metadata embedding timed out after 90 seconds')), 90000);
    });

    const embedPromise = embedMetadata(filePath, metadata);

    // Race between the embed operation and timeout
    await Promise.race([embedPromise, timeoutPromise]);

    console.log(`Successfully embedded metadata for: ${filePath}`);
    return { success: true };
  } catch (error) {
    console.error('Error embedding metadata:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to embed metadata for ${filePath}: ${errorMessage}`);

    // Log additional debugging info for AppImage issues
    if (errorMessage.includes('spawn') || errorMessage.includes('ENOENT') || errorMessage.includes('timeout')) {
      console.error('This appears to be an ExifTool binary or process issue');
      console.error('Check if ExifTool is properly bundled in the AppImage');
    }

    return { success: false, error: errorMessage };
  }
});

