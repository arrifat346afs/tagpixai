import { useContext, useState, useEffect } from "react";
import { FileContext } from "./FileContext";

function FilePreview() {
  const { selectedFile, selectedFiles, setSelectedFile } = useContext(FileContext);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    // Only show first file preview when files are initially uploaded
    if (selectedFiles.length > 0 && !initialLoadDone && !selectedFile) {
      setSelectedFile(selectedFiles[0]);
      setInitialLoadDone(true);
    }

    // Reset initialLoadDone when selectedFiles becomes empty
    if (selectedFiles.length === 0) {
      setInitialLoadDone(false);
    }
  }, [selectedFiles, initialLoadDone, selectedFile, setSelectedFile]);

  useEffect(() => {
    if (selectedFile) {
      const normalizedPath = selectedFile.replace(/\\/g, "/");
      const url = `local-file:///${normalizedPath}`;
      setImageSrc(url);
      setError(null);
    } else {
      setImageSrc(null);
      setError(null);
    }
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-background/50">No file selected for preview.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 items-center justify-center h-full p-4">
      <h2 className="text-background/50 rounded-md">Preview</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex items-center justify-center">
        {imageSrc && (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={imageSrc}
              alt="Preview"
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-md border-2 border-zinc-700/50"
              style={{
                maxWidth: 'min(100%, 700px)',
                maxHeight: 'min(100%, 700px)',
              }}
              onError={(e) => {
                console.error("Error loading image:", e);
                setError("Failed to load image. Please check if the file exists and is accessible.");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FilePreview;
