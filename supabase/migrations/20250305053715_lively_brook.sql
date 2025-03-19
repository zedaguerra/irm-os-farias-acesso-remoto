/*
  # Remote Access and Monitoring System Setup

  1. New Tables
    - `device_metrics`
      - Real-time performance metrics for devices
      - Stores CPU, memory, disk, and network usage
    - `device_processes`
      - Active processes running on monitored devices
    - `remote_sessions`
      - Remote control session information and settings
    - `alerts`
      - System alerts and notifications
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for device access control
*/

-- Device Metrics Table
CREATE TABLE IF NOT EXISTS device_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices NOT NULL,
  timestamp timestamptz DEFAULT now(),
  cpu_usage numeric CHECK (cpu_usage >= 0 AND cpu_usage <= 100),
  memory_usage numeric CHECK (memory_usage >= 0 AND memory_usage <= 100),
  disk_usage numeric CHECK (disk_usage >= 0 AND disk_usage <= 100),
  network_upload numeric DEFAULT 0,
  network_download numeric DEFAULT 0,
  active_processes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Device Processes Table
CREATE TABLE IF NOT EXISTS device_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices NOT NULL,
  pid integer NOT NULL,
  name text NOT NULL,
  cpu_usage numeric DEFAULT 0,
  memory_usage numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Remote Sessions Table
CREATE TABLE IF NOT EXISTS remote_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended')),
  quality_level text DEFAULT 'medium' CHECK (quality_level IN ('low', 'medium', 'high')),
  features_enabled jsonb DEFAULT '[]',
  session_recording boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices NOT NULL,
  type text CHECK (type IN ('warning', 'error', 'info')),
  message text NOT NULL,
  severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE device_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Policies for device_metrics
CREATE POLICY "Users can view metrics for their devices"
  ON device_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = device_metrics.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert metrics for their devices"
  ON device_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = device_id
      AND devices.user_id = auth.uid()
    )
  );

-- Policies for device_processes
CREATE POLICY "Users can view processes for their devices"
  ON device_processes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = device_processes.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage processes for their devices"
  ON device_processes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = device_processes.device_id
      AND devices.user_id = auth.uid()
    )
  );

-- Policies for remote_sessions
CREATE POLICY "Users can view their remote sessions"
  ON remote_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create remote sessions"
  ON remote_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their remote sessions"
  ON remote_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for alerts
CREATE POLICY "Users can view alerts for their devices"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = alerts.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage alerts for their devices"
  ON alerts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = alerts.device_id
      AND devices.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS device_metrics_device_id_timestamp_idx ON device_metrics(device_id, timestamp);
CREATE INDEX IF NOT EXISTS device_processes_device_id_idx ON device_processes(device_id);
CREATE INDEX IF NOT EXISTS remote_sessions_device_id_idx ON remote_sessions(device_id);
CREATE INDEX IF NOT EXISTS remote_sessions_user_id_idx ON remote_sessions(user_id);
CREATE INDEX IF NOT EXISTS alerts_device_id_idx ON alerts(device_id);
CREATE INDEX IF NOT EXISTS alerts_created_at_idx ON alerts(created_at);

-- Add updated_at trigger for device_processes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_device_processes_updated_at
  BEFORE UPDATE
  ON device_processes
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();