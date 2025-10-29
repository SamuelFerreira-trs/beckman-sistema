-- Add new date fields and costs array to maintenance_orders table
ALTER TABLE maintenance_orders 
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS next_maintenance_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS costs JSONB DEFAULT '[]'::jsonb;

-- Create index for next_maintenance_date for better query performance
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_next_maintenance_date ON maintenance_orders(next_maintenance_date);

-- Update existing records to have start_date = opened_at
UPDATE maintenance_orders SET start_date = opened_at WHERE start_date IS NULL;
