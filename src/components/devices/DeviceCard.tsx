import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Power, RefreshCw, ChevronRight } from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';
import { RealtimeMetrics } from '../metrics/RealtimeMetrics';
import type { Machine } from '../../types/database';
import { format } from 'date-fns';

interface DeviceCardProps {
  device: Machine;
}

export function DeviceCard({ device }: DeviceCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  const handleRestart = async () => {
    // Implement device restart logic
  };

  const handlePower = async () => {
    // Implement power toggle logic
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Monitor className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
              <StatusIndicator status={device.status} />
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight
              className={`h-5 w-5 text-gray-400 transition-transform ${
                expanded ? 'rotate-90' : ''
              }`}
            />
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <p>Last Active: {format(new Date(device.last_ping), 'PPp')}</p>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleRestart}
            className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart
          </button>
          <button
            onClick={handlePower}
            className="flex items-center px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Power className="h-4 w-4 mr-2" />
            Power
          </button>
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t"
          >
            <RealtimeMetrics deviceId={device.id} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}