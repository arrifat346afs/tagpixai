import fs from "fs/promises";
import { app } from "electron";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { loadFfmpeg, loadSharp } from '../main.js';



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
      if (!existsSync(thumbnailPath)) {
        try {
          // Try to use Sharp first
          const Sharp = await loadSharp();

          await Sharp(filePath)
            .resize(undefined, 256, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .png() // Change to PNG format to preserve transparency
            .toFile(thumbnailPath);

          console.log("Successfully generated thumbnail with Sharp");
        } catch (sharpError) {
          // Fallback to a simple file copy if Sharp fails
          console.error("Sharp thumbnail generation failed, using fallback:", sharpError);

          try {
            // Read the original file
            const originalBuffer = await fs.readFile(filePath);

            // Write it to the thumbnail location
            await fs.writeFile(thumbnailPath, originalBuffer);
            console.log("Used file copy as thumbnail fallback");
          } catch (fallbackError) {
            console.error("Fallback thumbnail generation also failed:", fallbackError);
            throw fallbackError;
          }
        }
      }

      // Verify thumbnail was created
      if (!existsSync(thumbnailPath)) {
        throw new Error("Thumbnail generation failed");
      }

      // Read the thumbnail for base64 encoding
      const thumbnailBuffer = await fs.readFile(thumbnailPath);
      const base64Data = thumbnailBuffer.toString("base64");

      return {
        path: thumbnailPath,
        base64: base64Data
      };
    } catch (error) {
      console.error("Image thumbnail generation error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Thumbnail generation failed for:", filePath, error);
    throw error;
  }
}
