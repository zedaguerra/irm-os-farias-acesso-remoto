import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { aiDiagnostics } from '../../lib/ai-diagnostics';
import { AlertTriangle, CheckCircle, Clock, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

interface DiagnosticsPanelProps {
  machineId: string;
}

export function DiagnosticsPanel({ machineId }: DiagnosticsPanelProps) {
  const { data: diagnostics, isLoading } = useQuery({
    queryKey: ['diagnostics', machineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_diagnostics')
        .select('*')
        .eq('machine_id', machineId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', machineId],
    queryFn: () => aiDiagnostics.getRecommendations(machineId),
    refetchInterval: 300000 // 5 minutes
  });

  const handleResolve = async (diagnosticId: string) => {
    try {
      const { error } = await supabase
        .from('ai_diagnostics')
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', diagnosticId);

      if (error) throw error;
      toast.success('Issue marked as resolved');
    } catch (error) {
      console.error('Error resolving diagnostic:', error);
      toast.error('Failed to resolve issue');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Brain className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">AI Diagnostics</h2>
          </div>
        </div>

        <div className="space-y-4">
          {diagnostics?.map((diagnostic) => (
            <div
              key={diagnostic.id}
              className={`bg-gray-50 rounded-lg p-4 ${
                diagnostic.resolved_at ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    {diagnostic.resolved_at ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    )}
                    <h3 className="font-medium text-gray-900">{diagnostic.error_type}</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{diagnostic.description}</p>
                  <div className="mt-2 bg-white rounded p-3 border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Recommended Solution:</p>
                    <p className="mt-1 text-sm text-gray-600">{diagnostic.solution}</p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(diagnostic.created_at).toLocaleString()}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Confidence: {(diagnostic.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                {!diagnostic.resolved_at && (
                  <button
                    onClick={() => handleResolve(diagnostic.id)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ))}

          {!diagnostics?.length && (
            <p className="text-center text-gray-500 py-4">
              No diagnostic issues found
            </p>
          )}
        </div>
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            AI Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li
                key={index}
                className="flex items-start space-x-2 text-sm text-gray-600"
              >
                <Brain className="h-4 w-4 text-purple-500 mt-1" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}