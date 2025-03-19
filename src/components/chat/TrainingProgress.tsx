import React from 'react';
import { useTraining } from '../../hooks/useTraining';
import { CheckCircle, Circle, BookOpen } from 'lucide-react';

interface TrainingProgressProps {
  userRole: string;
}

export function TrainingProgress({ userRole }: TrainingProgressProps) {
  const { materials, loading, progress, markAsCompleted } = useTraining(userRole);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">
            Progresso do Treinamento
          </h2>
        </div>
        <div className="text-sm text-gray-500">
          {Math.round(progress)}% concluído
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="space-y-4">
        {materials.map((material) => (
          <div
            key={material.id}
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
          >
            <button
              onClick={() => markAsCompleted(material.id)}
              className="flex-shrink-0 mt-1"
            >
              {material.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </button>
            <div>
              <h3 className="font-medium text-gray-800">{material.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{material.content}</p>
            </div>
          </div>
        ))}

        {materials.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            Nenhum material de treinamento disponível
          </p>
        )}
      </div>
    </div>
  );
}