import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fontConfig } from '../src/configs/font';

const DIST_DIR = 'dist';

function main() {
    console.log('\x1b[36m%s\x1b[0m', '>> Starting intelligent font-spider compression...');

    // 1. Check if enabled in config
    if (!fontConfig.enable) {
        console.log('Custom fonts are disabled in config. Skipping.');
        return;
    }

    // 2. Extract fonts from imported config object
    const fontSrcs = fontConfig.fonts.map(font => font.src);

    if (fontSrcs.length === 0) {
        console.log('No custom fonts found in config to compress.');
        return;
    }

    console.log(`Found ${fontSrcs.length} font(s) to compress: ${fontSrcs.join(', ')}`);

    // 3. Find HTML files recursively
    if (!fs.existsSync(DIST_DIR)) {
        console.error(`Dist directory '${DIST_DIR}' not found. Did you run build?`);
        process.exit(1);
    }

    // recursive: true requires Node 20.1.0+
    let htmlFiles: string[] = [];
    try {
        // @ts-ignore
        const files = fs.readdirSync(DIST_DIR, { recursive: true }) as string[];
        htmlFiles = files
            .filter(file => file.endsWith('.html'))
            .map(file => path.join(DIST_DIR, file));
    } catch (e) {
        console.warn('fs.readdir recursive failed, falling back to manual recursion.');
        htmlFiles = findFilesRecursive(DIST_DIR);
    }

    if (htmlFiles.length === 0) {
        console.log('No HTML files found in dist directory.');
        return;
    }
    console.log(`Found ${htmlFiles.length} HTML files.`);

    // 4. Construct Arguments
    // --map '/url/path,local/path'
    const mapArgs = fontSrcs.map(src => {
        // Remove leading slash for local path construction
        const relativePath = src.startsWith('/') ? src.slice(1) : src;
        const localPath = path.join(DIST_DIR, relativePath);
        // Map format: '/web/path,local/fs/path'
        return `--map '${src},${localPath}'`;
    }).join(' ');

    // 5. Execute font-spider
    const fileListStr = htmlFiles.map(f => `"${f}"`).join(' ');
    const command = `npx font-spider ${fileListStr} ${mapArgs}`;
    
    console.log('Executing font-spider...');
    try {
        execSync(command, { stdio: 'inherit', maxBuffer: 1024 * 1024 * 50 });
        console.log('\x1b[32m%s\x1b[0m', '>> Font compression completed successfully.');
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '>> Font compression failed.');
        process.exit(1);
    }
}

function findFilesRecursive(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findFilesRecursive(fullPath));
        } else {
            if (fullPath.endsWith('.html')) results.push(fullPath);
        }
    });
    return results;
}

main();
