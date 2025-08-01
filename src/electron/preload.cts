const { contextBridge, ipcRenderer } = require("electron");

// Add event handlers for window state
let maximizedCallback: (() => void) | null = null;
let unmaximizedCallback: (() => void) | null = null;

ipcRenderer.on('window-maximized', () => {
  maximizedCallback?.();
});

ipcRenderer.on('window-unmaximized', () => {
  unmaximizedCallback?.();
});

contextBridge.exposeInMainWorld("electron", {
  readFileBase64: (filePath: string) => ipcRenderer.invoke("read-file-base64", filePath),
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog"),
  generateThumbnail: (filePath: string) =>
    ipcRenderer.invoke("generate-thumbnail", filePath),
  getSettings: (key: string) => ipcRenderer.invoke("get-settings", key),
  saveSettings: (key: string, value: any) =>
    ipcRenderer.invoke("save-settings", key, value),
  resizeImageForAI: (filePath: string) =>
    ipcRenderer.invoke("resize-image-for-ai", filePath),
  getFileMetadata: async (filePath: string) => {
    try {
      const metadata = await ipcRenderer.invoke("get-file-metadata", filePath);
      console.log("Metadata retrieved:", metadata);
      return metadata;
    } catch (error) {
      console.error("Failed to get metadata:", error);
      throw error;
    }
  },

  saveFileMetadata: async (filePath: string, metadata: any) => {
    try {
      const result = await ipcRenderer.invoke(
        "save-file-metadata",
        filePath,
        metadata
      );
      console.log("Metadata saved:", result);
      return result;
    } catch (error) {
      console.error("Failed to save metadata:", error);
      throw error;
    }
  },
  clearFileMetadata: (filePath: string) =>
    ipcRenderer.invoke("clear-file-metadata", filePath),
  minimize: () => ipcRenderer.send("minimize-window"),
  maximize: () => ipcRenderer.send("maximize-window"),
  close: () => ipcRenderer.send("close-window"),
  isFullScreen: () => ipcRenderer.invoke("is-fullscreen"),
  isFocused: () => ipcRenderer.invoke("is-focused"),
  isMaximized: () => ipcRenderer.invoke("is-maximized"),
  onWindowStateChange: (callback: (arg0: any) => any) => {
    ipcRenderer.on("window-state-changed", (_event: any, state: any) => callback(state));
  },
  saveCsvFile: (filePath: string, content: string) =>
    ipcRenderer.invoke("save-csv-file", filePath, content),
  getTempCategories: (filePath: string) =>
    ipcRenderer.invoke('get-temp-categories', filePath),
  saveTempCategories: (filePath: string, categories: {
    adobe: string;
    shutter1: string;
    shutter2: string;
  }) => ipcRenderer.invoke('save-temp-categories', filePath, categories),
  onMaximized: (callback: () => void) => {
    maximizedCallback = callback;
  },
  onUnmaximized: (callback: () => void) => {
    unmaximizedCallback = callback;
  },
  embedMetadata: (filePath: string, metadata: any) =>
    ipcRenderer.invoke('embed-metadata', filePath, metadata),
  // Model usage API
  sendModelUsage: (data: { modelName: string; imageCount: number; date?: string }) =>
    ipcRenderer.invoke('send-model-usage', data),
  getModelUsage: () => ipcRenderer.invoke('get-model-usage'),
  clearModelUsage: () => ipcRenderer.invoke('clear-model-usage'),
});
