-- Add pot column for Adopt Me items
ALTER TABLE items ADD COLUMN IF NOT EXISTS pot TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_items_pot ON items(pot) WHERE pot IS NOT NULL;

-- Update RLS policies to allow pot column
-- (No RLS changes needed, existing policies cover all columns)

SELECT 'Added pot column to items table for Adopt Me support' as status;
