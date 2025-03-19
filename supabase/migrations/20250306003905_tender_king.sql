/*
  # Sessions and Connection Tokens Schema

  1. New Tables
    - sessions: Stores active remote/local sessions
    - connection_tokens: Manages secure connection tokens
    
  2. Security
    - RLS policies for access control
    - Token expiration handling
    - Secure session management
*/

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  machine_id uuid NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'active', 'ended')),
  connection_type text NOT NULL CHECK (connection_type IN ('remote', 'local')),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_machine_id_idx ON sessions(machine_id);
CREATE INDEX IF NOT EXISTS sessions_status_idx ON sessions(status);

-- Enable RLS for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sessions' 
    AND policyname = 'Users can view their own sessions'
  ) THEN
    CREATE POLICY "Users can view their own sessions"
      ON sessions
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sessions' 
    AND policyname = 'Users can create sessions for their machines'
  ) THEN
    CREATE POLICY "Users can create sessions for their machines"
      ON sessions
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM machines
          WHERE id = machine_id
          AND owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sessions' 
    AND policyname = 'Users can update their own sessions'
  ) THEN
    CREATE POLICY "Users can update their own sessions"
      ON sessions
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Create connection_tokens table
CREATE TABLE IF NOT EXISTS connection_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'active', 'expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for connection_tokens
CREATE INDEX IF NOT EXISTS connection_tokens_machine_id_idx ON connection_tokens(machine_id);
CREATE INDEX IF NOT EXISTS connection_tokens_token_idx ON connection_tokens(token);
CREATE INDEX IF NOT EXISTS connection_tokens_status_idx ON connection_tokens(status);

-- Enable RLS for connection_tokens
ALTER TABLE connection_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for connection_tokens
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'connection_tokens' 
    AND policyname = 'Users can view tokens for their machines'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'connection_tokens' 
    AND policyname = 'Users can create tokens for their machines'
  ) THEN
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
  END IF;
END $$;

-- Function to automatically expire tokens
CREATE OR REPLACE FUNCTION expire_old_tokens() RETURNS trigger AS $$
BEGIN
  UPDATE connection_tokens
  SET status = 'expired'
  WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for token expiration
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'expire_tokens_trigger'
  ) THEN
    CREATE TRIGGER expire_tokens_trigger
      AFTER INSERT OR UPDATE ON connection_tokens
      FOR EACH STATEMENT
      EXECUTE FUNCTION expire_old_tokens();
  END IF;
END $$;