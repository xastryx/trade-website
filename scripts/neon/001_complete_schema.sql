-- Complete database schema for Neon
-- Run this to set up your fresh Neon database

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  discord_id text UNIQUE NOT NULL,
  username text,
  global_name text,
  avatar_url text,
  email text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  last_login_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_profiles_discord_id ON public.profiles(discord_id);

-- 2. Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text NOT NULL REFERENCES public.profiles(discord_id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_discord_id ON public.sessions(discord_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions(expires_at);

-- 3. Create items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  value DECIMAL(10, 2) DEFAULT 0,
  game VARCHAR(50) NOT NULL,
  section VARCHAR(100),
  image_url TEXT,
  rarity VARCHAR(50),
  demand VARCHAR(50),
  pot VARCHAR(50),
  rap_value DECIMAL(10, 2) DEFAULT 0,
  neon_value DECIMAL(10, 2) DEFAULT 0,
  mega_value DECIMAL(10, 2) DEFAULT 0,
  fly_bonus DECIMAL(10, 2) DEFAULT 50,
  ride_bonus DECIMAL(10, 2) DEFAULT 50,
  exist_count INTEGER DEFAULT 0,
  rating VARCHAR(50),
  change_percent DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_game ON items(game);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_value ON items(value DESC);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);

-- 4. Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text REFERENCES public.profiles(discord_id) ON DELETE CASCADE,
  type text NOT NULL,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_discord_id ON activities(discord_id);
CREATE INDEX IF NOT EXISTS idx_activities_type_created ON activities(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_meta ON activities USING GIN(meta);

-- 5. Create trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text NOT NULL REFERENCES public.profiles(discord_id) ON DELETE CASCADE,
  game text NOT NULL,
  offering jsonb NOT NULL,
  requesting jsonb NOT NULL,
  notes text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trades_game ON public.trades(game);
CREATE INDEX IF NOT EXISTS idx_trades_discord_id ON public.trades(discord_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON public.trades(created_at DESC);

-- 6. Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id uuid NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  participant1_id text NOT NULL REFERENCES public.profiles(discord_id) ON DELETE CASCADE,
  participant2_id text NOT NULL REFERENCES public.profiles(discord_id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT NOW(),
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(trade_id, participant1_id, participant2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_trade_id ON public.conversations(trade_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON public.conversations(participant2_id);

-- 7. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id text NOT NULL REFERENCES public.profiles(discord_id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- 8. Create user_inventories table
CREATE TABLE IF NOT EXISTS public.user_inventories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text NOT NULL REFERENCES public.profiles(discord_id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(discord_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_inventories_discord_id ON public.user_inventories(discord_id);
CREATE INDEX IF NOT EXISTS idx_user_inventories_item_id ON public.user_inventories(item_id);

SELECT 'Database schema created successfully' as status;
