import { ExifTool } from 'exiftool-vendored';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

interface MetadataToEmbed {
  title: string;
  description: string;
  keywords: string[];
}

// Create a singleton ExifTool instance with proper configuration
let exiftoolInstance: ExifTool | null = null;

function getExifToolPath(): string | undefined {
  if (app.isPackaged) {
    const resourcesPath = process.resourcesPath;
    const possiblePaths = [
      // Standard path in resources
      path.join(resourcesPath, 'exiftool-vendored', 'bin', 'exiftool'),
      // Alternative path in app.asar.unpacked
      path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', 'exiftool-vendored.pl', 'bin', 'exiftool'),
      // Another alternative
      path.join(resourcesPath, 'node_modules', 'exiftool-vendored.pl', 'bin', 'exiftool'),
      // AppImage specific paths
      path.join(resourcesPath, 'app', 'node_modules', 'exiftool-vendored.pl', 'bin', 'exiftool'),
      path.join(process.cwd(), 'resources', 'app.asar.unpacked', 'node_modules', 'exiftool-vendored.pl', 'bin', 'exiftool'),
    ];

    console.log('Searching for ExifTool binary in:', possiblePaths);
    console.log('Process resourcesPath:', resourcesPath);
    console.log('Process cwd:', process.cwd());

    for (const exiftoolPath of possiblePaths) {
      try {
        if (fs.existsSync(exiftoolPath)) {
          console.log('Found ExifTool binary at:', exiftoolPath);
          // Check if the binary is executable
          try {
            fs.accessSync(exiftoolPath, fs.constants.X_OK);
            console.log('ExifTool binary is executable');
            return exiftoolPath;
          } catch (execError) {
            console.log('ExifTool binary found but not executable:', execError);
          }
        }
      } catch (error) {
        console.log('Error checking path:', exiftoolPath, error);
      }
    }

    console.log('ExifTool binary not found in expected locations, using default');
  }

  return undefined; // Use default path
}

function getExifTool(): ExifTool {
  if (!exiftoolInstance) {
    const exiftoolPath = getExifToolPath();

    const config: any = {
      taskTimeoutMillis: 60000, // Increased to 60 seconds for AppImage
      maxProcs: 1, // Use single process to avoid conflicts
      spawnTimeoutMillis: 60000, // Increased spawn timeout
      maxTasksPerProcess: 100, // Reduced for better stability in AppImage
      maxReusedProcs: 1, // Limit process reuse
      spawnArgs: ['-stay_open', 'True', '-@', '-'], // Explicit spawn args
    };

    if (exiftoolPath) {
      config.exiftoolPath = exiftoolPath;
    }

    console.log('Creating ExifTool instance with config:', config);
    exiftoolInstance = new ExifTool(config);
  }
  return exiftoolInstance;
}

// Health check function to verify ExifTool is working
async function checkExifToolHealth(): Promise<boolean> {
  try {
    const exiftool = getExifTool();
    // Try to get version info as a health check
    const version = await exiftool.version();
    console.log('ExifTool health check passed, version:', version);
    return true;
  } catch (error) {
    console.error('ExifTool health check failed:', error);
    // Clean up the failed instance
    cleanupExifTool();
    return false;
  }
}

export async function embedMetadata(filePath: string, metadata: MetadataToEmbed): Promise<void> {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      // Force recreation of ExifTool instance on retry to avoid stuck processes
      if (retryCount > 0) {
        console.log(`Retry ${retryCount}: Recreating ExifTool instance`);
        cleanupExifTool();
      }

      // Perform health check before attempting to embed metadata
      const isHealthy = await checkExifToolHealth();
      if (!isHealthy) {
        throw new Error('ExifTool health check failed - binary may not be available or working properly');
      }

      const exiftool = getExifTool();

      // Clean up the title and description by removing any lang prefix and normalizing whitespace
      const cleanTitle = metadata.title.replace(/lang="[^"]*"\s*|^"|"$/g, '').trim();
      const cleanDescription = metadata.description.replace(/lang="[^"]*"\s*|^"|"$/g, '').trim();

      const extension = path.extname(filePath).toLowerCase();
      const isVideo = ['.mp4', '.mov', '.avi', '.mkv'].includes(extension);

      // Prepare metadata tags - avoid XMP fields that create lang attributes
      // Use only IPTC, EXIF, and specific non-XMP fields
      const tags = {
        // Standard metadata fields
        'Title': cleanTitle,
        'Description': cleanDescription,
        'Subject': metadata.keywords.join(', '),
        'Keywords': metadata.keywords,

        // PDF metadata
        'PDF:Title': cleanTitle,
        'PDF:Subject': cleanDescription,
        'PDF:Keywords': metadata.keywords.join(', '),
      };

      if (isVideo) {
        Object.assign(tags, {
          'QuickTime:Title': cleanTitle,
          'QuickTime:Description': cleanDescription,
          'QuickTime:Keywords': metadata.keywords.join(', '),
        });
      } else {
        Object.assign(tags, {
          'IPTC:ObjectName': cleanTitle,
          'IPTC:Caption-Abstract': cleanDescription,
          'IPTC:Keywords': metadata.keywords,

          // EXIF metadata for images
          'EXIF:ImageDescription': cleanDescription,
          'EXIF:XPTitle': cleanTitle,
          'EXIF:XPComment': cleanDescription,
          'EXIF:XPKeywords': metadata.keywords.join(';'),
        });
      }

      // Write metadata with specific flags to avoid XMP lang attributes
      await exiftool.write(filePath, tags, {
        writeArgs: [
          '-overwrite_original',
          '-P',  // Preserve file modification date/time
          '-codedcharacterSet=utf8'  // Ensure proper encoding
        ]
      });

      console.log(`Successfully embedded metadata in ${filePath}`);
      return; // Success, exit the retry loop

    } catch (error: any) {
      retryCount++;
      console.error(`Failed to embed metadata in ${filePath} (attempt ${retryCount}/${maxRetries}):`, error);

      // If this is a BatchCluster error and we have retries left, recreate the ExifTool instance
      if (error.message && error.message.includes('BatchCluster has ended') && retryCount < maxRetries) {
        console.log('BatchCluster error detected, recreating ExifTool instance...');
        cleanupExifTool();
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      // If we've exhausted retries or it's a different error, throw
      if (retryCount >= maxRetries) {
        throw error;
      }
    }
  }
}

// Most effective solution: Completely avoid XMP and use only IPTC/EXIF
export async function embedMetadataNoXMP(filePath: string, metadata: MetadataToEmbed): Promise<void> {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const exiftool = getExifTool();

      const cleanTitle = metadata.title.replace(/lang="[^"]*"\s*|^"|"$/g, '').trim();
      const cleanDescription = metadata.description.replace(/lang="[^"]*"\s*|^"|"$/g, '').trim();

      const extension = path.extname(filePath).toLowerCase();
      const isVideo = ['.mp4', '.mov', '.avi', '.mkv'].includes(extension);

      // Remove ALL XMP metadata first to ensure clean slate
      await exiftool.write(filePath, {}, { writeArgs: ['-XMP:all=', '-overwrite_original'] });

      // Use only IPTC and EXIF metadata - no XMP at all
      const tags = {
        'Title': cleanTitle,
        'Description': cleanDescription,
        'Subject': metadata.keywords.join(', '),
        'Keywords': metadata.keywords,
      };

      if (isVideo) {
        Object.assign(tags, {
          'QuickTime:Title': cleanTitle,
          'QuickTime:Description': cleanDescription,
          'QuickTime:Keywords': metadata.keywords.join(', '),
        });
      } else {
        Object.assign(tags, {
          // IPTC metadata (no lang attributes)
          'IPTC:ObjectName': cleanTitle,
          'IPTC:Caption-Abstract': cleanDescription,
          'IPTC:Keywords': metadata.keywords,

          // EXIF metadata (no lang attributes)
          'EXIF:ImageDescription': cleanDescription,
          'EXIF:XPTitle': cleanTitle,
          'EXIF:XPComment': cleanDescription,
          'EXIF:XPKeywords': metadata.keywords.join(';'),

          // Windows-specific EXIF fields
          'EXIF:XPSubject': metadata.keywords.join(';'),
        });
      }

      await exiftool.write(filePath, tags, { writeArgs: ['-overwrite_original', '-P'] });
      console.log(`Successfully embedded XMP-free metadata in ${filePath}`);
      return; // Success, exit the retry loop

    } catch (error: any) {
      retryCount++;
      console.error(`Failed to embed XMP-free metadata in ${filePath} (attempt ${retryCount}/${maxRetries}):`, error);

      // If this is a BatchCluster error and we have retries left, recreate the ExifTool instance
      if (error.message && error.message.includes('BatchCluster has ended') && retryCount < maxRetries) {
        console.log('BatchCluster error detected, recreating ExifTool instance...');
        cleanupExifTool();
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      // If we've exhausted retries or it's a different error, throw
      if (retryCount >= maxRetries) {
        throw error;
      }
    }
  }
}

// Clean up exiftool process when app exits
export function cleanupExifTool() {
  if (exiftoolInstance) {
    exiftoolInstance.end();
    exiftoolInstance = null;
  }
}

// Set up cleanup handlers
process.on('exit', cleanupExifTool);
process.on('SIGINT', cleanupExifTool);
process.on('SIGTERM', cleanupExifTool);