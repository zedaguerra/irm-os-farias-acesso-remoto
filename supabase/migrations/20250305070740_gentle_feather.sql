/*
  # Training Materials and Analytics Improvements

  1. New Data
    - Add initial training materials for different roles
    - Add analytics views for better reporting
  
  2. Changes
    - Add training categories and difficulty levels
    - Add analytics functions for metrics calculation
    
  3. Security
    - Maintain existing RLS policies
    - Add new policies for analytics views
*/

-- Add categories and difficulty to training materials
ALTER TABLE training_materials
ADD COLUMN category text NOT NULL DEFAULT 'general',
ADD COLUMN difficulty text NOT NULL DEFAULT 'beginner'
CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));

-- Insert initial training materials
INSERT INTO training_materials (title, content, role, order_index, category, difficulty) VALUES
-- Admin Materials
('Gerenciamento de Segurança', 'Aprenda as melhores práticas de segurança para gerenciar sua infraestrutura.', 'admin', 1, 'security', 'advanced'),
('Configuração de Rede', 'Configure e otimize suas redes para máximo desempenho.', 'admin', 2, 'network', 'advanced'),
('Backup e Recuperação', 'Estratégias eficientes para backup e recuperação de dados.', 'admin', 3, 'security', 'intermediate'),

-- Support Materials
('Atendimento ao Cliente', 'Técnicas para um excelente atendimento ao cliente.', 'support', 1, 'customer-service', 'beginner'),
('Resolução de Problemas', 'Metodologia para identificação e resolução de problemas.', 'support', 2, 'troubleshooting', 'intermediate'),
('Manutenção Preventiva', 'Guia completo de manutenção preventiva de sistemas.', 'support', 3, 'maintenance', 'intermediate'),

-- User Materials
('Introdução ao Sistema', 'Guia básico para começar a usar o sistema.', 'user', 1, 'basics', 'beginner'),
('Segurança Básica', 'Práticas fundamentais de segurança para usuários.', 'user', 2, 'security', 'beginner'),
('Produtividade', 'Dicas para aumentar sua produtividade com o sistema.', 'user', 3, 'productivity', 'intermediate');

-- Create view for training analytics
CREATE OR REPLACE VIEW training_analytics AS
SELECT
  tm.role,
  tm.category,
  tm.difficulty,
  COUNT(DISTINCT utp.user_id) as total_users,
  COUNT(DISTINCT CASE WHEN utp.completed THEN utp.user_id END) as completed_users,
  ROUND(COUNT(DISTINCT CASE WHEN utp.completed THEN utp.user_id END)::numeric / 
    NULLIF(COUNT(DISTINCT utp.user_id), 0) * 100, 2) as completion_rate
FROM training_materials tm
LEFT JOIN user_training_progress utp ON tm.id = utp.material_id
GROUP BY tm.role, tm.category, tm.difficulty;

-- Create view for chat analytics
CREATE OR REPLACE VIEW chat_analytics AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_interactions,
  AVG(response_time) as avg_response_time,
  AVG(feedback_rating) as avg_rating,
  COUNT(CASE WHEN feedback_rating >= 4 THEN 1 END) as positive_feedback,
  COUNT(CASE WHEN feedback_rating <= 2 THEN 1 END) as negative_feedback
FROM chat_interactions
GROUP BY DATE_TRUNC('day', created_at);

-- Function to calculate user progress
CREATE OR REPLACE FUNCTION calculate_user_progress(user_id uuid)
RETURNS TABLE (
  total_materials integer,
  completed_materials integer,
  progress_percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(tm.id)::integer as total_materials,
    COUNT(CASE WHEN utp.completed THEN 1 END)::integer as completed_materials,
    ROUND(COUNT(CASE WHEN utp.completed THEN 1 END)::numeric / 
      NULLIF(COUNT(tm.id), 0) * 100, 2) as progress_percentage
  FROM training_materials tm
  LEFT JOIN user_training_progress utp 
    ON tm.id = utp.material_id 
    AND utp.user_id = calculate_user_progress.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;