/**
 * Supabase Client Configuration
 * 
 * Creates and exports a Supabase client instance that connects
 * to the PostgreSQL database hosted on Supabase.
 * 
 * Supabase provides a PostgreSQL database with a REST API layer.
 * We use the @supabase/supabase-js client library to interact
 * with the database.
 * 
 * Connection credentials are stored in environment variables
 * for security (never hardcoded).
 */

const { createClient } = require('@supabase/supabase-js');

// Read Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validate that credentials are configured
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env');
  process.exit(1);
}

// Create and export the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('[Supabase] Client initialized successfully');

module.exports = supabase;
