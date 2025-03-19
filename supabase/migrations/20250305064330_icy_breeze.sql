/*
  # Training and Analytics System

  1. New Tables
    - `training_materials`
      - Training content for different user roles
      - Progress tracking
      - Completion status
    
    - `chat_interactions`
      - Message history
      - Response metrics
      - User feedback
    
    - `activities`
      - User activity tracking
      - Detailed activity logs
      - Analytics data

  2. Security
    - Enable RLS on all tables
    - Add policies for data access
    - Ensure user data isolation
*/

-- Training Materials Table
CREATE TABLE IF NOT EXISTS training_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  role text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Training Progress Table
CREATE TABLE IF NOT EXISTS user_training_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  material_id uuid REFERENCES training_materials NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, material_id)
);

-- Chat Interactions Table
CREATE TABLE IF NOT EXISTS chat_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  message text NOT NULL,
  response text NOT NULL,
  response_time numeric NOT NULL, -- in milliseconds
  feedback_rating integer CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment text,
  created_at timestamptz DEFAULT now()
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  device_name text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies for training_materials
CREATE POLICY "Anyone can view training materials"
  ON training_materials
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user_training_progress
CREATE POLICY "View own training progress"
  ON user_training_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own training progress"
  ON user_training_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own training progress"
  ON user_training_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for chat_interactions
CREATE POLICY "View own chat interactions"
  ON chat_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own chat interactions"
  ON chat_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for activities
CREATE POLICY "View own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS training_materials_role_idx ON training_materials(role);
CREATE INDEX IF NOT EXISTS user_training_progress_user_id_idx ON user_training_progress(user_id);
CREATE INDEX IF NOT EXISTS chat_interactions_user_id_created_at_idx ON chat_interactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS activities_user_id_created_at_idx ON activities(user_id, created_at);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_training_materials_updated_at
  BEFORE UPDATE ON training_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();