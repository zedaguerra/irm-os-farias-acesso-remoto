import React from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

interface DimensionalControlsProps {
  onDistort: (params: { x: number; y: number; z: number }) => void;
  stability: number;
}

export const DimensionalControls = ({ onDistort, stability }: DimensionalControlsProps) => {
  const handleAxisChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const params = { x: 0, y: 0, z: 0 };
    params[axis] = value;
    onDistort(params);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Compass className="w-5 h-5 text-cyan-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">Dimensional Controls</h3>
      </div>

      {['x', 'y', 'z'].map((axis) => (
        <div key={axis} className="space-y-2">
          <label className="flex items-center justify-between text-sm">
            <span className="text-cyan-300">Axis {axis.toUpperCase()}</span>
            <span className="text-gray-400">Stability Impact: {(stability * 100).toFixed(1)}%</span>
          </label>
          <div className="relative">
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              defaultValue="0"
              onChange={(e) => handleAxisChange(axis as 'x' | 'y' | 'z', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <motion.div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-cyan-500/20 rounded text-cyan-300 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {axis.toUpperCase()} Axis
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
};