/*
  # Marketplace Monitoring System Schema

  1. New Tables
    - machines: Stores registered machines and their status
    - machine_permissions: Controls access levels for each machine
    - machine_metrics: Stores real-time performance metrics
    - machine_logs: Audit trail for all machine activities

  2. Features
    - Hierarchical access control
    - Real-time monitoring
    - Activity logging
    - Performance metrics
*/

-- Create machines table if it doesn't exist
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

-- Create machine_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS machine_permissions (
  machine_id uuid REFERENCES machines ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  access_level text NOT NULL CHECK (access_level IN ('view', 'operate', 'admin')),
  PRIMARY KEY (machine_id, user_id)
);

-- Create machine_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS machine_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines ON DELETE CASCADE,
  cpu_usage numeric CHECK (cpu_usage >= 0 AND cpu_usage <= 100),
  memory_usage numeric CHECK (memory_usage >= 0 AND memory_usage <= 100),
  disk_usage numeric CHECK (disk_usage >= 0 AND disk_usage <= 100),
  timestamp timestamptz DEFAULT now()
);

-- Create machine_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS machine_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS machines_owner_id_idx ON machines(owner_id);
CREATE INDEX IF NOT EXISTS machine_metrics_machine_id_idx ON machine_metrics(machine_id);
CREATE INDEX IF NOT EXISTS machine_logs_machine_id_idx ON machine_logs(machine_id);

-- Enable RLS
DO $$ 
BEGIN
  ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
  ALTER TABLE machine_permissions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE machine_metrics ENABLE ROW LEVEL SECURITY;
  ALTER TABLE machine_logs ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Machines policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'machines' AND policyname = 'Users can insert their own machines'
  ) THEN
    CREATE POLICY "Users can insert their own machines"
      ON machines FOR INSERT
      TO public
      WITH CHECK (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'machines' AND policyname = 'Users can update their own machines'
  ) THEN
    CREATE POLICY "Users can update their own machines"
      ON machines FOR UPDATE
      TO public
      USING (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'machines' AND policyname = 'Users can view their own machines and machines they have permissions for'
  ) THEN
    CREATE POLICY "Users can view their own machines and machines they have permissions for"
      ON machines FOR SELECT
      TO public
      USING (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM machine_permissions
          WHERE machine_permissions.machine_id = machines.id
          AND machine_permissions.user_id = auth.uid()
        )
      );
  END IF;

  -- Machine permissions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'machine_permissions' AND policyname = 'Machine owners can manage permissions'
  ) THEN
    CREATE POLICY "Machine owners can manage permissions"
      ON machine_permissions FOR ALL
      TO public
      USING (
        EXISTS (
          SELECT 1 FROM machines
          WHERE machines.id = machine_permissions.machine_id
          AND machines.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'machine_permissions' AND policyname = 'Users can view their own permissions'
  ) THEN
    CREATE POLICY "Users can view their own permissions"
      ON machine_permissions FOR SELECT
      TO public
      USING (user_id = auth.uid());
  END IF;

  -- Machine metrics policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'machine_metrics' AND policyname = 'Users can view metrics for machines they own or have permissions for'
  ) THEN
    CREATE POLICY "Users can view metrics for machines they own or have permissions for"
      ON machine_metrics FOR SELECT
      TO public
      USING (
        EXISTS (
          SELECT 1 FROM machines
          WHERE machines.id = machine_metrics.machine_id
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

  -- Machine logs policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'machine_logs' AND policyname = 'Users can view logs for machines they own or have permissions for'
  ) THEN
    CREATE POLICY "Users can view logs for machines they own or have permissions for"
      ON machine_logs FOR SELECT
      TO public
      USING (
        EXISTS (
          SELECT 1 FROM machines
          WHERE machines.id = machine_logs.machine_id
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

-- Create updated_at trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_machines_updated_at'
  ) THEN
    CREATE TRIGGER update_machines_updated_at
      BEFORE UPDATE ON machines
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;