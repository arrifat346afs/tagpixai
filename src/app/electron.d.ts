/* eslint-disable @typescript-eslint/no-explicit-any */
interface MetadataSettings {
    visualTheme: any;
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

type SettingsKey = 'metadata' | 'api' | 'outputDirectory';
type SettingsValue<T extends SettingsKey> = T extends 'metadata'
    ? MetadataSettings
    : T extends 'api'
    ? ApiSettings
    : never;

interface ElectronAPI {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isFullScreen: () => Promise<boolean>;
    isFocused: () => Promise<boolean>;
    isMaximized: () => Promise<boolean>;
    onMaximized: (callback: () => void) => void;
    onUnmaximized: (callback: () => void) => void;
    getTempCategories(filePath: any): unknown;
    saveTempCategories(filePath: any, categories: { adobe: string; shutter1: string; shutter2: string; }): unknown;
    saveCsvFile(fullPath: string, csvContent: string): unknown;
    saveCSVFile(fullPath: string, csvContent: string): unknown;
    openDirectoryDialog(): unknown;
    showOpenDialog(arg0: { properties: string[]; filters: { name: string; extensions: string[]; }[]; }): unknown;
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







