import path from "path";
import fs from "fs/promises";
import { generateThumbnail } from "../Thumbnail/generateThumbnail.js";
import { loadSharp } from "../main.js";
import { existsSync } from "fs";
import { imageWorkerPool } from '../workers/workerPool.js';

// Fallback image processing using Node.js built-in modules
async function fallbackImageProcessing(filePath: string): Promise<string> {
  console.log("Using fallback image processing for:", filePath);

  try {
    // Use the thumbnail generation as a fallback
    // This is similar to how we handle videos
    const result = await generateThumbnail(filePath);
    if (result.base64) {
      console.log("Successfully used thumbnail as fallback");
      return result.base64;
    }

    // If thumbnail generation didn't return base64, read the thumbnail file
    if (result.path && existsSync(result.path)) {
      const thumbnailBuffer = await fs.readFile(result.path);
      return thumbnailBuffer.toString("base64");
    }

    // Last resort: just read the original file
    // This is not ideal for large images but better than failing
    console.log("Using original file as last resort");
    const buffer = await fs.readFile(filePath);
    return buffer.toString("base64");
  } catch (error) {
    console.error("Fallback image processing failed:", error);
    throw new Error("All image processing methods failed");
  }
}

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
    // Try to use worker pool first for ImageScript operations
    try {
      console.log(`Processing image with ImageScript worker: ${path.basename(filePath)}`);

      const workerResult = await imageWorkerPool.executeTask({
        operation: 'resizeForAI',
        filePath: filePath,
        options: { maxSize: 256, quality: 50 }
      });

      if (workerResult.success && workerResult.base64) {
        console.log(`Successfully processed image with worker: ${path.basename(filePath)}`);
        return workerResult.base64;
      } else {
        throw new Error(workerResult.error || 'Worker failed to process image');
      }
    } catch (workerError) {
      // Fallback to main thread Sharp if worker fails
      console.error("Worker image processing failed, trying main thread:", workerError);

      try {
        // Dynamically load Sharp
        const sharp = await loadSharp();

        // Get image metadata first
        const metadata = await sharp(filePath).metadata();
        const originalWidth = metadata.width || 0;
        const originalHeight = metadata.height || 0;

        console.log(
          `Processing image with Sharp main thread: ${path.basename(filePath)} (${originalWidth}x${originalHeight})`
        );

        // Calculate dimensions to maintain aspect ratio within 256x256
        const maxSize = 256;
        let newWidth = originalWidth;
        let newHeight = originalHeight;

        if (newWidth > maxSize || newHeight > maxSize) {
          const aspectRatio = newWidth / newHeight;
          if (newWidth > newHeight) {
            newWidth = maxSize;
            newHeight = Math.round(maxSize / aspectRatio);
          } else {
            newHeight = maxSize;
            newWidth = Math.round(maxSize * aspectRatio);
          }
        }

        // Resize and convert to JPEG with quality 50
        const jpegBuffer = await sharp(filePath)
          .resize(newWidth, newHeight, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 50 })
          .toBuffer();

        return Buffer.from(jpegBuffer).toString("base64");
      } catch (sharpError) {
        // If Sharp fails, log the error and use fallback
        console.error("Sharp processing failed, using fallback:", sharpError);
        return await fallbackImageProcessing(filePath);
      }
    }
  } catch (error) {
    console.error("All image processing methods failed:", error);
    throw new Error("Failed to process image for AI");
  }
}