'use strict';

const fs = require('fs');
const path = require('path');

module.exports = async function(context) {
    const { appOutDir, outDir } = context;
    const localesDir = path.join(appOutDir, 'locales');
    
    try {
        // Keep only specified languages
        if (fs.existsSync(localesDir)) {
            console.log('📦 Optimizing locales...');
            const files = fs.readdirSync(localesDir);
            const keepLanguages = ['en-US.pak'];
            
            for (const file of files) {
                if (!keepLanguages.includes(file)) {
                    fs.unlinkSync(path.join(localesDir, file));
                    console.log(`   Removed locale: ${file}`);
                }
            }
        }

        // Remove unnecessary Chromium files that aren't critical
        console.log('🧹 Cleaning up unnecessary files...');
        const unnecessaryFiles = [
            'chrome_200_percent.pak',
            'LICENSE.electron.txt',
            'LICENSES.chromium.html',
            'version',
            'resources/default_app.asar'
        ];

        for (const file of unnecessaryFiles) {
            const filePath = path.join(appOutDir, file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`   Removed: ${file}`);
            }
        }

        // Clean up development and debug files from output directory
        console.log('🧹 Removing debug files...');
        const debugFiles = [
            'debug.log',
            'builder-debug.yml',
            'builder-effective-config.yaml'
        ];

        for (const file of debugFiles) {
            const filePath = path.join(outDir, file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`   Removed: ${file}`);
            }
        }

        console.log('✅ Build optimization completed successfully');
    } catch (error) {
        console.error('❌ Error during build optimization:', error);
        throw error;
    }
};

