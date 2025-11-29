# Trade Variants Feature

## Overview
Trade ads now display variant badges (FR, NFR, F, R, N, MFR, etc.) for Adopt Me pets, making it clear what type of pet is being offered or requested in each trade.

## What Changed

### 1. Trade Data Structure
The `offering` and `requesting` arrays in the trades table now support storing objects with variant information:

**Before:**
\`\`\`json
{
  "offering": ["Frost Dragon", "Turtle"],
  "requesting": ["Crow"]
}
\`\`\`

**After:**
\`\`\`json
{
  "offering": [
    {"name": "Frost Dragon", "variant": "FR", "value": 1150000},
    {"name": "Turtle", "variant": "N", "value": 140000}
  ],
  "requesting": [
    {"name": "Crow", "variant": "NFR", "value": 595000}
  ]
}
\`\`\`

### 2. Trade Creation Flow
**File:** `app/trading/create/page.tsx`

- When users add Adopt Me pets to their trade, they select the variant (FR, F, R, N, NFR, etc.)
- The variant and value are stored along with the item name
- Eggs have no variants and are stored without the variant field

### 3. Trade Display
**File:** `components/trade-card.tsx`

- Trade cards now show small variant badges next to pet names
- Badges are styled with purple background and border for consistency
- Backward compatible: old trades without variant data still display correctly

### 4. Visual Design
Variant badges appear as small colored pills:
- Purple background (`bg-purple-500/20`)
- Purple text (`text-purple-300`)
- Purple border (`border-purple-500/30`)
- Very small font size for compact display

## Backward Compatibility
The system is fully backward compatible:
- Old trades with string arrays still work and display correctly
- New trades with object arrays show variant badges
- The database queries handle both formats seamlessly

## Example Display
\`\`\`
Offering:
[🐉 Frost Dragon FR] [1,150,000]
[🐢 Turtle N] [140,000]

Requesting:
[🦅 Crow NFR] [595,000]
\`\`\`

## Files Modified
1. `components/trade-card.tsx` - Added variant badge display
2. `app/trading/create/page.tsx` - Capture variant during trade creation
3. `scripts/sql/add_trade_variants.sql` - Documentation of data structure

## Files Not Modified (Already Compatible)
- `app/api/trades/route.ts` - Already handles JSON arrays
- `lib/db/queries/trades.ts` - JSON stringify/parse works with objects
- Database schema - JSONB columns support both strings and objects
