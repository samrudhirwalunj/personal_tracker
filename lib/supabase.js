import { createClient } from "@supabase/supabase-js";

let client;

// Server-only client using the service role key (bypasses RLS by design).
// Every query module below scopes rows with .eq("user_id", userId) itself —
// RLS on the tables is a defense-in-depth backstop, not the primary guard here,
// since this key never reaches the browser.
export function getSupabase() {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}
