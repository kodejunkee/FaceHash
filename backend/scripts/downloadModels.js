/**
 * Download face-api.js Model Weights
 * 
 * This script downloads the required neural network model weight files
 * from the @vladmandic/face-api official GitHub repository.
 * 
 * Required models:
 * 1. ssd_mobilenetv1 — Face detection
 * 2. face_landmark_68 — Facial landmark detection
 * 3. face_recognition — Face descriptor generation
 * 
 * Run this script once before starting the server:
 *   node scripts/downloadModels.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, '..', 'models');

// Base URL for model files from @vladmandic/face-api official repo
const BASE_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model';

// Model files to download (vladmandic uses single .bin files)
const MODEL_FILES = [
  // SSD MobileNet v1 — Face Detection
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model.bin',
  // Face Landmark 68 — Landmark Detection
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.bin',
  // Face Recognition — Embedding Generation
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.bin',
];

/**
 * Download a single file from a URL, following redirects.
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    const request = (currentUrl) => {
      https.get(currentUrl, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          file.close();
          fs.unlinkSync(destPath);
          const newFile = fs.createWriteStream(destPath);
          request(response.headers.location);
          return;
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(destPath);
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        file.close();
        fs.unlink(destPath, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

async function main() {
  // Create models directory if it doesn't exist
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
    console.log(`Created directory: ${MODELS_DIR}`);
  }

  console.log('Downloading face-api.js model weights from @vladmandic/face-api...\n');

  let successCount = 0;
  let failCount = 0;

  for (const fileName of MODEL_FILES) {
    const url = `${BASE_URL}/${fileName}`;
    const destPath = path.join(MODELS_DIR, fileName);

    // Skip if file already exists and has content
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      console.log(`  ✓ ${fileName} (already exists)`);
      successCount++;
      continue;
    }

    process.stdout.write(`  ↓ Downloading ${fileName}...`);
    try {
      await downloadFile(url, destPath);
      const size = (fs.statSync(destPath).size / 1024).toFixed(1);
      console.log(` ✓ (${size} KB)`);
      successCount++;
    } catch (error) {
      console.log(` ✗ Error: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\nDownload complete! ${successCount} succeeded, ${failCount} failed.`);
  
  if (failCount > 0) {
    console.log('\nSome model files failed to download. The server may not work correctly.');
    console.log('Please check your internet connection and try again.');
  }
}

main().catch(console.error);
