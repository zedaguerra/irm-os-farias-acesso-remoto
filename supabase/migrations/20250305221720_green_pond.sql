/*
  # Alert Thresholds and Automation Rules

  1. New Tables
    - `alert_thresholds`
      - `id` (uuid, primary key)
      - `device_id` (uuid, references devices)
      - `metric` (text, check constraint for valid metrics)
      - `operator` (text, check constraint for valid operators)
      - `value` (numeric, threshold value)
      - `severity` (text, check constraint for severity levels)
      - `created_at` (timestamptz)

    - `automation_rules`
      - `id` (uuid, primary key)
      - `device_id` (uuid, references devices)
      - `name` (text, rule name)
      - `condition` (jsonb, rule conditions)
      - `action` (jsonb, action to take)
      - `enabled` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for device owners
    - Add validation checks for metrics and operators

  3. Functions
    - Add function to evaluate metrics against thresholds
    - Add function to execute automation actions
*/

-- Create alert thresholds table
CREATE TABLE IF NOT EXISTS alert_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  metric TEXT NOT NULL CHECK (metric IN ('cpu', 'memory', 'disk', 'network')),
  operator TEXT NOT NULL CHECK (operator IN ('>', '<', '=', '≠')),
  value NUMERIC NOT NULL CHECK (value >= 0 AND value <= 100),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create automation rules table
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  condition JSONB NOT NULL,
  action JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alert thresholds
CREATE POLICY "Users can view their device thresholds"
  ON alert_thresholds
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = alert_thresholds.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their device thresholds"
  ON alert_thresholds
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = alert_thresholds.device_id
      AND devices.user_id = auth.uid()
    )
  );

-- RLS Policies for automation rules
CREATE POLICY "Users can view their automation rules"
  ON automation_rules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = automation_rules.device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their automation rules"
  ON automation_rules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = automation_rules.device_id
      AND devices.user_id = auth.uid()
    )
  );

-- Function to evaluate metrics
CREATE OR REPLACE FUNCTION evaluate_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Check metrics against thresholds
  INSERT INTO device_alerts (device_id, type, message, severity)
  SELECT
    NEW.device_id,
    CASE
      WHEN t.severity = 'critical' THEN 'error'
      WHEN t.severity = 'warning' THEN 'warning'
      ELSE 'info'
    END,
    format('%s %s %s (current: %s)', t.metric, t.operator, t.value, 
      CASE t.metric
        WHEN 'cpu' THEN NEW.cpu_usage
        WHEN 'memory' THEN NEW.memory_usage
        WHEN 'disk' THEN NEW.disk_usage
        WHEN 'network' THEN NEW.network_usage
      END
    ),
    t.severity
  FROM alert_thresholds t
  WHERE t.device_id = NEW.device_id
  AND (
    (t.metric = 'cpu' AND NEW.cpu_usage > t.value) OR
    (t.metric = 'memory' AND NEW.memory_usage > t.value) OR
    (t.metric = 'disk' AND NEW.disk_usage > t.value) OR
    (t.metric = 'network' AND NEW.network_usage > t.value)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for metric evaluation
CREATE TRIGGER evaluate_metrics_trigger
AFTER INSERT ON device_metrics
FOR EACH ROW
EXECUTE FUNCTION evaluate_metrics();