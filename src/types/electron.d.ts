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
    getTempCategories: (filePath: string) => Promise<{
        adobe: string;
        shutter1: string;
        shutter2: string;
    } | null>;
    saveTempCategories: (filePath: string, categories: {
        adobe: string;
        shutter1: string;
        shutter2: string;
    }) => Promise<void>;
}

export {};


