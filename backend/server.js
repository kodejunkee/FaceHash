/**
 * FaceHash API — Server Entry Point
 * 
 * This is the main entry point for the backend server.
 * It configures Express with:
 * - CORS (Cross-Origin Resource Sharing)
 * - JSON body parsing
 * - API routes
 * - Face recognition model preloading
 * 
 * The server connects to Supabase PostgreSQL for data storage
 * and uses face-api.js for facial biometric processing.
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { loadModels } = require('./recognition/faceService');

const app = express();
const PORT = process.env.PORT || 5000;

// ──────────────────────────────────────────────
// Middleware Configuration
// ──────────────────────────────────────────────

// Enable CORS for all origins (for development/demo purposes)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// ──────────────────────────────────────────────
// Mount API Routes
// ──────────────────────────────────────────────

app.use('/api', authRoutes);

// Root route — API information
app.get('/', (req, res) => {
  res.json({
    name: 'FaceHash API',
    version: '1.0.0',
    description: 'Security of Facial Biometric Data in PostgreSQL using AES',
    endpoints: {
      register: 'POST /api/register',
      login: 'POST /api/login',
      users: 'GET /api/users',
      health: 'GET /api/health',
    },
  });
});

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────

async function startServer() {
  try {
    // Preload face recognition models on startup
    // This avoids loading delay on the first request
    console.log('─────────────────────────────────────────');
    console.log('FaceHash API');
    console.log('─────────────────────────────────────────');
    
    console.log('\nPreloading face recognition models...');
    await loadModels();
    
    console.log('');

    // Start Express server on all network interfaces
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running locally on http://localhost:${PORT}`);
      console.log(`✓ Server running on network at http://192.168.3.13:${PORT}`);
      console.log(`✓ Health check: http://192.168.3.13:${PORT}/api/health`);
      console.log('─────────────────────────────────────────\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
