declare global {
    interface Window {
        electron: ElectronAPI;
    }
}

interface ElectronAPI {
    openFileDialog: () => Promise<string[]>;
    generateThumbnail: (filePath: string) => Promise<string | null>;
    getSettings: <T>(key: string) => Promise<T>;
    saveSettings: (key: string, value: any) => Promise<void>;
    readFileBase64: (filePath: string) => Promise<string>;
}

export {};


