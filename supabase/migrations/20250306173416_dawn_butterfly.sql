/*
  # Marketplace Monitoring System Schema

  1. New Tables
    - machines: Stores registered machines and their status
    - machine_permissions: Controls access levels for each machine
    - machine_metrics: Stores real-time performance metrics
    - machine_logs: Audit trail for all machine activities
    - ai_diagnostics: Stores AI-generated diagnostics and solutions
*/

-- Create machines table
CREATE TABLE IF NOT EXISTS machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'maintenance')),
  last_ping timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  session_enabled boolean DEFAULT true,
  session_timeout integer DEFAULT 30,
  require_approval boolean DEFAULT false
);

-- Create machine_permissions table
CREATE TABLE IF NOT EXISTS machine_permissions (
  machine_id uuid REFERENCES machines ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  access_level text NOT NULL CHECK (access_level IN ('view', 'operate', 'admin')),
  PRIMARY KEY (machine_id, user_id)
);

-- Create machine_metrics table
CREATE TABLE IF NOT EXISTS machine_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines ON DELETE CASCADE,
  cpu_usage numeric CHECK (cpu_usage >= 0 AND cpu_usage <= 100),
  memory_usage numeric CHECK (memory_usage >= 0 AND memory_usage <= 100),
  disk_usage numeric CHECK (disk_usage >= 0 AND disk_usage <= 100),
  timestamp timestamptz DEFAULT now()
);

-- Create machine_logs table
CREATE TABLE IF NOT EXISTS machine_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create ai_diagnostics table
CREATE TABLE IF NOT EXISTS ai_diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines ON DELETE CASCADE,
  error_type text NOT NULL,
  description text NOT NULL,
  solution text NOT NULL,
  confidence numeric CHECK (confidence >= 0 AND confidence <= 1),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users
);

-- Create indexes
CREATE INDEX IF NOT EXISTS machines_owner_id_idx ON machines(owner_id);
CREATE INDEX IF NOT EXISTS machine_metrics_machine_id_idx ON machine_metrics(machine_id);
CREATE INDEX IF NOT EXISTS machine_logs_machine_id_idx ON machine_logs(machine_id);
CREATE INDEX IF NOT EXISTS ai_diagnostics_machine_id_idx ON ai_diagnostics(machine_id);

-- Enable RLS
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_diagnostics ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  -- Machines policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'machines' AND policyname = 'Users can insert their own machines'
  ) THEN
    CREATE POLICY "Users can insert their own machines"
      ON machines FOR INSERT TO public
      WITH CHECK (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'machines' AND policyname = 'Users can update their own machines'
  ) THEN
    CREATE POLICY "Users can update their own machines"
      ON machines FOR UPDATE TO public
      USING (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'machines' AND policyname = 'Users can view their own machines and machines they have permissions for'
  ) THEN
    CREATE POLICY "Users can view their own machines and machines they have permissions for"
      ON machines FOR SELECT TO public
      USING (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM machine_permissions
          WHERE machine_permissions.machine_id = machines.id
          AND machine_permissions.user_id = auth.uid()
        )
      );
  END IF;

  -- AI Diagnostics policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_diagnostics' AND policyname = 'Users can view diagnostics for their machines'
  ) THEN
    CREATE POLICY "Users can view diagnostics for their machines"
      ON ai_diagnostics FOR SELECT TO public
      USING (
        EXISTS (
          SELECT 1 FROM machines
          WHERE machines.id = ai_diagnostics.machine_id
          AND (
            machines.owner_id = auth.uid() OR
            EXISTS (
              SELECT 1 FROM machine_permissions
              WHERE machine_permissions.machine_id = machines.id
              AND machine_permissions.user_id = auth.uid()
            )
          )
        )
      );
  END IF;
END $$;

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_machines_updated_at'
  ) THEN
    CREATE TRIGGER update_machines_updated_at
      BEFORE UPDATE ON machines
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;