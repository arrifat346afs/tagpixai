import { useContext, useState, useEffect } from "react";
import { FileContext } from "./FileContext";

function FilePreview() {
  const { selectedFile } = useContext(FileContext);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex flex-col items-center justify-center h-full p-4">
      <h2 className="text-background/50 mb-4">File Preview</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex items-center justify-center w-full h-full">
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-md"
            onError={(e) => {
              console.error("Error loading image:", e);
              setError("Failed to load image. Please check if the file exists and is accessible.");
            }}
          />
        )}
      </div>
    </div>
  );
}

export default FilePreview;
