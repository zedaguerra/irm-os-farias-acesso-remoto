/*
  # Add Account Types and Session Management

  1. New Tables
    - `account_types` - Stores account type configurations
    - `user_accounts` - Links users to their account types
    - `session_permissions` - Defines session access levels

  2. Changes
    - Add account_type field to profiles table
    - Add business_id field to profiles for business account linking
    - Add session management fields to machines table

  3. Security
    - Enable RLS on new tables
    - Add policies for account type access
    - Add policies for session management
*/

-- Create account types table
CREATE TABLE IF NOT EXISTS account_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('personal', 'business')),
  features jsonb DEFAULT '[]',
  max_devices integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;

-- Create user accounts table
CREATE TABLE IF NOT EXISTS user_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type_id uuid REFERENCES account_types(id),
  business_name text,
  business_id uuid,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, account_type_id)
);

ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

-- Create session permissions table
CREATE TABLE IF NOT EXISTS session_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level text NOT NULL CHECK (permission_level IN ('view', 'control', 'admin')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(machine_id, user_id)
);

ALTER TABLE session_permissions ENABLE ROW LEVEL SECURITY;

-- Add new fields to machines table
ALTER TABLE machines ADD COLUMN IF NOT EXISTS session_enabled boolean DEFAULT true;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS session_timeout integer DEFAULT 30;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS require_approval boolean DEFAULT false;

-- Add RLS policies
CREATE POLICY "Users can view their own account types"
  ON account_types
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts
      WHERE user_accounts.account_type_id = account_types.id
      AND user_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their accounts"
  ON user_accounts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage session permissions they own"
  ON session_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM machines
      WHERE machines.id = session_permissions.machine_id
      AND machines.owner_id = auth.uid()
    )
  );

-- Insert default account types
INSERT INTO account_types (name, type, features, max_devices)
VALUES 
  ('Personal', 'personal', '["remote_access", "monitoring"]', 1),
  ('Business', 'business', '["remote_access", "monitoring", "team_management", "advanced_security"]', 999)
ON CONFLICT DO NOTHING;