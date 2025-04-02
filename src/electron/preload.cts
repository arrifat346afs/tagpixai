const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    readFileBase64: (filePath: string) => ipcRenderer.invoke('read-file-base64', filePath),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    generateThumbnail: (filePath: string) => ipcRenderer.invoke('generate-thumbnail', filePath),
    getSettings: (key: string) => ipcRenderer.invoke('get-settings', key),
    saveSettings: (key: string, value: any) => ipcRenderer.invoke('save-settings', key, value),
    resizeImageForAI: (filePath: string) => ipcRenderer.invoke('resize-image-for-ai', filePath),
    getFileMetadata: (filePath: string) => ipcRenderer.invoke('get-file-metadata', filePath),
    saveFileMetadata: (filePath: string, metadata: any) => ipcRenderer.invoke('save-file-metadata', filePath, metadata),
    clearFileMetadata: (filePath: string) => ipcRenderer.invoke('clear-file-metadata', filePath),
});

