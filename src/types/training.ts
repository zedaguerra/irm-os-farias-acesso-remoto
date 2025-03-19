export interface TrainingMaterial {
  id: string;
  title: string;
  content: string;
  category: string;
  role: string;
  difficulty: 'iniciante' | 'intermediário' | 'avançado';
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingProgress {
  id: string;
  user_id: string;
  material_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string;
  created_at: string;
}

export interface TrainingFeedback {
  id: string;
  user_id: string;
  material_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface TrainingMetrics {
  id: string;
  user_id: string;
  material_id: string;
  metric_type: 'time_spent' | 'attempts' | 'score';
  metric_value: number;
  recorded_at: string;
}