declare global {
    interface Window {
        electron: {
            minimize: () => void
            maximize: () => void
            close: () => void
        }
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



