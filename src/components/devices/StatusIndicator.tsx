import React from 'react';
import { Circle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'maintenance';
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const statusColors = {
    active: 'text-green-500',
    inactive: 'text-gray-400',
    maintenance: 'text-yellow-500'
  };

  const statusLabels = {
    active: 'Online',
    inactive: 'Offline',
    maintenance: 'Maintenance'
  };

  return (
    <div className="flex items-center">
      <Circle className={`h-3 w-3 mr-1.5 fill-current ${statusColors[status]}`} />
      <span className="text-sm text-gray-600">{statusLabels[status]}</span>
    </div>
  );
}