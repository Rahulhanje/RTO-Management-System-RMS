-- Migration: Add QR Code and Digital Signature columns
-- Date: 2025-12-29

-- Add columns to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS digital_signature TEXT;

-- Add columns to driving_licenses table
ALTER TABLE driving_licenses 
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS digital_signature TEXT;
