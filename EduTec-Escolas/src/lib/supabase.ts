import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Supabase initialization failed:', error);
      return null;
    }
  }
  return supabaseClient;
}
