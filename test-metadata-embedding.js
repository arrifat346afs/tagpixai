#!/usr/bin/env node

/**
 * Test script to verify metadata embedding functionality
 * This script can be run to test if ExifTool is working properly in the AppImage environment
 */

const { embedMetadata } = require('./dist-electron/metadata/embedMetadata.js');
const path = require('path');
const fs = require('fs');

async function testMetadataEmbedding() {
  console.log('Testing metadata embedding functionality...');
  console.log('App is packaged:', process.env.NODE_ENV === 'production');
  console.log('Process resourcesPath:', process.resourcesPath);
  console.log('Process platform:', process.platform);
  console.log('Process cwd:', process.cwd());

  // Create a test image file if it doesn't exist
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  
  if (!fs.existsSync(testImagePath)) {
    console.log('Test image not found. Please provide a test image at:', testImagePath);
    console.log('You can copy any JPEG image to this location for testing.');
    return;
  }

  const testMetadata = {
    title: 'Test Image Title',
    description: 'This is a test description for metadata embedding',
    keywords: ['test', 'metadata', 'embedding', 'appimage']
  };

  try {
    console.log('Attempting to embed metadata...');
    console.log('Test metadata:', testMetadata);
    
    await embedMetadata(testImagePath, testMetadata);
    
    console.log('✅ Metadata embedding successful!');
    console.log('Test completed successfully.');
    
  } catch (error) {
    console.error('❌ Metadata embedding failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    // Provide troubleshooting information
    console.log('\n🔧 Troubleshooting information:');
    
    if (error.message.includes('spawn') || error.message.includes('ENOENT')) {
      console.log('- This appears to be an ExifTool binary issue');
      console.log('- Check if ExifTool is properly bundled in the AppImage');
      console.log('- Verify the ExifTool binary paths in the embedMetadata.ts file');
    }
    
    if (error.message.includes('timeout')) {
      console.log('- ExifTool process timed out');
      console.log('- This might be due to AppImage sandboxing or process limitations');
      console.log('- Consider increasing timeout values or using alternative metadata embedding methods');
    }
    
    if (error.message.includes('BatchCluster')) {
      console.log('- ExifTool BatchCluster error detected');
      console.log('- This usually indicates process management issues');
      console.log('- The application should automatically retry with a fresh ExifTool instance');
    }
  }
}

// Run the test
testMetadataEmbedding().catch(console.error);
