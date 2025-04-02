interface MetadataSettings {
    titleLimit: number;
    descriptionLimit: number;
    keywordLimit: number;
}

interface ApiSettings {
    provider: string;
    model: string;
    apiKey: string;
    requestInterval: number;
}

type SettingsKey = 'metadata' | 'api';
type SettingsValue<T extends SettingsKey> = T extends 'metadata' 
    ? MetadataSettings 
    : T extends 'api' 
    ? ApiSettings 
    : never;

interface ElectronAPI {
    resizeImageForAI(filePath: string): unknown;
    saveSettings<T extends SettingsKey>(key: T, settings: SettingsValue<T> | null): Promise<void>;
    getSettings<T extends SettingsKey>(key: T): Promise<SettingsValue<T> | null>;
    generateThumbnail(file: string): Promise<string | null>;
    openFileDialog: () => Promise<string[]>;
    readFileBase64: (filePath: string) => Promise<string>;
    getFileMetadata: (filePath: string) => Promise<AIAnalysisResult | null>;
    saveFileMetadata: (filePath: string, metadata: AIAnalysisResult) => Promise<void>;
    clearFileMetadata: (filePath: string) => Promise<boolean>;
}

declare interface Window {
    electron: ElectronAPI;
}






