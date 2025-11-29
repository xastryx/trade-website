# Update Your .env File Immediately

Your Discord bot is failing because the DATABASE_URL has incorrect credentials.

## Steps to Fix:

1. Open your .env file:
\`\`\`bash
cd ~/trade-website/discord-bot
nano .env
\`\`\`

2. Replace the DATABASE_URL line with this EXACT value:
\`\`\`env
DATABASE_URL=postgresql://neondb_owner:npg_W9SpRmwoC8sX@ep-blue-hat-ah2m0qsl-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
\`\`\`

3. Your complete .env file should look like this:
\`\`\`env
DATABASE_URL=postgresql://neondb_owner:npg_W9SpRmwoC8sX@ep-blue-hat-ah2m0qsl-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
DISCORD_CLIENT_ID=1444266477577441371
DISCORD_CLIENT_SECRET=7-uB9cXm3AraLGQcWavc_T9tJkiUdDBo
DISCORD_GUILD_ID=1444266075301609545
DISCORD_BOT_TOKEN=MTQ0NDI2NjQ3NzU3NzQ0MTM3MQ.GbajG0.nC8ammPvE9A5Z27JK79ZeQGc7S0DsZtDPMe3Uk
\`\`\`

4. Save and exit (Ctrl+X, then Y, then Enter)

5. Restart the bot:
\`\`\`bash
pm2 restart all
\`\`\`

## What was wrong:

- Old DATABASE_URL: `...npg_8O0wgqZQ5hPp@ep-shy-sunset-a5tbnc96-pooler.us-east-2.aws.neon.tech...`
- New DATABASE_URL: `...npg_W9SpRmwoC8sX@ep-blue-hat-ah2m0qsl-pooler.c-3.us-east-1.aws.neon.tech...`

The password and host changed. This is why you're getting "password authentication failed" errors.
