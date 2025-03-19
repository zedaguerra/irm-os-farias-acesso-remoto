import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Book, BookOpen, CheckCircle, Clock, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { TrainingMaterial, TrainingProgress } from '../../types/training';

export function TrainingCatalog() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [progress, setProgress] = useState<Record<string, TrainingProgress>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    fetchMaterials();
  }, [user]);

  const fetchMaterials = async () => {
    try {
      const { data: materialsData, error: materialsError } = await supabase
        .from('training_materials')
        .select('*')
        .order('order_index', { ascending: true });

      if (materialsError) throw materialsError;

      const { data: progressData, error: progressError } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (progressError) throw progressError;

      setMaterials(materialsData || []);
      const progressMap = (progressData || []).reduce((acc, curr) => ({
        ...acc,
        [curr.material_id]: curr
      }), {});
      setProgress(progressMap);
    } catch (error) {
      console.error('Error fetching training materials:', error);
      toast.error('Erro ao carregar materiais de treinamento');
    } finally {
      setLoading(false);
    }
  };

  const startMaterial = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from('training_progress')
        .upsert({
          user_id: user?.id,
          material_id: materialId,
          status: 'in_progress',
          started_at: new Date().toISOString()
        });

      if (error) throw error;
      await fetchMaterials();
      toast.success('Material iniciado!');
    } catch (error) {
      console.error('Error starting material:', error);
      toast.error('Erro ao iniciar material');
    }
  };

  const completeMaterial = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from('training_progress')
        .upsert({
          user_id: user?.id,
          material_id: materialId,
          status: 'completed',
          completed_at: new Date().toISOString(),
          progress_percentage: 100
        });

      if (error) throw error;
      await fetchMaterials();
      toast.success('Material concluído!');
    } catch (error) {
      console.error('Error completing material:', error);
      toast.error('Erro ao concluir material');
    }
  };

  const filteredMaterials = materials.filter(material => {
    const materialProgress = progress[material.id];
    if (filter === 'completed') {
      return materialProgress?.status === 'completed';
    }
    if (filter === 'in_progress') {
      return materialProgress?.status === 'in_progress';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Materiais de Treinamento
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'in_progress'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Em Andamento
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Concluídos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => {
          const materialProgress = progress[material.id];
          const isCompleted = materialProgress?.status === 'completed';
          const isInProgress = materialProgress?.status === 'in_progress';

          return (
            <div
              key={material.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isCompleted ? 'bg-green-100' :
                      isInProgress ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : isInProgress ? (
                        <Clock className="h-6 w-6 text-yellow-600" />
                      ) : (
                        <Book className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {material.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {material.category}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    material.difficulty === 'iniciante'
                      ? 'bg-green-100 text-green-800'
                      : material.difficulty === 'intermediário'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {material.difficulty}
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-600 line-clamp-3">
                  {material.content}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  {isCompleted ? (
                    <span className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Concluído
                    </span>
                  ) : isInProgress ? (
                    <button
                      onClick={() => completeMaterial(material.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Marcar como Concluído
                    </button>
                  ) : (
                    <button
                      onClick={() => startMaterial(material.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Iniciar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Nenhum material encontrado para os filtros selecionados.
          </p>
        </div>
      )}
    </div>
  );
}