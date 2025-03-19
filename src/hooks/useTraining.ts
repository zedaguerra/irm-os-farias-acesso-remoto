import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface TrainingMaterial {
  id: string;
  title: string;
  content: string;
  role: string;
  completed: boolean;
}

export function useTraining(userRole: string) {
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchTrainingMaterials();
  }, [userRole]);

  const fetchTrainingMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('training_materials')
        .select('*')
        .eq('role', userRole)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMaterials(data || []);
      updateProgress(data || []);
    } catch (error) {
      console.error('Error fetching training materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = (materials: TrainingMaterial[]) => {
    if (materials.length === 0) {
      setProgress(0);
      return;
    }

    const completed = materials.filter(m => m.completed).length;
    setProgress((completed / materials.length) * 100);
  };

  const markAsCompleted = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from('training_materials')
        .update({ completed: true })
        .eq('id', materialId);

      if (error) throw error;

      setMaterials(prev => {
        const updated = prev.map(m => 
          m.id === materialId ? { ...m, completed: true } : m
        );
        updateProgress(updated);
        return updated;
      });
    } catch (error) {
      console.error('Error marking material as completed:', error);
    }
  };

  return {
    materials,
    loading,
    progress,
    markAsCompleted
  };
}