-- Add variant support to trades by storing items as objects with variant info
-- The offering and requesting columns are already jsonb, so we just need to ensure they store objects like:
-- [{"name": "Frost Dragon", "variant": "FR", "value": 123.45}, ...]

-- No schema changes needed, just documentation that the structure should be:
-- offering: [{"name": "item_name", "variant": "FR" | "NFR" | "F" | "R" | "N" | null, "value": number}]
-- requesting: [{"name": "item_name", "variant": "FR" | "NFR" | "F" | "R" | "N" | null, "value": number}]

-- This is a data migration - we'll update the format in the application code
