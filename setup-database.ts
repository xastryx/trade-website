import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL or NEON_DATABASE_URL environment variable is required")
  process.exit(1)
}

const sql = neon(DATABASE_URL)

const schema = `
-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  game TEXT NOT NULL,
  section TEXT,
  image_url TEXT,
  rap_value NUMERIC(12,2),
  demand TEXT,
  rarity TEXT,
  value_f NUMERIC(12,2),
  value_fr NUMERIC(12,2),
  value_n NUMERIC(12,2),
  value_nf NUMERIC(12,2),
  value_nfr NUMERIC(12,2),
  value_nr NUMERIC(12,2),
  value_r NUMERIC(12,2),
  pot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, game, section)
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  discord_id TEXT,
  username TEXT NOT NULL,
  avatar_url TEXT,
  game TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  offering JSONB NOT NULL DEFAULT '[]',
  looking_for JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  discord_id TEXT,
  username TEXT NOT NULL,
  action_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  discord_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page views table
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  page_path TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User inventories table
CREATE TABLE IF NOT EXISTS user_inventories (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_game ON items(game);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_game_section ON items(game, section);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_discord_id ON trades(discord_id);
CREATE INDEX IF NOT EXISTS idx_trades_game ON trades(game);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_discord_id ON activities(discord_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_discord_id ON sessions(discord_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
`

async function setupDatabase() {
  try {
    console.log("🔄 Setting up Neon database...\n")

    // Execute the entire schema as a single transaction
    await sql(schema)

    console.log("✅ Database setup completed successfully!\n")
    console.log("📊 Created tables:")
    console.log("  - profiles")
    console.log("  - items")
    console.log("  - trades")
    console.log("  - activities")
    console.log("  - sessions")
    console.log("  - page_views")
    console.log("  - user_inventories")
    console.log("\n🎉 Your database is ready to use!")
  } catch (error) {
    console.error("❌ Error setting up database:", error)
    process.exit(1)
  }
}

setupDatabase()
