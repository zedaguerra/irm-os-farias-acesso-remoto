import React, { useState } from 'react';
import { useQuantumAI } from '../../lib/quantum-ai';
import { useQuantumTheme } from '../theme/QuantumThemeProvider';
import { TemporalNavigator } from './TemporalNavigator';
import { QuantumWaveVisualizer } from './QuantumWaveVisualizer';
import { HoloSlider } from './HoloSlider';
import { motion } from 'framer-motion';

export const QuantumControlPanel = () => {
  const { neuralState, mutateReality } = useQuantumAI();
  const { energyLevel, setEnergyLevel } = useQuantumTheme();
  const [entanglementLevel, setEntanglement] = useState(0.7);

  const handleEntanglementChange = async (value: number) => {
    setEntanglement(value);
    try {
      await mutateReality('entanglement_adjust');
    } catch (error) {
      console.error('Failed to adjust entanglement:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/20 backdrop-blur-lg rounded-xl border border-cyan-500/20 p-6"
    >
      <h2 className="text-xl font-bold text-white cyber-text mb-6">
        Quantum Control Interface
      </h2>

      <div className="space-y-6">
        <div>
          <HoloSlider
            label="Quantum Entanglement"
            value={entanglementLevel}
            onChange={handleEntanglementChange}
            min={0}
            max={1}
            step={0.01}
          />
          <p className="text-sm text-cyan-300/60 mt-1">
            Current Coherence: {(neuralState.temporalBias * 100).toFixed(1)}%
          </p>
        </div>

        <div>
          <HoloSlider
            label="Energy Level"
            value={energyLevel}
            onChange={setEnergyLevel}
            min={0}
            max={1.5}
            step={0.01}
          />
          <p className="text-sm text-cyan-300/60 mt-1">
            System Stability: {((1 - neuralState.temporalDissonance) * 100).toFixed(1)}%
          </p>
        </div>

        <TemporalNavigator />

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Quantum Wave Patterns
          </h3>
          <QuantumWaveVisualizer
            patterns={neuralState.energyPatterns}
            coherence={1 - neuralState.temporalDissonance}
          />
        </div>
      </div>
    </motion.div>
  );
};