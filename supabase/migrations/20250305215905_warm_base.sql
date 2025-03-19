/*
  # Marketplace Monitoring Schema

  1. New Tables
    - `machines`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references auth.users)
      - `name` (text)
      - `status` (text)
      - `last_ping` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `machine_metrics`
      - `id` (uuid, primary key)
      - `machine_id` (uuid, references machines)
      - `cpu_usage` (numeric)
      - `memory_usage` (numeric)
      - `disk_usage` (numeric)
      - `timestamp` (timestamptz)

    - `machine_logs`
      - `id` (uuid, primary key)
      - `machine_id` (uuid, references machines)
      - `user_id` (uuid, references auth.users)
      - `action` (text)
      - `details` (jsonb)
      - `created_at` (timestamptz)

    - `machine_permissions`
      - `machine_id` (uuid, references machines)
      - `user_id` (uuid, references auth.users)
      - `access_level` (text)
      - Primary key on (machine_id, user_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for machine owners and authorized users
*/

-- Create machines table
CREATE TABLE IF NOT EXISTS machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'maintenance')),
  last_ping timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create machine_metrics table
CREATE TABLE IF NOT EXISTS machine_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines ON DELETE CASCADE NOT NULL,
  cpu_usage numeric CHECK (cpu_usage >= 0 AND cpu_usage <= 100),
  memory_usage numeric CHECK (memory_usage >= 0 AND memory_usage <= 100),
  disk_usage numeric CHECK (disk_usage >= 0 AND disk_usage <= 100),
  timestamp timestamptz DEFAULT now()
);

-- Create machine_logs table
CREATE TABLE IF NOT EXISTS machine_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create machine_permissions table
CREATE TABLE IF NOT EXISTS machine_permissions (
  machine_id uuid REFERENCES machines ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  access_level text NOT NULL CHECK (access_level IN ('view', 'operate', 'admin')),
  PRIMARY KEY (machine_id, user_id)
);

-- Enable RLS
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_permissions ENABLE ROW LEVEL SECURITY;

-- Machines policies
CREATE POLICY "Users can view their own machines and machines they have permissions for"
  ON machines
  FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM machine_permissions
      WHERE machine_id = machines.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own machines"
  ON machines
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own machines"
  ON machines
  FOR UPDATE
  USING (owner_id = auth.uid());

-- Machine metrics policies
CREATE POLICY "Users can view metrics for machines they own or have permissions for"
  ON machine_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM machines
      WHERE id = machine_metrics.machine_id
      AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM machine_permissions
          WHERE machine_id = machines.id
          AND user_id = auth.uid()
        )
      )
    )
  );

-- Machine logs policies
CREATE POLICY "Users can view logs for machines they own or have permissions for"
  ON machine_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM machines
      WHERE id = machine_logs.machine_id
      AND (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM machine_permissions
          WHERE machine_id = machines.id
          AND user_id = auth.uid()
        )
      )
    )
  );

-- Machine permissions policies
CREATE POLICY "Machine owners can manage permissions"
  ON machine_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM machines
      WHERE id = machine_permissions.machine_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own permissions"
  ON machine_permissions
  FOR SELECT
  USING (user_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to machines table
CREATE TRIGGER update_machines_updated_at
  BEFORE UPDATE ON machines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();