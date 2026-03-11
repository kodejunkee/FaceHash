/**
 * AES-256-CBC Encryption Module
 * 
 * This module handles encryption and decryption of facial biometric
 * embeddings using the AES-256-CBC symmetric encryption algorithm.
 * 
 * AES-256-CBC uses:
 * - 256-bit encryption key (32 bytes)
 * - 128-bit initialization vector (IV) for each encryption operation
 * - CBC (Cipher Block Chaining) mode for enhanced security
 * 
 * The IV is randomly generated for each encryption and stored
 * alongside the ciphertext to enable decryption.
 */

const crypto = require('crypto');

// AES-256 requires a 32-byte (256-bit) key
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size is 128 bits (16 bytes)

/**
 * Encrypts biometric embedding data using AES-256-CBC.
 * 
 * Process:
 * 1. Serialize the embedding array to a JSON string
 * 2. Generate a random Initialization Vector (IV)
 * 3. Encrypt the data using AES-256-CBC
 * 4. Return the IV + ciphertext as a combined base64 string
 * 
 * @param {number[]} embeddingData - The facial embedding array (128-dimensional float array)
 * @returns {string} Base64-encoded string containing IV + encrypted data
 */
function encryptBiometricData(embeddingData) {
  // Validate input
  if (!embeddingData || !Array.isArray(embeddingData)) {
    throw new Error('Invalid embedding data: must be a non-empty array');
  }

  // Get encryption key from environment variables
  const encryptionKey = process.env.AES_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('AES_ENCRYPTION_KEY is not set in environment variables');
  }

  // Convert hex key string to a 32-byte buffer
  const keyBuffer = Buffer.from(encryptionKey, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('AES_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }

  // Step 1: Serialize the embedding to JSON
  const plaintext = JSON.stringify(embeddingData);

  // Step 2: Generate a random IV for this encryption operation
  // A new IV is generated each time to ensure identical plaintext
  // produces different ciphertext (semantic security)
  const iv = crypto.randomBytes(IV_LENGTH);

  // Step 3: Create cipher and encrypt
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Step 4: Combine IV and ciphertext
  // The IV is prepended to the ciphertext so it can be extracted during decryption
  // IV is not secret — it just needs to be unique and unpredictable
  const combined = iv.toString('base64') + ':' + encrypted;

  return combined;
}

/**
 * Decrypts an AES-256-CBC encrypted biometric embedding.
 * 
 * Process:
 * 1. Split the combined string to extract IV and ciphertext
 * 2. Decrypt using AES-256-CBC with the same key
 * 3. Parse the JSON string back to an embedding array
 * 
 * @param {string} encryptedData - Base64-encoded string containing IV + encrypted data
 * @returns {number[]} The original facial embedding array
 */
function decryptBiometricData(encryptedData) {
  // Validate input
  if (!encryptedData || typeof encryptedData !== 'string') {
    throw new Error('Invalid encrypted data: must be a non-empty string');
  }

  // Get encryption key from environment variables
  const encryptionKey = process.env.AES_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('AES_ENCRYPTION_KEY is not set in environment variables');
  }

  // Convert hex key string to a 32-byte buffer
  const keyBuffer = Buffer.from(encryptionKey, 'hex');

  // Step 1: Split IV and ciphertext
  const parts = encryptedData.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(parts[0], 'base64');
  const ciphertext = parts[1];

  // Step 2: Create decipher and decrypt
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  // Step 3: Parse JSON back to array
  const embedding = JSON.parse(decrypted);

  return embedding;
}

module.exports = {
  encryptBiometricData,
  decryptBiometricData,
};
