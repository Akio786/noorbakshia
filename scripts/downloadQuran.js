import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'https://api.alquran.cloud/v1';
const OUTPUT_DIR = path.join(__dirname, '../public/api/quran');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const downloadJSON = (url, filepath) => {
    return new Promise((resolve, reject) => {
        console.log(`Downloading ${url}...`);
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}. Status code: ${res.statusCode}`));
                return;
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    // We parse and stringify to ensure it's valid JSON and potentially minify it
                    const json = JSON.parse(data);
                    fs.writeFileSync(filepath, JSON.stringify(json));
                    console.log(`Successfully saved ${filepath} (${(data.length / 1024 / 1024).toFixed(2)} MB)`);
                    resolve();
                } catch (e) {
                    reject(new Error(`Error parsing JSON from ${url}: ${e.message}`));
                }
            });
        }).on('error', (err) => reject(err));
    });
};

const run = async () => {
    try {
        console.log("Starting full Quran download for offline PWA...");
        
        // 1. Meta
        await downloadJSON(`${API_BASE}/meta`, path.join(OUTPUT_DIR, 'meta.json'));
        
        // 2. Arabic Tajweed
        await downloadJSON(`${API_BASE}/quran/quran-tajweed`, path.join(OUTPUT_DIR, 'arabic.json'));
        
        // 3. English Sahih
        await downloadJSON(`${API_BASE}/quran/en.sahih`, path.join(OUTPUT_DIR, 'english.json'));
        
        // 4. Urdu Junagarhi
        await downloadJSON(`${API_BASE}/quran/ur.junagarhi`, path.join(OUTPUT_DIR, 'urdu.json'));

        console.log("All Quran data successfully downloaded!");
    } catch (err) {
        console.error("Download failed:", err);
    }
};

run();
