import { parentPort } from 'worker_threads';
import fs from 'fs/promises';

interface WorkerTask {
  operation: string;
  filePath: string;
  options?: {
    maxHeight?: number;
    maxSize?: number;
    quality?: number;
  };
}

interface WorkerResult {
  success: boolean;
  buffer?: number[];
  base64?: string;
  width?: number;
  height?: number;
  error?: string;
}

// Worker for ImageScript operations to prevent main thread blocking
async function processImage(data: WorkerTask): Promise<WorkerResult> {
  try {
    const { operation, filePath, options } = data;

    switch (operation) {
      case 'generateThumbnail':
        return await generateImageThumbnail(filePath, options);
      case 'resizeForAI':
        return await resizeImageForAI(filePath, options);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error: any) {
    throw new Error(`ImageScript worker error: ${error.message}`);
  }
}

async function generateImageThumbnail(filePath: string, options: WorkerTask['options'] = {}): Promise<WorkerResult> {
  try {
    // Dynamically import ImageScript in worker
    const { Image } = await import('imagescript');
    
    // Read the image file
    const imageBuffer = await fs.readFile(filePath);
    
    // Decode the image
    const image = await Image.decode(imageBuffer);
    
    // Calculate dimensions to maintain aspect ratio within specified height
    const maxHeight = options?.maxHeight || 256;
    let newWidth = image.width;
    let newHeight = image.height;
    
    if (newHeight > maxHeight) {
      const aspectRatio = newWidth / newHeight;
      newHeight = maxHeight;
      newWidth = Math.round(maxHeight * aspectRatio);
    }
    
    // Resize the image
    const resizedImage = image.resize(newWidth, newHeight);
    
    // Encode as PNG to preserve transparency
    const pngBuffer = await resizedImage.encode();
    
    return {
      success: true,
      buffer: Array.from(pngBuffer), // Convert to array for transfer
      width: newWidth,
      height: newHeight
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function resizeImageForAI(filePath: string, options: WorkerTask['options'] = {}): Promise<WorkerResult> {
  try {
    // Dynamically import ImageScript in worker
    const { Image } = await import('imagescript');
    
    // Read the image file
    const imageBuffer = await fs.readFile(filePath);
    
    // Decode the image
    const image = await Image.decode(imageBuffer);
    
    // Calculate dimensions to maintain aspect ratio within 256x256
    const maxSize = options?.maxSize || 256;
    let newWidth = image.width;
    let newHeight = image.height;
    
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
    
    // Resize the image
    const resizedImage = image.resize(newWidth, newHeight);
    
    // Encode as JPEG with quality
    const quality = options?.quality || 50;
    const jpegBuffer = await resizedImage.encodeJPEG(quality as any);
    
    return {
      success: true,
      buffer: Array.from(jpegBuffer), // Convert to array for transfer
      base64: Buffer.from(jpegBuffer).toString('base64')
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle messages from main thread
if (parentPort) {
  parentPort.on('message', async (data: WorkerTask) => {
    try {
      const result = await processImage(data);
      parentPort!.postMessage({ success: true, result });
    } catch (error: any) {
      parentPort!.postMessage({ success: false, error: error.message });
    }
  });
}
