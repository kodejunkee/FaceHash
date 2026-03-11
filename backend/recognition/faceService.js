/**
 * Face Recognition Service
 * 
 * Uses @vladmandic/face-api (a maintained fork of face-api.js)
 * to perform:
 * - Face detection (SSD MobileNet v1)
 * - Face landmark extraction (68-point model)
 * - Face descriptor/embedding generation (128-dimensional vector)
 * - Embedding comparison using Euclidean distance
 * 
 * The face descriptor (embedding) is a 128-dimensional floating-point
 * array that uniquely represents a face. Two embeddings from the same
 * person will have a small Euclidean distance between them.
 */

// Import the WASM backend instead of the CPU/Node.js ones
const tf = require('@tensorflow/tfjs');
const wasm = require('@tensorflow/tfjs-backend-wasm');
// Import the specific face-api build that requires WASM instead of tfjs-node
const faceapi = require('@vladmandic/face-api/dist/face-api.node-wasm.js');
const { createCanvas, Image, loadImage } = require('@napi-rs/canvas');
const path = require('path');

// Configure WASM paths before initialization
// This points to the pre-compiled WebAssembly binaries installed by npm
wasm.setWasmPaths(`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${wasm.version_wasm}/dist/`);

// Patch face-api.js to work in Node.js environment
// @napi-rs/canvas provides Canvas and Image implementations
// with prebuilt binaries (no Python or native build tools needed)
faceapi.env.monkeyPatch({
  Canvas: createCanvas(1, 1).constructor,
  Image: Image,
});

// Track whether models have been loaded
let modelsLoaded = false;

/**
 * Load face-api.js neural network models.
 * 
 * Three models are loaded:
 * 1. SSD MobileNet v1 — for face detection (locating faces in images)
 * 2. Face Landmark 68 — for detecting 68 facial landmarks
 * 3. Face Recognition — for generating 128-d face descriptors
 * 
 * Models are loaded once and cached in memory.
 */
async function loadModels() {
  if (modelsLoaded) return;

  // Initialize the WASM backend explicitly
  await tf.setBackend('wasm');
  await tf.ready();
  console.log(`[FaceService] TensorFlow backend initialized: ${tf.getBackend()}`);

  const modelsPath = path.join(__dirname, '..', 'models');
  
  console.log('[FaceService] Loading face detection models...');
  
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
  console.log('[FaceService] ✓ SSD MobileNet v1 loaded');
  
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
  console.log('[FaceService] ✓ Face Landmark 68 loaded');
  
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
  console.log('[FaceService] ✓ Face Recognition Net loaded');

  modelsLoaded = true;
  console.log('[FaceService] All models loaded successfully');
}

/**
 * Extract a face embedding (descriptor) from an image buffer.
 * 
 * Process:
 * 1. Load the image buffer into a Canvas element
 * 2. Run face detection to locate faces
 * 3. Extract facial landmarks (68 points)
 * 4. Generate a 128-dimensional face descriptor
 * 
 * @param {Buffer} imageBuffer - Raw image data (JPEG/PNG)
 * @returns {Float32Array|null} 128-dimensional face descriptor, or null if no face found
 */
async function extractEmbedding(imageBuffer) {
  // Ensure models are loaded
  await loadModels();

  // Load image into canvas
  const img = await loadImage(imageBuffer);
  const cvs = createCanvas(img.width, img.height);
  const ctx = cvs.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // Workaround for WASM backend compatibility with @napi-rs/canvas
  // The WASM backend crashes if we pass the simulated Canvas directly.
  // Instead, we extract the raw pixel RGBA values and manually build
  // a purely numerical 3D Tensor [Height, Width, 3 (RGB)]
  const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
  const rgbData = new Uint8Array(cvs.width * cvs.height * 3);
  for (let i = 0; i < cvs.width * cvs.height; i++) {
    rgbData[i * 3] = imgData.data[i * 4];         // R
    rgbData[i * 3 + 1] = imgData.data[i * 4 + 1]; // G
    rgbData[i * 3 + 2] = imgData.data[i * 4 + 2]; // B
  }
  const tensor = tf.tensor3d(rgbData, [cvs.height, cvs.width, 3], 'int32');

  // Detect face with landmarks and compute descriptor
  // detectSingleFace finds the most prominent face in the image
  const detection = await faceapi
    .detectSingleFace(tensor)
    .withFaceLandmarks()
    .withFaceDescriptor();

  // Free memory
  tensor.dispose();

  if (!detection) {
    console.log('[FaceService] No face detected in the image');
    return null;
  }

  console.log('[FaceService] Face detected, embedding extracted');
  
  // The descriptor is a Float32Array of 128 values
  // Convert to a regular array for JSON serialization
  return Array.from(detection.descriptor);
}

/**
 * Compare two face embeddings using Euclidean distance.
 * 
 * Euclidean distance measures the straight-line distance between
 * two points in 128-dimensional space. A smaller distance means
 * the faces are more similar.
 * 
 * Formula: d = sqrt(sum((a[i] - b[i])^2))
 * 
 * Typical thresholds:
 * - < 0.4: Very likely the same person
 * - < 0.6: Probably the same person (recommended threshold)
 * - > 0.6: Likely different people
 * 
 * @param {number[]} embedding1 - First face embedding (128-d array)
 * @param {number[]} embedding2 - Second face embedding (128-d array)
 * @returns {{ match: boolean, distance: number, threshold: number }}
 */
function compareEmbeddings(embedding1, embedding2) {
  if (!embedding1 || !embedding2) {
    throw new Error('Both embeddings are required for comparison');
  }

  if (embedding1.length !== embedding2.length) {
    throw new Error('Embedding dimensions do not match');
  }

  // Calculate Euclidean distance
  let sumOfSquares = 0;
  for (let i = 0; i < embedding1.length; i++) {
    const diff = embedding1[i] - embedding2[i];
    sumOfSquares += diff * diff;
  }
  const distance = Math.sqrt(sumOfSquares);

  // Get threshold from environment or use default
  const threshold = parseFloat(process.env.FACE_MATCH_THRESHOLD) || 0.6;

  const match = distance < threshold;

  console.log(`[FaceService] Comparison — Distance: ${distance.toFixed(4)}, Threshold: ${threshold}, Match: ${match}`);

  return {
    match,
    distance: parseFloat(distance.toFixed(4)),
    threshold,
  };
}

module.exports = {
  loadModels,
  extractEmbedding,
  compareEmbeddings,
};
