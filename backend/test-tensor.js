const tf = require('@tensorflow/tfjs');
const wasm = require('@tensorflow/tfjs-backend-wasm');
const faceapi = require('@vladmandic/face-api/dist/face-api.node-wasm.js');
const { createCanvas } = require('@napi-rs/canvas');
const path = require('path');

wasm.setWasmPaths(`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${wasm.version_wasm}/dist/`);

faceapi.env.monkeyPatch({
  Canvas: createCanvas(1, 1).constructor,
  Image: require('@napi-rs/canvas').Image,
});

async function test() {
  await tf.setBackend('wasm');
  await tf.ready();
  
  const modelsPath = path.join(__dirname, 'models');
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
  
  const cvs = createCanvas(100, 100);
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(0,0,100,100);
  const imgData = ctx.getImageData(0,0,100,100);
  
  // Try raw tensor
  const rgbData = new Uint8Array(cvs.width * cvs.height * 3);
  for(let i = 0; i < cvs.width * cvs.height; i++) {
    rgbData[i*3] = imgData.data[i*4];
    rgbData[i*3+1] = imgData.data[i*4+1];
    rgbData[i*3+2] = imgData.data[i*4+2];
  }
  
  const tensor = tf.tensor3d(rgbData, [cvs.height, cvs.width, 3], 'int32');
  console.log('Tensor created:', tensor.shape);
  
  try {
    const res = await faceapi.detectSingleFace(tensor).withFaceLandmarks().withFaceDescriptor();
    console.log('Detection ran without crashing!', res || 'No face found');
  } catch(e) {
    console.error('Crash Details:', e);
  }
}
test().catch(console.error);
