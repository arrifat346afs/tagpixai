import { exiftool } from 'exiftool-vendored';
import path from 'path';

interface MetadataToEmbed {
  title: string;
  description: string;
  keywords: string[];
}

export async function embedMetadata(filePath: string, metadata: MetadataToEmbed): Promise<void> {
  try {
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
    await exiftool.write(filePath, tags, [
      '-overwrite_original',
      '-P',  // Preserve file modification date/time
      '-codedcharacterSet=utf8'  // Ensure proper encoding
    ]);
    
    console.log(`Successfully embedded metadata in ${filePath}`);
  } catch (error) {
    console.error(`Failed to embed metadata in ${filePath}:`, error);
    throw error;
  }
}

// Most effective solution: Completely avoid XMP and use only IPTC/EXIF
export async function embedMetadataNoXMP(filePath: string, metadata: MetadataToEmbed): Promise<void> {
  try {
    const cleanTitle = metadata.title.replace(/lang="[^"]*"\s*|^"|"$/g, '').trim();
    const cleanDescription = metadata.description.replace(/lang="[^"]*"\s*|^"|"$/g, '').trim();

    const extension = path.extname(filePath).toLowerCase();
    const isVideo = ['.mp4', '.mov', '.avi', '.mkv'].includes(extension);

    // Remove ALL XMP metadata first to ensure clean slate
    await exiftool.write(filePath, {}, ['-XMP:all=', '-overwrite_original']);

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

    await exiftool.write(filePath, tags, ['-overwrite_original', '-P']);
    console.log(`Successfully embedded XMP-free metadata in ${filePath}`);
  } catch (error) {
    console.error(`Failed to embed XMP-free metadata in ${filePath}:`, error);
    throw error;
  }
}

// Clean up exiftool process when app exits
process.on('exit', () => {
  exiftool.end();
});