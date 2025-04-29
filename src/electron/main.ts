/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, ipcMain, protocol, BrowserWindow, dialog } from "electron";
import path from "path";
// import { fileURLToPath } from 'url';
import fs from "fs/promises";
import { existsSync, mkdirSync, rmSync } from "fs";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import Sharp from "sharp";
import Store from "electron-store";
import ffmpeg_ from "fluent-ffmpeg";

// Get __dirname equivalent in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Initialize the store with a schema
const store = new Store({
  name: "metadata-store",
  defaults: {
    settings: {
      metadata: {},
      api: {},
    },
    generatedMetadata: {},
  },
});

const tempCategoryStore = new Store({
  name: "temp-categories",
  defaults: {
    categories: {},
  },
});

const tempMetadataDir = path.join(app.getPath("temp"), "app-temp-metadata");
const thumbnailsDir = path.join(app.getPath("userData"), "thumbnails");

app.whenReady().then(() => {
  // Create temp metadata directory
  if (!existsSync(tempMetadataDir)) {
    mkdirSync(tempMetadataDir, { recursive: true });
  }

  // Register protocol handler
  protocol.registerFileProtocol("local-file", (request, callback) => {
    try {
      const filePath = decodeURIComponent(
        request.url.slice("local-file:///".length)
      );
      // Convert URL path separators to OS-specific ones
      const normalizedPath = filePath.split("/").join(path.sep);

      console.log("Attempting to load file:", normalizedPath);

      if (!existsSync(normalizedPath)) {
        console.error("File does not exist:", normalizedPath);
        callback({ error: -6 }); // FILE_NOT_FOUND
        return;
      }

      // Set proper headers for video files
      const extension = path.extname(normalizedPath).toLowerCase();
      const mimeType =
        {
          ".mp4": "video/mp4",
          ".mov": "video/quicktime",
          ".avi": "video/x-msvideo",
          ".mkv": "video/x-matroska",
        }[extension] || "application/octet-stream";

      callback({
        path: normalizedPath,
        headers: {
          "Content-Type": mimeType,
        },
      });
    } catch (error) {
      console.error("Protocol handler error:", error);
      callback({ error: -2 });
    }
  });

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: "TagpixAi3.png",
    frame: false,
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webviewTag: false,
    },
  });

  // Add event listeners for window state changes
  mainWindow.on("maximize", () => {
    console.log("Window maximized");
  });

  mainWindow.on("unmaximize", () => {
    console.log("Window unmaximized");
  });

  // Add these event handlers after window creation
  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window-maximized");
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window-unmaximized");
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5000");
  } else {
    // Ensure proper path resolution in production
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
    // Disable devtools and prevent refresh
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.webContents.closeDevTools();
    });
    mainWindow.webContents.on("before-input-event", (event, input) => {
      if (input.key === "F5" || (input.key === "r" && input.control)) {
        event.preventDefault();
      }
    });
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

// Add this function for thumbnail generation
async function generateThumbnail(
  filePath: string
): Promise<{ path: string; base64?: string }> {
  try {
    // Validate file exists
    if (!existsSync(filePath)) {
      console.error("File does not exist:", filePath);
      throw new Error("File not found");
    }

    const thumbnailsDir = path.join(app.getPath("userData"), "thumbnails");
    if (!existsSync(thumbnailsDir)) {
      mkdirSync(thumbnailsDir, { recursive: true });
    }

    const thumbnailName = `${Buffer.from(filePath).toString("base64")}.jpg`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailName);

    const extension = path.extname(filePath).toLowerCase();
    const isVideo = [".mp4", ".mov", ".avi", ".mkv"].includes(extension);

    if (isVideo) {
      try {
        if (!existsSync(thumbnailPath)) {
          await new Promise<void>((resolve, reject) => {
            ffmpeg_(filePath)
              .takeScreenshots({
                timestamps: ["00:00:01"],
                filename: thumbnailName,
                folder: thumbnailsDir,
                size: "?x256",
              })
              .on("end", () => resolve())
              .on("error", (err) => {
                console.error("FFmpeg error:", err);
                reject(err);
              });
          });
        }

        // Verify thumbnail was created
        if (!existsSync(thumbnailPath)) {
          throw new Error("Thumbnail generation failed");
        }

        const thumbnailBuffer = await fs.readFile(thumbnailPath);
        const base64Data = thumbnailBuffer.toString("base64");

        return {
          path: thumbnailPath,
          base64: base64Data,
        };
      } catch (error) {
        console.error("Video thumbnail generation error:", error);
        throw error;
      }
    }

    // Handle images
    try {
      if (!existsSync(thumbnailPath)) {
        await Sharp(filePath)
          .resize(undefined, 256, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .png() // Change to PNG format to preserve transparency
          .toFile(thumbnailPath);
      }

      // Verify thumbnail was created
      if (!existsSync(thumbnailPath)) {
        throw new Error("Thumbnail generation failed");
      }

      return { path: thumbnailPath };
    } catch (error) {
      console.error("Image thumbnail generation error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Thumbnail generation failed for:", filePath, error);
    throw error;
  }
}

// Add this IPC handler
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

// Helper function to get MIME type
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".mp4": "video/mp4",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

// Function for image/video resizing optimized for AI processing
async function resizeImageForAI(filePath: string): Promise<string> {
  const extension = path.extname(filePath).toLowerCase();
  const isVideo = [".mp4", ".mov", ".avi", ".mkv"].includes(extension);

  if (isVideo) {
    try {
      // Use the existing thumbnail instead of generating a new frame
      const { base64 } = await generateThumbnail(filePath);
      if (!base64) {
        throw new Error("Failed to get thumbnail base64 data");
      }
      return base64;
    } catch (error) {
      console.error("Error processing video thumbnail:", error);
      throw new Error("Failed to process video thumbnail for AI");
    }
  }

  // Handle images
  try {
    const metadata = await Sharp(filePath).metadata();
    console.log(
      `Processing image: ${path.basename(filePath)} (${metadata.width}x${
        metadata.height
      })`
    );

    const buffer = await Sharp(filePath)
      .resize(256, 256, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .jpeg({
        quality: 70,
        mozjpeg: true,
        chromaSubsampling: "4:2:0",
      })
      .toBuffer();

    return buffer.toString("base64");
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process image for AI");
  }
}

// Add this IPC handler
ipcMain.handle("resize-image-for-ai", async (_, filePath: string) => {
  try {
    return await resizeImageForAI(filePath);
  } catch (error) {
    console.error("Error in resize-image-for-ai handler:", error);
    throw error;
  }
});

// Add these handlers for metadata operations
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

// Don't clear temp categories when app starts
app.on("ready", () => {
  console.log("App ready - keeping temp categories for export");
});

// Clear temp categories when app quits
app.on("before-quit", () => {
  tempCategoryStore.set("categories", {});
  console.log("Cleared temp categories on quit");
});

// Clean up temp files when app closes
app.on("will-quit", () => {
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
    store.set("generatedMetadata", {});

    console.log("Successfully cleared AI-generated content on quit");
  } catch (error) {
    console.error("Error cleaning up AI-generated content:", error);
  }
});

// Prevent window from being garbage collected
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

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
}); // function ffmpeg(filePath: string) {
//   throw new Error('Function not implemented.');
// }
