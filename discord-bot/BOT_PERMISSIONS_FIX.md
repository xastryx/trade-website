# Fix Discord Bot "Missing Access" Error

## Problem
You're getting this error when deploying commands:
\`\`\`
DiscordAPIError[50001]: Missing Access
\`\`\`

This means your bot doesn't have permission to register slash commands in your Discord server.

## Solution: Re-invite Bot with Correct Permissions

### Step 1: Generate New Invite URL
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click on your bot application (ID: **1423954564532539433**)
3. Go to **OAuth2** → **URL Generator** in the left sidebar
4. Select the following **SCOPES**:
   - ✅ `bot`
   - ✅ `applications.commands` (This is the critical one!)

5. Select the following **BOT PERMISSIONS**:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Use Slash Commands

6. Copy the generated URL at the bottom

### Step 2: Re-invite the Bot
1. Paste the URL in your browser
2. Select your server: **trader's bot testing**
3. Click **Authorize**
4. Complete the CAPTCHA

### Step 3: Deploy Commands
After re-inviting, run:
\`\`\`bash
cd ~/trade-website/discord-bot
npm run deploy
\`\`\`

The commands should now deploy successfully!

---

## Alternative: Deploy Commands Globally

If re-inviting doesn't work, you can deploy commands globally (they'll work in all servers):

\`\`\`bash
npm run deploy:global
\`\`\`

**Note:** Global commands take up to 1 hour to appear, while guild-specific commands appear instantly.

---

## Verify Deployment
After deploying, type `/` in your Discord server and you should see:
- `/additem`
- `/edititem`
- `/removeitem`
- `/bulkadditem`
- `/analytics`
- `/excel-update`

If you see duplicates, they will disappear after the new deployment completes.
