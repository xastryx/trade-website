/**
 * Creates a Supabase client with service role key to bypass RLS.
 * WARNING: Only use on the server! Never expose service role key to client.
 */
export function createAdminClient() {
  throw new Error("Supabase has been removed. Use Neon database functions from lib/neon/server.ts instead.")
}
