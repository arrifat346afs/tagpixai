const path = require('path');
const fs = require('fs');

// Simulate the app.getAppPath() function
const appPath = process.cwd();

// Test the development path
const devPath = path.join(appPath, '/dist-electron/preload.cjs');
console.log('Development path:', devPath);
console.log('File exists:', fs.existsSync(devPath));

// Test the production path
const prodPath = path.join(appPath, '../preload.cjs');
console.log('Production path (relative):', prodPath);

// For testing, let's also check the absolute path that would be used in the error message
const absoluteProdPath = path.join(appPath, 'dist/win-unpacked/resources/preload.cjs');
console.log('Production path (absolute):', absoluteProdPath);

// Check if the preload file exists in the dist directory
const distElectronPath = path.join(appPath, 'dist-electron/preload.cjs');
console.log('dist-electron/preload.cjs exists:', fs.existsSync(distElectronPath));

// Check if the resources directory exists in the dist directory
const resourcesPath = path.join(appPath, 'dist/win-unpacked/resources');
console.log('dist/win-unpacked/resources exists:', fs.existsSync(resourcesPath));

// If resources directory exists, check if preload.cjs exists there
if (fs.existsSync(resourcesPath)) {
  const resourcesPreloadPath = path.join(resourcesPath, 'preload.cjs');
  console.log('resources/preload.cjs exists:', fs.existsSync(resourcesPreloadPath));
}
