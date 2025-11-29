# Discord Bot Neon Database Setup

This bot has been migrated from Supabase to Neon database.

## Required Environment Variables

Add these to your `.env` file in the `discord-bot` directory:

\`\`\`env
# Required - Primary database connection
NEON_DATABASE_URL=postgresql://user:password@host/database
# or
DATABASE_URL=postgresql://user:password@host/database

# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id
\`\`\`

## Setup Steps

1. **Install Dependencies**
   \`\`\`bash
   cd discord-bot
   npm install
   \`\`\`

2. **Configure Environment**
   - Copy `.env.example` to `.env` (if available)
   - Add your `NEON_DATABASE_URL` from Vercel environment variables
   - Add your Discord bot credentials

3. **Deploy Commands**
   \`\`\`bash
   npm run deploy:global
   \`\`\`

4. **Start the Bot**
   \`\`\`bash
   npm run dev  # Development
   npm start    # Production
   \`\`\`

## Database Connection

The bot now uses `@neondatabase/serverless` package which provides:
- WebSocket connections for serverless environments
- Automatic connection pooling
- Better performance than the generic postgres package

## Changes from Supabase

- Removed `@supabase/supabase-js` dependency
- Removed `postgres` package dependency
- All Supabase client queries converted to direct SQL
- Environment variable changed from `POSTGRES_URL` to `NEON_DATABASE_URL`

## Troubleshooting

If you see connection errors:
1. Verify `NEON_DATABASE_URL` is set correctly
2. Check the URL format: `postgresql://user:password@host/database`
3. Ensure your Neon database has the correct schema (run setup script from main project)
