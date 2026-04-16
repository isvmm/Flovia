"use client";

import * as supabaseJs from "@supabase/supabase-js";

let client = null;

export function createClient() {
  if (client) return client;
  client = supabaseJs.createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
  return client;
}
