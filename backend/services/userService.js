/**
 * User Service
 * 
 * Handles all database operations related to user records
 * in the Supabase PostgreSQL database.
 * 
 * Table: users
 * Columns:
 *   - id (uuid, primary key)
 *   - name (text)
 *   - email (text, unique)
 *   - encrypted_face_embedding (text) — AES-256 encrypted biometric data
 *   - created_at (timestamp with time zone)
 */

const supabase = require('./supabaseClient');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new user record with encrypted biometric data.
 * 
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} encryptedEmbedding - AES-256 encrypted face embedding
 * @returns {Object} The created user record
 */
async function createUser(name, email, encryptedEmbedding) {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        id: uuidv4(),
        name,
        email: email.toLowerCase().trim(),
        encrypted_face_embedding: encryptedEmbedding,
      },
    ])
    .select();

  if (error) {
    console.error('[UserService] Error creating user:', error.message);
    throw new Error(`Failed to create user: ${error.message}`);
  }

  console.log(`[UserService] User created: ${email}`);
  return data[0];
}

/**
 * Retrieve a user by their email address.
 * 
 * @param {string} email - User's email address
 * @returns {Object|null} User record or null if not found
 */
async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    console.error('[UserService] Error fetching user:', error.message);
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
}

/**
 * Retrieve all registered users (for demonstration purposes).
 * Returns user info without the encrypted embeddings.
 * 
 * @returns {Object[]} Array of user records (id, name, email, created_at)
 */
async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[UserService] Error fetching users:', error.message);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data;
}

module.exports = {
  createUser,
  getUserByEmail,
  getAllUsers,
};
