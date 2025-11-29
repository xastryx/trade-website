# Environment Setup Guide

## Your Neon Database Connection String

\`\`\`
postgresql://neondb_owner:npg_W9SpRmwoC8sX@ep-blue-hat-ah2m0qsl-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
\`\`\`

## Steps to Update Your VPS Environment

### 1. Update .env.local file

\`\`\`bash
cd ~/trade-website

# Backup old file
cp .env.local .env.local.backup

# Create new .env.local with Neon database
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://neondb_owner:npg_W9SpRmwoC8sX@ep-blue-hat-ah2m0qsl-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
DISCORD_CLIENT_ID="1423954564532539433"
DISCORD_CLIENT_SECRET="your_actual_secret_here"
DISCORD_REDIRECT_URI="https://rotraders.gg/api/auth/discord/callback"
ADMIN_PASSWORD="your_admin_password_here"
XAI_API_KEY="your_xai_key_if_you_have_one"
EOF
\`\`\`

### 2. Update PM2 Environment

Since your site runs via PM2, update the PM2 ecosystem:

\`\`\`bash
# Set DATABASE_URL for all PM2 apps
pm2 set DATABASE_URL "postgresql://neondb_owner:npg_W9SpRmwoC8sX@ep-blue-hat-ah2m0qsl-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

# Restart all apps
pm2 restart all
\`\`\`

### 3. Create Database Schema

Now create all the tables using Neon's direct SQL tool:

\`\`\`bash
# I'll create the tables for you using v0's Neon integration
# Just wait for confirmation that tables are created
\`\`\`

### 4. Update Discord Bot Environment

\`\`\`bash
cd ~/trade-website/discord-bot

# Create/update .env file for the bot
cat > .env << 'EOF'
DISCORD_BOT_TOKEN="your_bot_token_here"
DISCORD_CLIENT_ID="1423954564532539433"
DISCORD_GUILD_ID="1428800309336997890"
DATABASE_URL="postgresql://neondb_owner:npg_W9SpRmwoC8sX@ep-blue-hat-ah2m0qsl-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
EOF

# Restart bot
pm2 restart rotraders-bot
\`\`\`

### 5. Verify Everything Works

After setup, test:
- Website loads: https://rotraders.gg
- Discord bot responds to `/additem` command
- You can add items and see them on /values page

## Next Steps After Database Setup

1. Upload your Excel sheets using `/excel-update` in Discord
2. Add items manually using `/additem` 
3. Items will appear on rotraders.gg/values and rotraders.gg/sab
EOF
