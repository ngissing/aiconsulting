import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); // Looks for .env in the current working directory (e.g., ./backend/.env)

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Supabase URL not found. Make sure SUPABASE_URL is set in your .env file.');
}
if (!supabaseAnonKey) {
  throw new Error('Supabase anon key not found. Make sure SUPABASE_ANON_KEY is set in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);