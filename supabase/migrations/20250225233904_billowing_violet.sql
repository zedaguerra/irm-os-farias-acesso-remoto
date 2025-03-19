/*
  # Create devices and connections tables

  1. New Tables
    - `devices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `type` (text)
      - `os` (text)
      - `ip` (text)
      - `last_connection` (timestamptz)
      - `online` (boolean)
      - `created_at` (timestamptz)
    
    - `connections`
      - `id` (uuid, primary key)
      - `device_id` (uuid, references devices)
      - `connection_code` (text)
      - `qr_code` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own devices and connections
*/

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  os text NOT NULL,
  ip text,
  last_connection timestamptz DEFAULT now(),
  online boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_type CHECK (type IN ('desktop', 'mobile'))
);

-- Enable RLS for devices
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Policies for devices
CREATE POLICY "Users can view their own devices"
  ON devices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices"
  ON devices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices"
  ON devices
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices"
  ON devices
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices NOT NULL,
  connection_code text UNIQUE NOT NULL,
  qr_code text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'expired'))
);

-- Enable RLS for connections
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Policies for connections
CREATE POLICY "Users can view their device connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = connections.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create connections for their devices"
  ON connections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their device connections"
  ON connections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = device_id
      AND devices.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = device_id
      AND devices.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS devices_user_id_idx ON devices(user_id);
CREATE INDEX IF NOT EXISTS connections_device_id_idx ON connections(device_id);
CREATE INDEX IF NOT EXISTS connections_code_idx ON connections(connection_code);