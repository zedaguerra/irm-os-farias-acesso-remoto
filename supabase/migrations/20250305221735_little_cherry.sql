/*
  # Device Alerts Table

  1. New Tables
    - `device_alerts`
      - `id` (uuid, primary key)
      - `device_id` (uuid, references devices)
      - `type` (text, alert type)
      - `message` (text)
      - `severity` (text)
      - `read` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for device owners
    - Add validation checks for alert types and severity
*/

CREATE TABLE IF NOT EXISTS device_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('error', 'warning', 'info')),
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE device_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their device alerts"
  ON device_alerts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = device_alerts.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their device alerts"
  ON device_alerts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = device_alerts.device_id
      AND devices.user_id = auth.uid()
    )
  );

-- Index for faster queries
CREATE INDEX device_alerts_device_id_created_at_idx ON device_alerts(device_id, created_at DESC);