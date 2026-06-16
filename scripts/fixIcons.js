import { Jimp } from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// #0A1F18 is the dark emerald green background
// Jimp uses RGBA hex: 0x0A1F18FF
const BG_COLOR = 0x0A1F18FF; 

async function fixIcon(filename) {
    const fullPath = path.join(__dirname, '../public', filename);
    console.log(`Processing ${filename}...`);
    
    try {
        const image = await Jimp.read(fullPath);
        
        // Create a new image with the solid background color
        // Note: new Jimp(...) is the older v0.x API, but often works. 
        // Let's use Jimp.create if available, or fallback.
        
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        
        const bg = new Jimp({ width, height, color: BG_COLOR });
        
        // Composite original image (with transparency) over the solid background
        bg.composite(image, 0, 0);
        
        // Overwrite the original
        await bg.write(fullPath);
        console.log(`Successfully fixed background for ${filename}`);
    } catch (err) {
        console.error(`Failed to process ${filename}:`, err);
    }
}

async function run() {
    await fixIcon('pwa-192x192.png');
    await fixIcon('pwa-512x512.png');
    // Also fix apple-touch-icon if it exists
    await fixIcon('apple-touch-icon.png');
}

run();
