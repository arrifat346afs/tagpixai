import fs from "fs/promises";
import { app } from "electron";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { loadFfmpeg, loadSharp } from '../main.js';
import { imageWorkerPool } from '../workers/workerPool.js';

// Batch thumbnail generation for parallel processing
export async function generateThumbnailsBatch(
  filePaths: string[],
  maxConcurrency: number = 6
): Promise<Array<{ filePath: string; result?: { path: string; base64?: string }; error?: string }>> {
  console.log(`Starting batch thumbnail generation for ${filePaths.length} files with concurrency ${maxConcurrency}`);

  const results: Array<{ filePath: string; result?: { path: string; base64?: string }; error?: string }> = [];

  // Process files in batches to avoid overwhelming the system
  for (let i = 0; i < filePaths.length; i += maxConcurrency) {
    const batch = filePaths.slice(i, i + maxConcurrency);

    const batchPromises = batch.map(async (filePath) => {
      try {
        const result = await generateThumbnail(filePath);
        return { filePath, result };
      } catch (error: any) {
        return { filePath, error: error.message };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((promiseResult, index) => {
      if (promiseResult.status === 'fulfilled') {
        results.push(promiseResult.value);
      } else {
        results.push({
          filePath: batch[index],
          error: promiseResult.reason?.message || 'Unknown error'
        });
      }
    });

    console.log(`Completed batch ${Math.floor(i / maxConcurrency) + 1}/${Math.ceil(filePaths.length / maxConcurrency)}`);
  }

  return results;
}



export async function generateThumbnail(
  filePath: string
): Promise<{ path: string; base64?: string }> {
  try {
    // Validate file exists
    if (!existsSync(filePath)) {
      console.error("File does not exist:", filePath);
      throw new Error("File not found");
    }

    const thumbnailsDir = path.join(app.getPath("userData"), "thumbnails");
    if (!existsSync(thumbnailsDir)) {
      mkdirSync(thumbnailsDir, { recursive: true });
    }

    const thumbnailName = `${Buffer.from(filePath).toString("base64")}.jpg`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailName);

    const extension = path.extname(filePath).toLowerCase();
    const isVideo = [".mp4", ".mov", ".avi", ".mkv"].includes(extension);

    if (isVideo) {
      try {
        if (!existsSync(thumbnailPath)) {
          // Dynamically load ffmpeg
          const ffmpeg = await loadFfmpeg();

          await new Promise<void>((resolve, reject) => {
            ffmpeg(filePath)
              .takeScreenshots({
                timestamps: ["00:00:01"],
                filename: thumbnailName,
                folder: thumbnailsDir,
                size: "?x256",
              })
              .on("end", () => resolve())
              .on("error", (err) => {
                console.error("FFmpeg error:", err);
                reject(err);
              });
          });
        }

        // Verify thumbnail was created
        if (!existsSync(thumbnailPath)) {
          throw new Error("Thumbnail generation failed");
        }

        const thumbnailBuffer = await fs.readFile(thumbnailPath);
        const base64Data = thumbnailBuffer.toString("base64");

        return {
          path: thumbnailPath,
          base64: base64Data,
        };
      } catch (error) {
        console.error("Video thumbnail generation error:", error);
        throw error;
      }
    }

    // Handle images
    try {
      // Check if thumbnail already exists and return it immediately
      if (existsSync(thumbnailPath)) {
        const thumbnailBuffer = await fs.readFile(thumbnailPath);
        const base64Data = thumbnailBuffer.toString("base64");
        return {
          path: thumbnailPath,
          base64: base64Data
        };
      }

      // Generate new thumbnail using worker pool
      try {
        console.log("Using worker pool for thumbnail generation:", path.basename(filePath));

        const workerResult = await imageWorkerPool.executeTask({
          operation: 'generateThumbnail',
          filePath: filePath,
          options: { maxHeight: 256 }
        });

        if (workerResult.success && workerResult.buffer) {
          // Convert array back to buffer and write to thumbnail path
          const jpegBuffer = Buffer.from(workerResult.buffer);

          // Write file and return base64 in one operation
          await fs.writeFile(thumbnailPath, jpegBuffer);
          const base64Data = jpegBuffer.toString("base64");

          console.log("Successfully generated thumbnail with Sharp worker");
          return {
            path: thumbnailPath,
            base64: base64Data
          };
        } else {
          throw new Error(workerResult.error || 'Worker failed to process image');
        }
      } catch (workerError) {
        // Fallback to main thread Sharp if worker fails
        console.error("Worker thumbnail generation failed, trying main thread:", workerError);

        try {
          // Try to use Sharp on main thread as fallback
          const sharp = await loadSharp();

          // Configure Sharp for maximum performance
          sharp.cache(false);
          sharp.simd(true);

          // Use optimized JPEG processing for speed
          const jpegBuffer = await sharp(filePath)
            .resize(256, 256, {
              fit: 'inside',
              withoutEnlargement: true,
              kernel: 'nearest' // Fastest resize algorithm
            })
            .jpeg({
              quality: 80,
              progressive: false,
              mozjpeg: false // Disable mozjpeg for speed
            })
            .toBuffer();

          // Write file and return base64 in one operation
          await fs.writeFile(thumbnailPath, jpegBuffer);
          const base64Data = jpegBuffer.toString("base64");

          console.log("Successfully generated thumbnail with Sharp main thread fallback");
          return {
            path: thumbnailPath,
            base64: base64Data
          };
        } catch (sharpError) {
          // Final fallback to a simple file copy if Sharp fails
          console.error("Sharp thumbnail generation failed, using file copy fallback:", sharpError);

          try {
            // Read the original file and use it as thumbnail
            const originalBuffer = await fs.readFile(filePath);
            await fs.writeFile(thumbnailPath, originalBuffer);
            const base64Data = originalBuffer.toString("base64");

            console.log("Used file copy as thumbnail fallback");
            return {
              path: thumbnailPath,
              base64: base64Data
            };
          } catch (fallbackError) {
            console.error("All thumbnail generation methods failed:", fallbackError);
            throw fallbackError;
          }
        }
      }
    } catch (error) {
      console.error("Image thumbnail generation error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Thumbnail generation failed for:", filePath, error);
    throw error;
  }
}
