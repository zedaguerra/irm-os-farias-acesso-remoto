import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Wand2 } from 'lucide-react';
import type { NeuralState } from '../../types/quantum';

interface AIFeedbackPanelProps {
  neuralState: NeuralState;
  onEnergyChange: (value: number) => void;
}

export const AIFeedbackPanel = ({ neuralState, onEnergyChange }: AIFeedbackPanelProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Brain className="w-5 h-5 text-purple-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">AI Quantum Analysis</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-black/40 rounded-lg p-4">
          <h4 className="text-purple-300 font-medium mb-2">Pattern Recognition</h4>
          <div className="grid grid-cols-5 gap-2">
            {neuralState.energyPatterns.slice(0, 5).map((value, i) => (
              <motion.div
                key={i}
                className="h-20 bg-purple-500/20 rounded"
                style={{ scaleY: value }}
                animate={{ scaleY: value }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            ))}
          </div>
        </div>

        <div className="bg-black/40 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-purple-300 font-medium">AI Suggestions</h4>
            <Wand2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-2">
            <button
              onClick={() => onEnergyChange(0.8)}
              className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-left text-sm text-purple-300"
            >
              Increase energy level to 80% for optimal stability
            </button>
            <button
              onClick={() => onEnergyChange(0.6)}
              className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-left text-sm text-purple-300"
            >
              Reduce energy to 60% to minimize temporal distortions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};