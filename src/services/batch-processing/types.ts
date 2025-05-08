export interface BatchProcessingStatus {
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
}

export interface ProcessingResult {
  filePath: string;
  success: boolean;
  error?: string;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface ProcessingSettings {
  api: {
    provider: string;
    model: string;
    apiKey: string;
    requestInterval: number;
  };
  metadata: {
    titleLimit: number;
    descriptionLimit: number;
    keywordLimit: number;
    includePlaceName: boolean;
  };
}

export interface AIRequestPayload {
  image: string;  // base64 image data
  settings: ProcessingSettings;
  prompt?: string;
}
