/* eslint-disable @typescript-eslint/no-unused-vars */
interface MetadataSettings {
  visualTheme: string | null;
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

declare global {
  interface Window {
    electron: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      openFileDialog: () => Promise<string[]>;
      openDirectoryDialog: () => Promise<string[]>;
      generateThumbnail: (filePath: string) => Promise<string | null>;
      getSettings: <T>(key: string) => Promise<T>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      saveSettings: (key: string, value: any) => Promise<void>;
      readFileBase64: (filePath: string) => Promise<string>;
      resizeImageForAI: (filePath: string) => Promise<string>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getFileMetadata: (filePath: string) => Promise<any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      saveFileMetadata: (filePath: string, metadata: any) => Promise<void>;
      clearFileMetadata: (filePath: string) => Promise<void>;
      saveCsvFile: (filePath: string, content: string) => Promise<void>;
      getTempCategories: (filePath: string) => Promise<{
        adobe: string;
        shutter1: string;
        shutter2: string;
      } | null>;
      saveTempCategories: (
        filePath: string,
        categories: {
          adobe: string;
          shutter1: string;
          shutter2: string;
        }
      ) => Promise<void>;
      isFullScreen: () => Promise<boolean>;
      isFocused: () => Promise<boolean>;
    };
  }
}

export {};

