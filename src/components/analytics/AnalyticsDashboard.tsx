import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ChartData, ChartOptions } from 'chart.js';
import { BookOpen, Clock, Trophy, TrendingUp } from 'lucide-react';

interface ProgressMetrics {
  total_materials: number;
  completed_materials: number;
  avg_progress: number;
  total_time_spent: number;
}

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    if (user) {
      fetchMetrics();
      fetchProgressHistory();
    }
  }, [user]);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase.rpc(
        'get_user_training_progress',
        { p_user_id: user?.id }
      );

      if (error) throw error;
      setMetrics(data[0]);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchProgressHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('training_progress')
        .select('progress_percentage, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setProgressData({
        labels: data.map(d => new Date(d.created_at).toLocaleDateString()),
        datasets: [{
          label: 'Progresso',
          data: data.map(d => d.progress_percentage),
          fill: true,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }]
      });
    } catch (error) {
      console.error('Error fetching progress history:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Análise de Progresso
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Materiais</p>
              <p className="text-2xl font-bold text-gray-800">
                {metrics?.total_materials || 0}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Materiais Concluídos</p>
              <p className="text-2xl font-bold text-gray-800">
                {metrics?.completed_materials || 0}
              </p>
            </div>
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Progresso Médio</p>
              <p className="text-2xl font-bold text-gray-800">
                {metrics?.avg_progress?.toFixed(1) || 0}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tempo Total</p>
              <p className="text-2xl font-bold text-gray-800">
                {Math.round(metrics?.total_time_spent || 0)}min
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Histórico de Progresso
        </h3>
        <div className="h-64">
          <Line data={progressData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}