-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  accountType TEXT NOT NULL CHECK (accountType IN ('customer', 'retailer')),
  subscriptionStatus TEXT DEFAULT 'trial' CHECK (subscriptionStatus IN ('trial', 'active', 'expired')),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerId INTEGER NOT NULL,
  retailerId INTEGER,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'cut', 'tempered', 'ready')),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES users(id),
  FOREIGN KEY (retailerId) REFERENCES users(id)
);

-- OrderDetails table
CREATE TABLE orderDetails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId INTEGER NOT NULL,
  glassThickness TEXT NOT NULL,
  glassFinish TEXT NOT NULL,
  tempering BOOLEAN DEFAULT FALSE,
  dfiCoating BOOLEAN DEFAULT FALSE,
  width REAL NOT NULL,
  height REAL NOT NULL,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  imageUrl TEXT,
  FOREIGN KEY (orderId) REFERENCES orders(id)
);

-- Messages table
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  senderId INTEGER NOT NULL,
  receiverId INTEGER NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (senderId) REFERENCES users(id),
  FOREIGN KEY (receiverId) REFERENCES users(id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('customer', 'retailer')),
  startDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  endDate TIMESTAMP,
  paymentMethod TEXT,
  cardLast4 TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
);