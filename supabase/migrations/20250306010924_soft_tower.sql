/*
  # Training System Schema

  1. Tables
    - training_materials: Stores training content and metadata
    - training_progress: Tracks user progress through materials
    - training_feedback: Stores user ratings and comments
    - training_metrics: Records detailed training metrics

  2. Features
    - Full text search capabilities
    - Progress tracking
    - Analytics functions
    - Row level security
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view training materials" ON training_materials;
DROP POLICY IF EXISTS "Users can view their own progress" ON training_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON training_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON training_progress;
DROP POLICY IF EXISTS "Users can view all feedback" ON training_feedback;
DROP POLICY IF EXISTS "Users can create their own feedback" ON training_feedback;
DROP POLICY IF EXISTS "Users can view their own metrics" ON training_metrics;
DROP POLICY IF EXISTS "Users can create their own metrics" ON training_metrics;

-- Create training_materials table if it doesn't exist
CREATE TABLE IF NOT EXISTS training_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'beginner',
  role text NOT NULL DEFAULT 'user',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT training_materials_category_check 
    CHECK (category IN ('general', 'security', 'networking', 'support', 'management')),
  CONSTRAINT training_materials_difficulty_check 
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  CONSTRAINT training_materials_role_check 
    CHECK (role IN ('admin', 'support', 'user'))
);

-- Create training_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS training_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  material_id uuid REFERENCES training_materials NOT NULL,
  status text DEFAULT 'not_started',
  progress_percentage integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT training_progress_status_check 
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  CONSTRAINT training_progress_percentage_check
    CHECK (progress_percentage BETWEEN 0 AND 100),
  CONSTRAINT training_progress_user_material_unique 
    UNIQUE (user_id, material_id)
);

-- Create training_feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS training_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  material_id uuid REFERENCES training_materials NOT NULL,
  rating integer NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT training_feedback_rating_check 
    CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT training_feedback_user_material_unique 
    UNIQUE (user_id, material_id)
);

-- Create training_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS training_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  material_id uuid REFERENCES training_materials NOT NULL,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  recorded_at timestamptz DEFAULT now(),
  CONSTRAINT training_metrics_type_check
    CHECK (metric_type IN ('time_spent', 'attempts', 'score'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_training_materials_category ON training_materials(category);
CREATE INDEX IF NOT EXISTS idx_training_materials_role ON training_materials(role);
CREATE INDEX IF NOT EXISTS idx_training_progress_user ON training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_material ON training_progress(material_id);
CREATE INDEX IF NOT EXISTS idx_training_feedback_material ON training_feedback(material_id);
CREATE INDEX IF NOT EXISTS idx_training_metrics_user ON training_metrics(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for training_materials
DROP TRIGGER IF EXISTS update_training_materials_updated_at ON training_materials;
CREATE TRIGGER update_training_materials_updated_at
  BEFORE UPDATE ON training_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_metrics ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Anyone can view training materials"
  ON training_materials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own progress"
  ON training_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON training_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON training_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all feedback"
  ON training_feedback FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own feedback"
  ON training_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own metrics"
  ON training_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metrics"
  ON training_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create analytics function
CREATE OR REPLACE FUNCTION get_user_training_progress(p_user_id uuid)
RETURNS TABLE (
  total_materials bigint,
  completed_materials bigint,
  avg_progress numeric,
  total_time_spent numeric
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT tm.id),
    COUNT(DISTINCT CASE WHEN tp.status = 'completed' THEN tm.id END),
    ROUND(AVG(tp.progress_percentage), 2),
    COALESCE(SUM(
      CASE WHEN met.metric_type = 'time_spent' 
      THEN met.metric_value 
      ELSE 0 END
    ), 0)
  FROM training_materials tm
  LEFT JOIN training_progress tp ON tm.id = tp.material_id
  LEFT JOIN training_metrics met ON tm.id = met.material_id
  WHERE tp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;