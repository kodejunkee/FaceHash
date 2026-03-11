/**
 * Authentication Controller
 * 
 * Handles the core business logic for:
 * - User registration with facial biometrics
 * - User authentication via facial recognition
 * - Retrieving registered users
 * 
 * Flow:
 * 1. Receive face image from mobile app
 * 2. Extract face embedding using face-api.js
 * 3. Encrypt/decrypt embedding using AES-256-CBC
 * 4. Store/retrieve from Supabase PostgreSQL
 */

const { extractEmbedding, compareEmbeddings } = require('../recognition/faceService');
const { encryptBiometricData, decryptBiometricData } = require('../encryption/aes');
const { createUser, getUserByEmail, getAllUsers } = require('../services/userService');

/**
 * POST /api/register
 * 
 * Register a new user with facial biometric data.
 * 
 * Request: multipart/form-data
 *   - name: string
 *   - email: string
 *   - image: file (JPEG/PNG face photo)
 * 
 * Process:
 *   1. Validate input (name, email, image)
 *   2. Check if email is already registered
 *   3. Extract face embedding from image
 *   4. Encrypt embedding using AES-256-CBC
 *   5. Store encrypted embedding in Supabase
 */
async function register(req, res) {
  try {
    // Step 1: Validate input
    const { name, email } = req.body;
    const imageFile = req.file;

    if (!name || !email || !imageFile) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and face image are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    console.log(`[Register] Processing registration for: ${email}`);

    // Step 2: Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email is already registered',
      });
    }

    // Step 3: Extract face embedding from the uploaded image
    console.log('[Register] Extracting face embedding...');
    const embedding = await extractEmbedding(imageFile.buffer);

    if (!embedding) {
      return res.status(400).json({
        success: false,
        message: 'No face detected in the image. Please try again with a clear face photo.',
      });
    }

    console.log(`[Register] Embedding extracted (${embedding.length} dimensions)`);

    // Step 4: Encrypt the embedding using AES-256-CBC
    console.log('[Register] Encrypting biometric data...');
    const encryptedEmbedding = encryptBiometricData(embedding);
    console.log('[Register] Biometric data encrypted successfully');

    // Step 5: Store in Supabase PostgreSQL
    console.log('[Register] Storing encrypted data in database...');
    const user = await createUser(name, email, encryptedEmbedding);

    console.log(`[Register] User registered successfully: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('[Register] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message,
    });
  }
}

/**
 * POST /api/login
 * 
 * Authenticate a user via facial recognition.
 * 
 * Request: multipart/form-data
 *   - email: string
 *   - image: file (JPEG/PNG face photo)
 * 
 * Process:
 *   1. Validate input
 *   2. Retrieve user by email
 *   3. Extract face embedding from login image
 *   4. Decrypt stored embedding from database
 *   5. Compare embeddings using Euclidean distance
 *   6. Return authentication result
 */
async function login(req, res) {
  try {
    // Step 1: Validate input
    const { email } = req.body;
    const imageFile = req.file;

    if (!email || !imageFile) {
      return res.status(400).json({
        success: false,
        message: 'Email and face image are required',
      });
    }

    console.log(`[Login] Processing login for: ${email}`);

    // Step 2: Retrieve user from database
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email. Please register first.',
      });
    }

    // Step 3: Extract face embedding from login image
    console.log('[Login] Extracting face embedding from login image...');
    const loginEmbedding = await extractEmbedding(imageFile.buffer);

    if (!loginEmbedding) {
      return res.status(400).json({
        success: false,
        message: 'No face detected in the image. Please try again.',
      });
    }

    // Step 4: Decrypt stored embedding from database
    console.log('[Login] Decrypting stored biometric data...');
    const storedEmbedding = decryptBiometricData(user.encrypted_face_embedding);
    console.log('[Login] Stored biometric data decrypted successfully');

    // Step 5: Compare embeddings
    console.log('[Login] Comparing face embeddings...');
    const result = compareEmbeddings(loginEmbedding, storedEmbedding);

    // Step 6: Return authentication result
    if (result.match) {
      console.log(`[Login] Authentication SUCCESSFUL for: ${email}`);
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        comparison: {
          distance: result.distance,
          threshold: result.threshold,
          match: true,
        },
      });
    } else {
      console.log(`[Login] Authentication FAILED for: ${email}`);
      res.status(401).json({
        success: false,
        message: 'Face does not match. Authentication failed.',
        comparison: {
          distance: result.distance,
          threshold: result.threshold,
          match: false,
        },
      });
    }
  } catch (error) {
    console.error('[Login] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: error.message,
    });
  }
}

/**
 * GET /api/users
 * 
 * Retrieve all registered users (for demonstration purposes).
 * Does NOT return encrypted embeddings for security.
 */
async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('[Users] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message,
    });
  }
}

/**
 * GET /api/health
 * 
 * API health check endpoint.
 */
function healthCheck(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'FaceHash API is running',
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  register,
  login,
  getUsers,
  healthCheck,
};
