#!/usr/bin/env node

// Test script to verify ExifTool functionality in the packaged app
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Testing ExifTool functionality...');

// Check if we're in a packaged environment
const isPackaged = process.env.NODE_ENV === 'production' || !process.cwd().includes('node_modules');
console.log('Is packaged:', isPackaged);
console.log('Current working directory:', process.cwd());
console.log('Process resource path:', process.resourcesPath || 'Not available');

// Try to find ExifTool binary
const possiblePaths = [
  // Standard system path
  'exiftool',
  // Packaged paths
  path.join(process.resourcesPath || '', 'exiftool-vendored', 'bin', 'exiftool'),
  path.join(process.resourcesPath || '', 'app.asar.unpacked', 'node_modules', 'exiftool-vendored.pl', 'bin', 'exiftool'),
  path.join(process.resourcesPath || '', 'node_modules', 'exiftool-vendored.pl', 'bin', 'exiftool'),
  // Development paths
  path.join(__dirname, 'node_modules', 'exiftool-vendored.pl', 'bin', 'exiftool'),
];

console.log('\nSearching for ExifTool binary in:');
possiblePaths.forEach(p => console.log(` - ${p}`));

async function testExifTool() {
  for (const exiftoolPath of possiblePaths) {
    try {
      console.log(`\nTesting: ${exiftoolPath}`);
      
      // Check if file exists (for absolute paths)
      if (path.isAbsolute(exiftoolPath) && !fs.existsSync(exiftoolPath)) {
        console.log('  File does not exist');
        continue;
      }
      
      // Try to run exiftool -ver
      const result = await new Promise((resolve, reject) => {
        const child = spawn(exiftoolPath, ['-ver'], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 5000
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        child.on('close', (code) => {
          resolve({ code, stdout, stderr });
        });
        
        child.on('error', (error) => {
          reject(error);
        });
      });
      
      if (result.code === 0) {
        console.log(`  ✅ SUCCESS! ExifTool version: ${result.stdout.trim()}`);
        return exiftoolPath;
      } else {
        console.log(`  ❌ Failed with code ${result.code}`);
        if (result.stderr) console.log(`  Error: ${result.stderr}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n❌ ExifTool not found in any of the expected locations');
  return null;
}

testExifTool().then(foundPath => {
  if (foundPath) {
    console.log(`\n🎉 ExifTool is working! Found at: ${foundPath}`);
  } else {
    console.log('\n💥 ExifTool test failed');
  }
}).catch(error => {
  console.error('Test failed with error:', error);
});
