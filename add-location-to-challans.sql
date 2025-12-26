-- ============================================
-- MIGRATION: Add location field to challans table
-- ============================================
-- This script adds a location column to store where the challan was issued
-- Existing records will have 'N/A' as the default value

-- Add location column to challans table
ALTER TABLE challans 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'N/A';

-- Update existing challans to have 'N/A' as location
UPDATE challans 
SET location = 'N/A' 
WHERE location IS NULL;

-- Verify the change
SELECT COUNT(*) as total_challans, 
       COUNT(CASE WHEN location = 'N/A' THEN 1 END) as challans_with_na_location
FROM challans;

-- Display sample data
SELECT id, vehicle_id, violation_type, location, issued_at 
FROM challans 
LIMIT 5;
