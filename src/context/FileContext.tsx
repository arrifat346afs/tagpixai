import React, { createContext, useState } from 'react';

interface FileMetadata {
  filePath: string;
  title: string;
  description: string;
  keywords: string[];
}

interface FileContextType {
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  selectedFile: string | null;
  setSelectedFile: (file: string | null) => void;
  selectedFileMetadata: FileMetadata | null;
  setSelectedFileMetadata: (metadata: FileMetadata | null) => void;
}

export const FileContext = createContext<FileContextType>({
  selectedFiles: [],
  setSelectedFiles: () => {},
  selectedFile: null,
  setSelectedFile: () => {},
  selectedFileMetadata: null,
  setSelectedFileMetadata: () => {},
});

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFileMetadata, setSelectedFileMetadata] = useState<FileMetadata | null>(null);

  return (
    <FileContext.Provider
      value={{
        selectedFiles,
        setSelectedFiles,
        selectedFile,
        setSelectedFile,
        selectedFileMetadata,
        setSelectedFileMetadata,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};
