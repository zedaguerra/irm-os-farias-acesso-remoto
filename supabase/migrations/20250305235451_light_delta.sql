/*
  # Session and Connection Management Tables

  1. New Tables
    - `machine_sessions`
      - `id` (uuid, primary key)
      - `machine_id` (uuid, references machines)
      - `user_id` (uuid, references auth.users)
      - `status` (text): active, ended
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)
      - `connection_type` (text): remote, local
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

    - `connection_tokens`
      - `id` (uuid, primary key)
      - `machine_id` (uuid, references machines)
      - `token` (text, unique)
      - `status` (text): pending, active, expired
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create machine_sessions table
CREATE TABLE IF NOT EXISTS machine_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('active', 'ended')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  connection_type text NOT NULL CHECK (connection_type IN ('remote', 'local')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create connection_tokens table
CREATE TABLE IF NOT EXISTS connection_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'active', 'expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE machine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_tokens ENABLE ROW LEVEL SECURITY;

-- Policies for machine_sessions
CREATE POLICY "Users can view their own sessions"
  ON machine_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create sessions for their machines"
  ON machine_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM machines
      WHERE id = machine_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own sessions"
  ON machine_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for connection_tokens
CREATE POLICY "Users can view tokens for their machines"
  ON connection_tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM machines
      WHERE id = machine_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tokens for their machines"
  ON connection_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM machines
      WHERE id = machine_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tokens for their machines"
  ON connection_tokens
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM machines
      WHERE id = machine_id
      AND owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX machine_sessions_user_id_idx ON machine_sessions(user_id);
CREATE INDEX machine_sessions_machine_id_idx ON machine_sessions(machine_id);
CREATE INDEX machine_sessions_status_idx ON machine_sessions(status);
CREATE INDEX connection_tokens_machine_id_idx ON connection_tokens(machine_id);
CREATE INDEX connection_tokens_status_idx ON connection_tokens(status);
CREATE INDEX connection_tokens_token_idx ON connection_tokens(token);