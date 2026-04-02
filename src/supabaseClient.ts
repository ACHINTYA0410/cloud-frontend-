import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

// Used only for Realtime subscriptions. If env vars are missing, disable realtime gracefully.
export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
