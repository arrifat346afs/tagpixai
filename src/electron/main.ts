// import { ModelUsageData } from '@/api/model-usage';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, protocol, BrowserWindow } from "electron";
import path from "path";
import "./ipc/IpcManagement.js";
import { existsSync, mkdirSync, rmSync } from "fs";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import Store from "electron-store";
import sharp from "sharp";
import { cleanupExifTool } from "./metadata/embedMetadata.js";
import { imageWorkerPool } from "./workers/workerPool.js";

let sharpModule: typeof sharp | null = null;
let ffmpegModule: typeof import("fluent-ffmpeg") | null = null;

// Function to dynamically load Sharp module
export async function loadSharp(): Promise<typeof sharp> {
  if (!sharpModule) {
    console.log("Dynamically loading Sharp module");
    try {
      const module = await import("sharp");
      sharpModule = module.default;
      console.log("Successfully loaded Sharp module");
    } catch (error: any) {
      console.error("Error loading Sharp module:", error);
      throw new Error(
        `Failed to load Sharp module: ${error.message}. Please ensure Sharp is correctly installed.`
      );
    }
  }

  if (!sharpModule) {
    throw new Error("Sharp module failed to initialize");
  }

  return sharpModule;
}

// Function to dynamically load ffmpeg module
export async function loadFfmpeg() {
  if (!ffmpegModule) {
    console.log("Dynamically loading ffmpeg module");
    const module = await import("fluent-ffmpeg");
    ffmpegModule = module.default;
  }
  return ffmpegModule;
}

// Initialize the store with a schema
export const store = new Store({
  name: "metadata-store",
  defaults: {
    settings: {
      metadata: {},
      api: {},
    },
    generatedMetadata: {},
    modelUsage: [],
    userEmail: null, // Store user email for model usage tracking
  },
});

export const tempCategoryStore = new Store({
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
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
});

// Helper function to get MIME type
export function getMimeType(extension: string): string {
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
    // Clean up ExifTool processes
    cleanupExifTool();

    // Clean up worker pool
    imageWorkerPool.terminate();

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
    store.delete("modelUsage");
    const remainingUsage = store.get("modelUsage");
    if (!remainingUsage) {
      console.log("Successfully cleared model usage data");
    } else {
      console.warn("Model usage data might not have been cleared properly");
    }

    console.log("Successfully cleared AI-generated content on quit");
  } catch (error) {
    console.error("Error cleaning up AI-generated content:", error);
  }
});

// Prevent window from being garbage collected
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    cleanupExifTool();
    imageWorkerPool.terminate();
    app.quit();
  }
});
