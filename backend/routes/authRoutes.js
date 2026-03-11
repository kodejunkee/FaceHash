/**
 * API Routes
 * 
 * Defines the REST API endpoints for the FaceHash system.
 * 
 * Endpoints:
 *   POST /api/register  — Register a user with facial biometric data
 *   POST /api/login     — Authenticate a user via facial recognition
 *   GET  /api/users     — List all registered users (demo)
 *   GET  /api/health    — API health check
 * 
 * Image uploads are handled by multer middleware (stored in memory).
 */

const express = require('express');
const multer = require('multer');
const { register, login, getUsers, healthCheck } = require('../controllers/authController');

const router = express.Router();

// Configure multer for in-memory file storage
// Images are stored as buffers — they are NOT saved to disk
// This ensures raw face images are never persisted
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// ──────────────────────────────────────────────
// Route Definitions
// ──────────────────────────────────────────────

/**
 * POST /api/register
 * Body: multipart/form-data { name, email, image }
 */
router.post('/register', upload.single('image'), register);

/**
 * POST /api/login
 * Body: multipart/form-data { email, image }
 */
router.post('/login', upload.single('image'), login);

/**
 * GET /api/users
 * Returns all registered users (without biometric data)
 */
router.get('/users', getUsers);

/**
 * GET /api/health
 * API health check
 */
router.get('/health', healthCheck);

module.exports = router;
