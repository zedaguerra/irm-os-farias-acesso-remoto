import React from 'react';
import { useQuantumTheme } from '../theme/QuantumThemeProvider';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const TemporalNavigator = () => {
  const { temporalLayer, warpTheme } = useQuantumTheme();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        Temporal Navigation
      </label>
      <div className="flex space-x-2">
        {(['past', 'present', 'future'] as const).map((layer) => (
          <motion.button
            key={layer}
            onClick={() => warpTheme(layer)}
            className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
              temporalLayer === layer
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-gray-800/50 text-gray-400'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Clock className="w-4 h-4" />
            <span className="capitalize">{layer}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};