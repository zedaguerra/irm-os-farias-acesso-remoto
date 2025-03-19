import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import { supabase } from '../../lib/supabase';
import { Cpu, HardDrive, MemoryStick as Memory } from 'lucide-react';

interface MachineMetricsProps {
  machineId: string;
}

export function MachineMetrics({ machineId }: MachineMetricsProps) {
  const { data: metrics } = useQuery({
    queryKey: ['machine-metrics', machineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machine_metrics')
        .select('*')
        .eq('machine_id', machineId)
        .order('timestamp', { ascending: true })
        .limit(50);

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const chartData = {
    labels: metrics?.map(m => new Date(m.timestamp).toLocaleTimeString()) || [],
    datasets: [
      {
        label: 'CPU Usage',
        data: metrics?.map(m => m.cpu_usage) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true
      },
      {
        label: 'Memory Usage',
        data: metrics?.map(m => m.memory_usage) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true
      },
      {
        label: 'Disk Usage',
        data: metrics?.map(m => m.disk_usage) || [],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true
      }
    ]
  };

  const currentMetrics = metrics?.[metrics.length - 1];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Cpu className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-gray-600">CPU</span>
            </div>
            <span className="text-2xl font-semibold text-gray-900">
              {currentMetrics?.cpu_usage.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Memory className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-gray-600">Memory</span>
            </div>
            <span className="text-2xl font-semibold text-gray-900">
              {currentMetrics?.memory_usage.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HardDrive className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-gray-600">Disk</span>
            </div>
            <span className="text-2xl font-semibold text-gray-900">
              {currentMetrics?.disk_usage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance History
        </h3>
        <div className="h-64">
          <Line
            data={chartData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}