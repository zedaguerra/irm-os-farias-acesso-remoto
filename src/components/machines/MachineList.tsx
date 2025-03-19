import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { machineControl } from '../../lib/machine-control';
import { Monitor, Power, RefreshCw, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export function MachineList() {
  const { data: machines, isLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select(`
          *,
          machine_permissions (
            access_level
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleRestart = async (machineId: string) => {
    try {
      await machineControl.restartMachine(machineId);
      toast.success('Machine restart initiated');
    } catch (error) {
      toast.error('Failed to restart machine');
    }
  };

  const handleStatusChange = async (machineId: string, status: 'active' | 'inactive' | 'maintenance') => {
    try {
      await machineControl.updateMachineStatus(machineId, status);
      toast.success('Machine status updated');
    } catch (error) {
      toast.error('Failed to update machine status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {machines?.map((machine) => (
        <div
          key={machine.id}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Monitor className="h-6 w-6 text-blue-600" />
                <h3 className="ml-2 text-lg font-semibold text-gray-800">
                  {machine.name}
                </h3>
              </div>
              <span
                className={`px-2 py-1 text-sm rounded-full ${
                  machine.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : machine.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {machine.status}
              </span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Last ping: {new Date(machine.last_ping).toLocaleString()}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRestart(machine.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Restart"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleStatusChange(machine.id, 'maintenance')}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                  title="Maintenance"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleStatusChange(
                    machine.id,
                    machine.status === 'active' ? 'inactive' : 'active'
                  )}
                  className={`p-2 ${
                    machine.status === 'active'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                  } rounded-lg`}
                  title={machine.status === 'active' ? 'Shutdown' : 'Start'}
                >
                  <Power className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {!machines?.length && (
        <div className="col-span-full text-center py-12 text-gray-500">
          No machines found. Add a machine to get started.
        </div>
      )}
    </div>
  );
}