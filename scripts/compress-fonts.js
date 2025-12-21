import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const fontConfigPath = path.join(process.cwd(), 'src', 'configs', 'font.ts');

try {
    const content = fs.readFileSync(fontConfigPath, 'utf-8');

    // Regex to extract the 'src' property from the fonts array objects
    // Matches: src: "/path/to/font.ttf" or src: '/path/to/font.ttf'
    const srcMatches = content.matchAll(/src:\s*["']([^"']+)["']/g);
    const srcs = [];
    for (const match of srcMatches) {
        srcs.push(match[1]);
    }

    if (srcs.length === 0) {
        console.log('No fonts found in src/configs/font.ts. Skipping font-spider.');
        process.exit(0);
    }

    // Construct --map arguments
    // Example: --map "/MiSans-Regular.ttf,dist/MiSans-Regular.ttf"
    const maps = srcs.map(src => {
        // Ensure src starts with / for the web path
        const webPath = src.startsWith('/') ? src : '/' + src;
        // Construct local path in dist directory (remove leading / for path.join to work correctly relative to cwd)
        const localPath = path.join('dist', webPath);
        return `--map "${webPath},${localPath}"`;
    }).join(' ');

    const command = `npx font-spider ./dist/**/*.html ${maps}`;
    console.log(`Executing: ${command}`);

    execSync(command, { stdio: 'inherit' });

} catch (error) {
    console.error('Error executing font-spider script:', error);
    process.exit(1);
}
