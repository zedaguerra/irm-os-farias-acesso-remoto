import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuantumAI } from '../../hooks/useQuantumAI';
import { RealityDistortionEngine } from '../../lib/RealityDistortionEngine';
import { QuantumFieldSimulator } from './QuantumFieldSimulator';
import { DimensionalControls } from './DimensionalControls';
import { AIFeedbackPanel } from './AIFeedbackPanel';
import { Shield, Zap, Activity } from 'lucide-react';

const distortionEngine = new RealityDistortionEngine();

export const RealityManipulator = () => {
  const { neuralState, mutateReality } = useQuantumAI();
  const [stability, setStability] = useState(1);
  const [energyLevel, setEnergyLevel] = useState(0.7);

  useEffect(() => {
    const interval = setInterval(() => {
      setStability(prev => {
        const fluctuation = (Math.random() - 0.5) * 0.1;
        return Math.max(0, Math.min(1, prev + fluctuation));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDistortion = async (params: { x: number; y: number; z: number }) => {
    try {
      const result = await distortionEngine.distortReality({
        intensity: energyLevel,
        direction: params
      });

      setStability(result.stabilityMetrics.temporalIntegrity);
      await mutateReality('reality_shift');
    } catch (error) {
      console.error('Reality distortion failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-black/30 backdrop-blur-lg rounded-xl border border-cyan-500/20 p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white cyber-text">
          Reality Manipulation Interface
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-cyan-400 mr-2" />
            <span className="text-cyan-300">
              Stability: {(stability * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-yellow-300">
              Energy: {(energyLevel * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <QuantumFieldSimulator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DimensionalControls
          onDistort={handleDistortion}
          stability={stability}
        />
        <AIFeedbackPanel
          neuralState={neuralState}
          onEnergyChange={setEnergyLevel}
        />
      </div>

      <div className="mt-4 p-4 bg-black/40 rounded-lg">
        <div className="flex items-center mb-2">
          <Activity className="w-5 h-5 text-purple-400 mr-2" />
          <span className="text-purple-300 font-semibold">System Status</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Temporal Coherence</p>
            <p className="text-cyan-300">{(neuralState.temporalBias * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-400">Reality Anchors</p>
            <p className="text-cyan-300">{neuralState.energyPatterns.length} active</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};