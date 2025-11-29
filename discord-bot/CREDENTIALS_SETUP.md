# Discord Bot Credentials Setup Guide

This guide will help you update your Discord bot's credentials (token, client ID, and application ID).

## Step 1: Get New Discord Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application or create a new one
3. Collect these values:

### Application ID / Client ID
- Found on **General Information** page
- This is the same value for both

### Bot Token
- Go to **Bot** section in left sidebar
- Click **Reset Token** button
- Copy the new token (you can only see it once!)

### Guild ID (Your Discord Server ID)
- Open Discord, enable Developer Mode (User Settings → Advanced → Developer Mode)
- Right-click your server name
- Click **Copy Server ID**

## Step 2: Update .env File on VPS

Connect to your VPS and create/update the `.env` file:

\`\`\`bash
cd ~/trade-website/discord-bot

# Create or edit the .env file
nano .env
\`\`\`

Paste this content (replace with your actual values):

\`\`\`env
# Discord Bot Credentials
DISCORD_TOKEN=your_actual_bot_token_here
DISCORD_CLIENT_ID=your_actual_client_id_here
DISCORD_GUILD_ID=your_actual_guild_id_here

# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_8O0wgqZQ5hPp@ep-shy-sunset-a5tbnc96-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
\`\`\`

Save the file: `Ctrl + X`, then `Y`, then `Enter`

## Step 3: Rebuild and Deploy Commands

\`\`\`bash
cd ~/trade-website/discord-bot

# Rebuild the bot
npm run build

# Deploy commands to your guild (instant)
npm run deploy

# OR deploy globally (takes 1 hour)
# npm run deploy:global
\`\`\`

## Step 4: Restart the Bot

\`\`\`bash
# Go back to main directory
cd ~/trade-website

# Restart all services
pm2 restart all

# Check bot status
pm2 logs discord-bot --lines 50
\`\`\`

## Step 5: Verify

1. Check PM2 logs to see if bot connected successfully
2. Go to your Discord server
3. Type `/` to see if your bot commands appear
4. Try running `/additem` to test

## Troubleshooting

### Bot shows offline
- Check `pm2 logs discord-bot` for errors
- Verify token is correct in `.env` file
- Make sure bot has proper permissions in Discord server

### Commands don't appear
- Wait a few minutes after deploying
- If using global deployment, wait up to 1 hour
- Try kicking and re-inviting the bot to your server

### "Invalid Token" error
- Bot token might have spaces or be incorrect
- Reset token in Discord Developer Portal and update `.env`
- Rebuild and restart: `npm run build && pm2 restart all`
