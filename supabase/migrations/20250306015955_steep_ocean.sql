/*
  # Support Access System Schema

  1. New Tables
    - support_users: Stores support staff credentials and permissions
    - support_access_requests: Tracks access requests and their status
    - support_access_logs: Audit trail for all support access events

  2. Features
    - MFA support
    - Access request workflow
    - Comprehensive audit logging
    - Row level security
*/

-- Create support_users table
CREATE TABLE IF NOT EXISTS support_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  permissions text[] NOT NULL,
  mfa_enabled boolean DEFAULT false,
  mfa_secret text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create support_access_requests table
CREATE TABLE IF NOT EXISTS support_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices(id) NOT NULL,
  support_user_id uuid REFERENCES support_users(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('view', 'control')),
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create support_access_logs table
CREATE TABLE IF NOT EXISTS support_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES support_access_requests(id) NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_access_requests_device ON support_access_requests(device_id);
CREATE INDEX IF NOT EXISTS idx_support_access_requests_user ON support_access_requests(support_user_id);
CREATE INDEX IF NOT EXISTS idx_support_access_logs_request ON support_access_logs(request_id);

-- Enable RLS
ALTER TABLE support_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Support users can view their own profile"
  ON support_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Device owners can view access requests"
  ON support_access_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = device_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Support users can view their requests"
  ON support_access_requests FOR SELECT
  TO authenticated
  USING (support_user_id = auth.uid());

CREATE POLICY "Device owners can view access logs"
  ON support_access_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_access_requests
      JOIN devices ON devices.id = support_access_requests.device_id
      WHERE support_access_requests.id = request_id
      AND devices.user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_support_users_updated_at
  BEFORE UPDATE ON support_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();