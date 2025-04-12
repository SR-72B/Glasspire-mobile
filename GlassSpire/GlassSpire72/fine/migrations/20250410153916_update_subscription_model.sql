-- Update users table to add default subscription status based on account type
ALTER TABLE users ADD COLUMN verificationStatus TEXT DEFAULT 'unverified' CHECK (verificationStatus IN ('unverified', 'verified'));

-- Update subscriptions table to reflect retailer-only payment model
CREATE TABLE IF NOT EXISTS retailerPayments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  amount REAL NOT NULL,
  paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paymentMethod TEXT,
  cardLast4 TEXT,
  expiryDate TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
);