import path from "path";
import { generateThumbnail } from "../Thumbnail/generateThumbnail.js";
import { loadSharp } from "../main.js";

 export async function resizeImageForAI(filePath: string): Promise<string> {
  const extension = path.extname(filePath).toLowerCase();
  const isVideo = [".mp4", ".mov", ".avi", ".mkv"].includes(extension);

  if (isVideo) {
    try {
      // Use the existing thumbnail instead of generating a new frame
      const { base64 } = await generateThumbnail(filePath);
      if (!base64) {
        throw new Error("Failed to get thumbnail base64 data");
      }
      return base64;
    } catch (error) {
      console.error("Error processing video thumbnail:", error);
      throw new Error("Failed to process video thumbnail for AI");
    }
  }

  // Handle images
  try {
    // Dynamically load Sharp
    const Sharp = await loadSharp();

    const metadata = await Sharp(filePath).metadata();
    console.log(
      `Processing image: ${path.basename(filePath)} (${metadata.width}x${
        metadata.height
      })`
    );

    const buffer = await Sharp(filePath)
      .resize(256, 256, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .jpeg({
        quality: 70,
        mozjpeg: true,
        chromaSubsampling: "4:2:0",
      })
      .toBuffer();

    return buffer.toString("base64");
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process image for AI");
  }
}