import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Activity, Clock, Filter, Download, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ActivityLogProps {
  deviceId: string;
}

export function ActivityLog({ deviceId }: ActivityLogProps) {
  const [filter, setFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['device-logs', deviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machine_logs')
        .select('*')
        .eq('machine_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  const filteredLogs = logs?.filter(log => {
    if (filter !== 'all' && log.action !== filter) return false;
    if (searchQuery && !log.details.message?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleExport = () => {
    if (!filteredLogs?.length) return;

    const csvContent = [
      ['Timestamp', 'Action', 'Details'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.action,
        JSON.stringify(log.details)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `device-logs-${deviceId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Logs exported successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Activity Log</h2>
          <button
            onClick={handleExport}
            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="restart">Restart</option>
            <option value="update">Update</option>
            <option value="power">Power</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredLogs?.map((log) => (
            <div
              key={log.id}
              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {log.details.message}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{format(new Date(log.created_at), 'PPp')}</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{log.action}</span>
                </div>
              </div>
            </div>
          ))}

          {!filteredLogs?.length && (
            <div className="text-center py-8 text-gray-500">
              No activity logs found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}