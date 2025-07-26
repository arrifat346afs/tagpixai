import { parentPort } from 'worker_threads';

// Cache Sharp instance to avoid repeated imports
let sharpInstance: any = null;

async function getSharp() {
  if (!sharpInstance) {
    sharpInstance = (await import('sharp')).default;
    // Configure Sharp for maximum performance globally
    sharpInstance.cache(false); // Disable cache to save memory
    sharpInstance.simd(true);   // Enable SIMD for faster processing
    sharpInstance.concurrency(1); // Use single thread per worker to avoid conflicts
  }
  return sharpInstance;
}

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
    // Use cached Sharp instance
    const sharp = await getSharp();

    // Calculate dimensions to maintain aspect ratio within specified height
    const maxHeight = options?.maxHeight || 256;

    // Use JPEG for thumbnails - much faster than PNG and smaller file size
    const jpegBuffer = await sharp(filePath)
      .resize(maxHeight, maxHeight, {
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

    // Get final dimensions from the buffer
    const metadata = await sharp(jpegBuffer).metadata();
    const finalWidth = metadata.width || maxHeight;
    const finalHeight = metadata.height || maxHeight;

    return {
      success: true,
      buffer: Array.from(jpegBuffer), // Convert to array for transfer
      width: finalWidth,
      height: finalHeight
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
    // Use cached Sharp instance
    const sharp = await getSharp();

    // Calculate dimensions to maintain aspect ratio within 256x256
    const maxSize = options?.maxSize || 256;
    const quality = options?.quality || 50;

    // Resize and convert to JPEG with optimized settings
    const jpegBuffer = await sharp(filePath)
      .resize(maxSize, maxSize, {
        fit: 'inside',
        withoutEnlargement: true,
        kernel: 'nearest' // Fastest resize algorithm
      })
      .jpeg({
        quality,
        progressive: false,
        mozjpeg: false // Disable mozjpeg for speed
      })
      .toBuffer();

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
