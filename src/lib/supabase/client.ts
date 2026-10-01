import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isLocalPreview = process.env.NODE_ENV === "development";
  const url = configuredUrl || (isLocalPreview ? "http://127.0.0.1:54321" : undefined);
  const key = configuredKey || (isLocalPreview ? "local-preview-anon-key" : undefined);

  if (!url || !key) {
    throw new Error(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must both be set in production."
    );
  }

  _client = createClient(url, key);
  return _client;
}

/** @deprecated Use getSupabaseClient() for explicit error handling */
export const supabase = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return null as unknown as SupabaseClient;
  return createClient(url, key);
})();
