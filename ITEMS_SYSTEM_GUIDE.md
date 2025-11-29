# Items System Guide - ROTraders

## Overview
The items system allows you to manage Roblox trading items for multiple games through Discord bot commands and view them on the website.

## Supported Games
- **MM2** (Murder Mystery 2) - Requires: rarity, demand
- **SAB** (Steal a Brainrot) - Requires: rarity, demand  
- **Adopt Me** - Requires: pot, demand
- **GAG** (Get a Grill) - Requires: rarity, demand

## Discord Bot Commands

### 1. Add Single Item: `/additem`
Add one item at a time with all details.

**Required Fields (All Games):**
- `game` - Select from dropdown (MM2, SAB, Adopt Me, GAG)
- `name` - Item name (e.g., "Shadow Dragon")
- `section` - Category/rarity tier (e.g., "Legendary", "Godly", "Ultra Rare")
- `value` - Trading value as a number
- `image` - Full image URL (must be valid URL format)

**Additional Required Fields by Game:**
- **MM2, SAB, GAG:** `rarity` and `demand`
- **Adopt Me:** `pot` (potion type: "Fly", "Ride", "FR", "None") and `demand`

**Example Usage:**
\`\`\`
/additem
  game: SAB
  name: Skibidi Toilet
  section: Legendary
  value: 100
  image: https://example.com/skibidi.png
  rarity: Legendary
  demand: High
\`\`\`

### 2. Bulk Add Items: `/bulkadditem`
Add multiple items at once using a simple text format.

**Format:**
\`\`\`
Item Name | Section | Value | Rarity | Demand | Image URL
\`\`\`

**Example:**
\`\`\`
/bulkadditem game: SAB

Then paste in the modal:
Ohio Rizz | Legendary | 150 | Legendary | High | https://example.com/ohio.png
Sigma Male | Epic | 75 | Epic | Medium | https://example.com/sigma.png
Gyatt | Rare | 25 | Rare | Low | https://example.com/gyatt.png
\`\`\`

### 3. Edit Items: `/edititem`
Edit existing items with an interactive menu.

**Steps:**
1. Run `/edititem`
2. Select the game from dropdown
3. Browse items with pagination (25 items per page)
4. Select item to edit
5. Fill in the modal with new values
6. Confirm changes

**Features:**
- Pagination for large item lists
- Shows current values pre-filled
- Game-specific fields automatically detected

### 4. Remove Items: `/removeitem`
Delete items from the database with confirmation.

**Steps:**
1. Run `/removeitem`
2. Select the game
3. Browse and select item
4. Confirm deletion (or cancel)

**Safety:**
- Requires confirmation before deleting
- Shows item details before deletion
- Cannot be undone!

### 5. View Analytics: `/analytics`
View statistics about your items, trades, and users.

**Options:**
- `overview` - General statistics
- `users` - User signups with chart
- `trades` - Trade activity with chart
- `page_views` - Website traffic with chart
- `activity` - Hourly activity distribution

**Time Filters:**
- `all` - All time
- `7d` - Last 7 days
- `30d` - Last 30 days
- `24h` - Last 24 hours

## Website Pages

### 1. Trade Values Page (`/values`)
View all items from all supported games in one place.

**Features:**
- Filter by game (MM2, SAB, Adopt Me)
- Search by item name
- Sort by value, name, or rarity
- Real-time data updates (revalidates hourly)

### 2. SAB Items Page (`/sab`)
Dedicated page for Steal a Brainrot items.

**Features:**
- SAB-specific filtering
- Rarity-based organization
- Demand indicators
- Value sorting

## Database Schema

### Items Table Structure
\`\`\`sql
items (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  game VARCHAR(50) NOT NULL,
  section VARCHAR(100),        -- Category/tier
  rap_value NUMERIC(10,2),     -- Trading value
  image_url TEXT,
  
  -- Game-specific fields
  rarity VARCHAR(50),          -- MM2, SAB, GAG
  demand VARCHAR(50),          -- All games
  pot VARCHAR(50),             -- Adopt Me only
  
  -- Metadata
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_updated_at TIMESTAMP
)
\`\`\`

## Setup Instructions

### 1. Database Setup
Run the migration to add the `pot` column:
\`\`\`bash
# In v0, go to the Scripts section and run:
scripts/add-pot-column.sql
\`\`\`

### 2. Deploy Bot Commands
Bot commands are already registered. If you need to update them:
\`\`\`bash
cd discord-bot
npm run deploy-commands
\`\`\`

### 3. Start Adding Items
Use `/additem` or `/bulkadditem` in Discord to populate your database.

## Best Practices

### Naming Conventions
- Use consistent naming (e.g., "Shadow Dragon" not "shadow dragon")
- Include variants in name if applicable (e.g., "Neon Shadow Dragon")
- Use proper capitalization

### Image URLs
- Use permanent image hosting (not temporary links)
- Prefer square images (1:1 ratio)
- Keep images under 2MB for fast loading
- Use HTTPS URLs only

### Section/Category Values
Be consistent with sections across items:
- **SAB:** Legendary, Epic, Rare, Uncommon, Common
- **MM2:** Godly, Legendary, Rare, Uncommon, Common
- **Adopt Me:** Legendary, Ultra-Rare, Rare, Uncommon, Common

### Value Guidelines
- Use consistent value scale across items
- Update values regularly to reflect market changes
- Use `/edititem` to adjust values as market changes

## Troubleshooting

### Command Not Responding
- Check if bot is online in Discord
- Verify you have proper permissions
- Try restarting the bot

### Item Not Showing on Website
- Wait up to 1 hour for revalidation
- Check if item was added successfully in Discord
- Verify image URL is valid and accessible

### Missing Pot Column Error (Adopt Me)
- Run the `add-pot-column.sql` migration script
- Restart your application
- Try adding the item again

### Duplicate Item Error
- Check if item already exists with `/edititem`
- Items are unique by name + game combination
- Use `/edititem` to update existing items instead

## Column Name Reference

**No conflicts exist!** All commands use the correct column names:

| Bot Command Field | Database Column | Usage |
|------------------|-----------------|-------|
| `name` | `name` | Item name |
| `section` | `section` | Category/tier |
| `value` | `rap_value` | Trading value |
| `image` | `image_url` | Image URL |
| `rarity` | `rarity` | MM2/SAB/GAG rarity |
| `demand` | `demand` | All games |
| `pot` | `pot` | Adopt Me only |

## Next Steps

1. **Run the migration** to add the `pot` column
2. **Start adding SAB items** using `/additem` or `/bulkadditem`
3. **Verify on website** by visiting `/sab` or `/values`
4. **Share with your community** so they can browse items

All Discord commands are working and ready to use! The website pages are active and will display your items once you add them through Discord.
