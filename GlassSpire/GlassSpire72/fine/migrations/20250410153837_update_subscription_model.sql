-- Update users table to add more fields
ALTER TABLE users ADD COLUMN phoneNumber TEXT;
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN verificationStatus TEXT DEFAULT 'unverified' CHECK (verificationStatus IN ('unverified', 'verified'));
ALTER TABLE users ADD COLUMN verificationToken TEXT;
ALTER TABLE users ADD COLUMN lastLogin TIMESTAMP;

-- Update subscriptions table to reflect that only retailers pay
UPDATE users SET subscriptionStatus = 'active' WHERE accountType = 'customer';