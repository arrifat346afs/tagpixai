import React, { createContext, useState } from 'react';

interface FileContextType {
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  selectedFile: string | null;
  setSelectedFile: (file: string | null) => void;
  selectedFileMetadata: {
    title: string;
    description: string;
    keywords: string[];
  } | null;
  setSelectedFileMetadata: (metadata: {
    title: string;
    description: string;
    keywords: string[];
  } | null) => void;
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
  const [selectedFileMetadata, setSelectedFileMetadata] = useState<{
    title: string;
    description: string;
    keywords: string[];
  } | null>(null);

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
}
