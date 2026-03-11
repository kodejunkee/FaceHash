/**
 * API Service
 * 
 * Handles all HTTP communication between the React Native app
 * and the backend Express API.
 * 
 * Uses axios for HTTP requests and FormData for multipart
 * file uploads (face images).
 */

import axios from 'axios';

// ──────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────
// Change this to your backend server's IP address
// Use your computer's local network IP (not localhost)
// Find it with: ipconfig (Windows) or ifconfig (Mac/Linux)
const API_BASE_URL = 'http://192.168.3.13:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 second timeout (WASM face processing without hardware acceleration can be slow on first run)
});

/**
 * Register a new user with facial biometric data.
 * 
 * @param {string} name - User's full name
 * @param {string} email - User's email
 * @param {string} imageUri - Local URI of the captured face image
 * @returns {Promise<Object>} Registration result
 */
export async function registerUser(name, email, imageUri) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'face.jpg',
  });

  const response = await api.post('/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}

/**
 * Authenticate a user via facial recognition.
 * 
 * @param {string} email - User's email
 * @param {string} imageUri - Local URI of the captured face image
 * @returns {Promise<Object>} Authentication result
 */
export async function loginUser(email, imageUri) {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'face.jpg',
  });

  const response = await api.post('/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}

/**
 * Get all registered users.
 * 
 * @returns {Promise<Object>} List of users
 */
export async function getUsers() {
  const response = await api.get('/users');
  return response.data;
}

/**
 * Check API health.
 * 
 * @returns {Promise<Object>} Health status
 */
export async function healthCheck() {
  const response = await api.get('/health');
  return response.data;
}
