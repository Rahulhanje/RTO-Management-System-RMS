# Challan Location Migration

## What This Does
Adds a `location` field to the `challans` table to store where traffic violations were issued.

## Changes
- Adds `location` column to `challans` table
- Sets existing challans to have location = 'N/A'
- New challans created by police will include location information

## How to Run

### Option 1: Using Node.js Script (Recommended)
```bash
cd backend
node migrate-add-location.js
```

### Option 2: Using SQL Directly
```bash
cd backend
psql -U postgres -d rto_db -f add-location-to-challans.sql
```

Or connect to your database and run:
```sql
-- Add location column
ALTER TABLE challans 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'N/A';

-- Update existing records
UPDATE challans 
SET location = 'N/A' 
WHERE location IS NULL;
```

## Verification
After running the migration, verify with:
```sql
SELECT COUNT(*) as total, 
       COUNT(CASE WHEN location IS NOT NULL THEN 1 END) as with_location
FROM challans;
```

## Files Modified
- `backend/database_setup.sql` - Now includes location column (for future fresh setups)
- `backend/src/models/challanModel.ts` - Already includes location parameter
- `backend/src/controllers/challanController.ts` - Already handles location from request
- `frontend/src/types/index.ts` - Already has location in Challan interface

## Notes
- Existing challans will show location as "N/A"
- Police officers creating new challans should provide the location
- The location field is optional but recommended for new challans
