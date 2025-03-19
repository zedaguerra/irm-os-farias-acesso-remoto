import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { DiagnosticsPanel } from '../diagnostics/DiagnosticsPanel';
import { RealtimeMetrics } from '../metrics/RealtimeMetrics';
import { ActivityLog } from '../activity/ActivityLog';
import { Monitor, Settings, AlertTriangle } from 'lucide-react';

interface MachineDetailsProps {
  machineId: string;
}

export function MachineDetails({ machineId }: MachineDetailsProps) {
  const { data: machine, isLoading } = useQuery({
    queryKey: ['machine', machineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('id', machineId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-500">Machine not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Monitor className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{machine.name}</h1>
              <p className="text-sm text-gray-500">Status: {machine.status}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <RealtimeMetrics deviceId={machineId} />
          <ActivityLog deviceId={machineId} />
        </div>
        <div>
          <DiagnosticsPanel machineId={machineId} />
        </div>
      </div>
    </div>
  );
}