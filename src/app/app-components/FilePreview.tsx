import { useContext, useState, useEffect } from "react";
import { FileContext } from "./FileContext";
import "./css/FilePreview.css"; // Import the CSS for animations

function FilePreview() {
  const { selectedFile, selectedFiles, setSelectedFile } = useContext(FileContext);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const isVideo = (file: string) => {
    const ext = file.split('.').pop()?.toLowerCase();
    return ['mp4', 'mov', 'avi', 'mkv'].includes(ext || '');
  };

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
    const loadPreview = async () => {
      if (!selectedFile) {
        setPreviewSrc(null);
        setError(null);
        return;
      }

      try {
        if (isVideo(selectedFile)) {
          // For videos, load the thumbnail
          const thumbnailPath = await window.electron.generateThumbnail(selectedFile);
          if (thumbnailPath) {
            const thumbnailData = await window.electron.readFileBase64(thumbnailPath);
            setPreviewSrc(thumbnailData);
          } else {
            throw new Error('Failed to generate thumbnail');
          }
        } else {
          // For images, use direct file path
          const normalizedPath = selectedFile.replace(/\\/g, "/");
          setPreviewSrc(`local-file:///${normalizedPath}`);
        }
        setError(null);
      } catch (err) {
        console.error("Error loading preview:", err);
        setError("Failed to load preview. Please check if the file exists and is accessible.");
        setPreviewSrc(null);
      }
    };

    loadPreview();
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-background/50">No file selected for preview.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 items-center justify-center h-full p-4 preview-container">
      <h2 className="text-zinc-400 rounded-md">Preview</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex items-center justify-center h-[calc(100%-40px)] w-full">
        {previewSrc && (
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden preview-container"
            style={{ minHeight: '300px' }}
          >
            <img
              src={previewSrc}
              alt="Preview"
              className="w-auto h-auto object-contain rounded-md border-4 border-zinc-700/50 preview-image preview-image-border"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.error("Error loading preview:", e);
                setError("Failed to load preview. Please check if the file exists and is accessible.");
              }}
            />
            {isVideo(selectedFile) && (
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                Video
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilePreview;
