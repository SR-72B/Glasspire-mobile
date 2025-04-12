-- Update users table to ensure it has all the fields we need
ALTER TABLE users ADD COLUMN IF NOT EXISTS accountType TEXT NOT NULL DEFAULT 'customer' CHECK (accountType IN ('customer', 'retailer'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscriptionStatus TEXT DEFAULT 'trial' CHECK (subscriptionStatus IN ('trial', 'active', 'expired'));

-- Update subscriptions table to ensure it has all the fields we need
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'retailer' CHECK (plan IN ('customer', 'retailer'));