export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      machines: {
        Row: Machine;
        Insert: Omit<Machine, 'id' | 'created_at' | 'updated_at' | 'last_ping'>;
        Update: Partial<Omit<Machine, 'id' | 'created_at' | 'updated_at'>>;
      };
      machine_metrics: {
        Row: MachineMetrics;
        Insert: Omit<MachineMetrics, 'id' | 'timestamp'>;
        Update: never;
      };
      alert_thresholds: {
        Row: AlertThreshold;
        Insert: Omit<AlertThreshold, 'id' | 'created_at'>;
        Update: Partial<Omit<AlertThreshold, 'id' | 'created_at'>>;
      };
      automation_rules: {
        Row: AutomationRule;
        Insert: Omit<AutomationRule, 'id' | 'created_at'>;
        Update: Partial<Omit<AutomationRule, 'id' | 'created_at'>>;
      };
      device_alerts: {
        Row: DeviceAlert;
        Insert: Omit<DeviceAlert, 'id' | 'created_at'>;
        Update: Partial<Omit<DeviceAlert, 'id' | 'created_at'>>;
      };
      training_materials: {
        Row: TrainingMaterial;
        Insert: Omit<TrainingMaterial, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TrainingMaterial, 'id' | 'created_at' | 'updated_at'>>;
      };
      training_progress: {
        Row: TrainingProgress;
        Insert: Omit<TrainingProgress, 'id' | 'created_at'>;
        Update: Partial<Omit<TrainingProgress, 'id' | 'created_at'>>;
      };
    };
    Views: {
      training_analytics: {
        Row: {
          role: string | null;
          category: string | null;
          difficulty: string | null;
          total_users: number | null;
          completed_users: number | null;
          completion_rate: number | null;
        };
      };
    };
    Functions: {
      get_user_training_progress: {
        Args: { p_user_id: string };
        Returns: {
          total_materials: number;
          completed_materials: number;
          avg_progress: number;
          total_time_spent: number;
        };
      };
    };
    Enums: {
      difficulty_level: 'beginner' | 'intermediate' | 'advanced';
      alert_severity: 'low' | 'medium' | 'high';
      machine_status: 'active' | 'inactive' | 'maintenance';
    };
  };
}

export interface Machine {
  id: string;
  owner_id: string;
  name: string;
  status: Database['public']['Enums']['machine_status'];
  last_ping: string;
  created_at: string;
  updated_at: string;
  session_enabled: boolean;
  session_timeout: number;
  require_approval: boolean;
}

export interface MachineMetrics {
  id: string;
  machine_id: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  timestamp: string;
}

export interface AlertThreshold {
  id: string;
  device_id: string;
  metric: string;
  operator: string;
  value: number;
  severity: Database['public']['Enums']['alert_severity'];
  created_at: string;
}

export interface AutomationRule {
  id: string;
  device_id: string;
  name: string;
  condition: Json;
  action: Json;
  enabled: boolean;
  created_at: string;
}

export interface DeviceAlert {
  id: string;
  device_id: string;
  type: string;
  message: string;
  severity: Database['public']['Enums']['alert_severity'];
  read: boolean;
  created_at: string;
}

export interface TrainingMaterial {
  id: string;
  title: string;
  content: string;
  category: string;
  role: string;
  difficulty: Database['public']['Enums']['difficulty_level'];
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