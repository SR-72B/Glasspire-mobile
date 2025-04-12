-- Add missing fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phoneNumber TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lastLogin TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verificationStatus TEXT DEFAULT 'unverified' CHECK (verificationStatus IN ('unverified', 'verified'));