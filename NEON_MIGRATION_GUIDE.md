# Neon Database Migration Guide

Your old Supabase database was deleted, so we're migrating to Neon (which you already have connected).

## Step-by-Step Migration Process

### Step 1: Verify Neon Connection
You already have Neon integrated! I can see in your screenshot that the instance "tradewebsite" is connected.

### Step 2: Set Up Database Schema
Run this command to create all tables in your Neon database:

\`\`\`bash
npm run db:setup-neon
\`\`\`

This will create:
- `profiles` - User profiles from Discord
- `sessions` - Discord OAuth sessions
- `items` - Game items (MM2, SAB, Adopt Me, GAG)
- `activities` - Page views and user activities
- `trades` - Trade listings
- `conversations` - Trade conversations
- `messages` - Chat messages
- `user_inventories` - User item collections

### Step 3: Update Discord Bot to Use Neon
Your Discord bot currently uses Supabase. We need to update it to use Neon instead.

I'll update the bot files in the next step.

### Step 4: Import Your Excel Data
Once the database is set up, you can use your Discord bot commands to import data:

\`\`\`
/excel-update upload
\`\`\`

Then attach your Excel files for:
- Adopt Me items
- SAB items  
- MM2 items

### Step 5: Test the Website
After data is imported, visit:
- `/values` - See all items
- `/sab` - See SAB items only
- `/trading` - Create trades

## Environment Variables
Your Neon environment variables are already set:
- `NEON_DATABASE_URL` - Main database connection (already configured)
- `NEON_POSTGRES_URL` - Alternative connection string (already configured)

## What Gets Migrated
- Database schema (tables, indexes)
- Your items data (via Excel upload through Discord bot)
- User profiles (created on first login)
- Trades (users create new ones)

## What Doesn't Get Migrated
- Old Supabase data is gone (since you deleted the team)
- You'll start fresh with a clean database
- Users will need to log in again to create new profiles

## Next Steps
1. Run `npm run db:setup-neon` to create tables
2. I'll update the bot code to use Neon
3. Use `/excel-update` command to import your items
4. Your site will be live with Neon!
