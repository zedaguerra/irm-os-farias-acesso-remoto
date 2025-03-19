/*
  # Training System Schema Migration

  1. New Tables
    - training_materials: Stores training content and metadata
    - training_progress: Tracks user progress
    - training_feedback: Stores user ratings and comments
    - training_metrics: Records learning analytics

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated users
    - Analytics function with security definer

  3. Features
    - Progress tracking
    - User feedback system
    - Learning metrics
    - Performance analytics
*/

-- Create training_materials table
CREATE TABLE IF NOT EXISTS training_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  role text NOT NULL,
  difficulty text NOT NULL DEFAULT 'iniciante',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role = ANY (ARRAY['admin', 'suporte', 'usuario'])),
  CONSTRAINT valid_difficulty CHECK (difficulty = ANY (ARRAY['iniciante', 'intermediario', 'avancado']))
);

-- Create training_progress table
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
  CONSTRAINT valid_status CHECK (status = ANY (ARRAY['not_started', 'in_progress', 'completed'])),
  CONSTRAINT valid_percentage CHECK (progress_percentage BETWEEN 0 AND 100),
  UNIQUE (user_id, material_id)
);

-- Create training_feedback table
CREATE TABLE IF NOT EXISTS training_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  material_id uuid REFERENCES training_materials NOT NULL,
  rating integer NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5),
  UNIQUE (user_id, material_id)
);

-- Create training_metrics table
CREATE TABLE IF NOT EXISTS training_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  material_id uuid REFERENCES training_materials NOT NULL,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  recorded_at timestamptz DEFAULT now(),
  CONSTRAINT valid_metric_type CHECK (metric_type = ANY (ARRAY['time_spent', 'attempts', 'score']))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_training_materials_category ON training_materials(category);
CREATE INDEX IF NOT EXISTS idx_training_materials_role ON training_materials(role);
CREATE INDEX IF NOT EXISTS idx_training_progress_user ON training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_material ON training_progress(material_id);
CREATE INDEX IF NOT EXISTS idx_training_feedback_material ON training_feedback(material_id);
CREATE INDEX IF NOT EXISTS idx_training_metrics_user ON training_metrics(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_training_materials_updated_at'
  ) THEN
    CREATE TRIGGER update_training_materials_updated_at
      BEFORE UPDATE ON training_materials
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'training_materials' 
    AND policyname = 'Anyone can view training materials'
  ) THEN
    CREATE POLICY "Anyone can view training materials"
      ON training_materials FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'training_progress' 
    AND policyname = 'Users can view their own progress'
  ) THEN
    CREATE POLICY "Users can view their own progress"
      ON training_progress FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'training_progress' 
    AND policyname = 'Users can insert their own progress'
  ) THEN
    CREATE POLICY "Users can insert their own progress"
      ON training_progress FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'training_progress' 
    AND policyname = 'Users can update their own progress'
  ) THEN
    CREATE POLICY "Users can update their own progress"
      ON training_progress FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'training_feedback' 
    AND policyname = 'Users can view all feedback'
  ) THEN
    CREATE POLICY "Users can view all feedback"
      ON training_feedback FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'training_feedback' 
    AND policyname = 'Users can create their own feedback'
  ) THEN
    CREATE POLICY "Users can create their own feedback"
      ON training_feedback FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'training_metrics' 
    AND policyname = 'Users can view their own metrics'
  ) THEN
    CREATE POLICY "Users can view their own metrics"
      ON training_metrics FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'training_metrics' 
    AND policyname = 'Users can create their own metrics'
  ) THEN
    CREATE POLICY "Users can create their own metrics"
      ON training_metrics FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

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

-- Insert initial training materials
DO $$
BEGIN
  INSERT INTO training_materials (title, content, category, role, difficulty, order_index)
  VALUES
    ('Introducao a Seguranca', 'Conceitos fundamentais de seguranca da informacao', 'seguranca', 'usuario', 'iniciante', 1),
    ('Gerenciamento de Redes', 'Configuracao e administracao de redes empresariais', 'redes', 'admin', 'intermediario', 2),
    ('Suporte Tecnico Avancado', 'Tecnicas avancadas de resolucao de problemas', 'suporte', 'suporte', 'avancado', 3);
END $$;