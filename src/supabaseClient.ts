import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Used ONLY for Realtime subscriptions — safe to expose in the browser.
// The service_role key lives only in the Flask backend.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
