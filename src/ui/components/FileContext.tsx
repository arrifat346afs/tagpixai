import { createContext, useState } from 'react';
import { AIAnalysisResult } from '@/api/ai-api';

export const FileContext = createContext<{
  selectedFiles: string[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>;
  selectedFile: any | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<any | null>>;
  selectedFileMetadata: AIAnalysisResult | null;
  setSelectedFileMetadata: React.Dispatch<React.SetStateAction<AIAnalysisResult | null>>;
}>({
  selectedFiles: [],
  setSelectedFiles: () => {},
  selectedFile: null,
  setSelectedFile: () => {},
  selectedFileMetadata: null,
  setSelectedFileMetadata: () => {},
});

export function FileProvider({ children }: React.PropsWithChildren) {
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileMetadata, setSelectedFileMetadata] = useState<AIAnalysisResult | null>(null);
    
    return (
        <FileContext.Provider value={{ 
            selectedFiles, 
            setSelectedFiles, 
            selectedFile, 
            setSelectedFile,
            selectedFileMetadata,
            setSelectedFileMetadata 
        }}>
            {children}
        </FileContext.Provider>
    );
}
