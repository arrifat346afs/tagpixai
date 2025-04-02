import { useContext, useState, useEffect } from "react";
import { FileContext } from "./FileContext";

function FilePreview() {
  const { selectedFile } = useContext(FileContext);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      // Convert Windows path to URL format
      const normalizedPath = selectedFile.replace(/\\/g, "/");
      const url = `local-file:///${normalizedPath}`;
      console.log("Setting image URL:", url);
      setImageSrc(url);
      setError(null);
    } else {
      setImageSrc(null);
      setError(null);
    }
  }, [selectedFile]);

  if (!selectedFile) {
    return <p className="text-center text-background/50">No file selected for preview.</p>;
  }

  // Check if the file is an image
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedFile);

  if (!isImage) {
    return (
      <div className="text-white">
        <h2>File Preview</h2>
        <p>Preview not available for this file type.</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-background/50">File Preview</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div
        style={{
          padding: "10px",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "500px",
              height: "auto",
              borderRadius: "5px",
              objectFit: "contain",
            }}
            onError={(e) => {
              console.error("Error loading image:", e);
              setError(
                "Failed to load image. Please check if the file exists and is accessible."
              );
            }}
          />
        )}
      </div>
    </div>
  );
}

export default FilePreview;
