/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  throw new Error("Supabase has been removed. Use Neon database functions from lib/neon/server.ts instead.")
}

export const createServerClient = createClient
