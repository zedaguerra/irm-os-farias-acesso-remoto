import React from 'react';
import { motion } from 'framer-motion';

interface HoloSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

export const HoloSlider = ({
  label,
  value,
  onChange,
  min,
  max,
  step
}: HoloSliderProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {label}
      </label>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <motion.div
          className="absolute left-0 top-0 h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg pointer-events-none"
          style={{ width: `${(value - min) / (max - min) * 100}%` }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        <span>{value.toFixed(2)}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};