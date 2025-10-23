-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create maintenance_orders table
CREATE TABLE IF NOT EXISTS maintenance_orders (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  equipment TEXT,
  service_title TEXT NOT NULL,
  description TEXT NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  internal_cost DECIMAL(10, 2),
  status TEXT DEFAULT 'ABERTA' NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  next_reminder_at TIMESTAMP WITH TIME ZONE,
  next_reminder_step TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_client_id ON maintenance_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_status ON maintenance_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_opened_at ON maintenance_orders(opened_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_next_reminder_at ON maintenance_orders(next_reminder_at);
