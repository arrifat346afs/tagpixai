/* eslint-disable @typescript-eslint/no-explicit-any */
interface MetadataSettings {
    includePlaceName: any;
    includePlaceName: undefined;
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

type SettingsKey = 'metadata' | 'api' | 'outputDirectory' | 'userEmail';
type SettingsValue<T extends SettingsKey> = T extends 'metadata'
    ? MetadataSettings
    : T extends 'api'
    ? ApiSettings
    : T extends 'outputDirectory'
    ? string // Assuming outputDirectory is a string
    : T extends 'userEmail'
    ? string
    : never;

interface ElectronAPI {
    onWindowStateChange(arg0: (state: any) => void): unknown;
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
    // Model usage API
    sendModelUsage: (data: {
        modelName: string;
        imageCount: number;
        date?: string
    }) => Promise<{ success: boolean; data?: any; error?: string }>;
    getModelUsage: () => Promise<{
        success: boolean;
        data?: Array<{ modelName: string; imageCount: number; date: string }>;
        error?: string
    }>;
    clearModelUsage: () => Promise<{ success: boolean; error?: string }>;
}

declare interface Window {
    electron: ElectronAPI;
}







