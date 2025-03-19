import { QuantumPattern, NeuralState } from '../types/quantum';

export const quantumProcessor = {
  processPatterns: (
    patterns: QuantumPattern,
    energyPatterns: number[],
    neuralState: NeuralState
  ) => {
    const coherence = calculateCoherence(patterns.energySignature);
    const resonance = calculateResonance(energyPatterns);
    const temporalStability = 1 - Math.abs(neuralState.temporalDissonance);

    return {
      base: coherence > 0.7 ? 'holographic' : 'cyberpunk',
      quantumEntanglement: resonance,
      temporalLayer: determineTemporalLayer(temporalStability),
      energyLevel: calculateEnergyLevel(patterns, neuralState)
    };
  }
};

function calculateCoherence(energySignature: number[]): number {
  const sum = energySignature.reduce((acc, val) => acc + val, 0);
  const mean = sum / energySignature.length;
  const variance = energySignature.reduce(
    (acc, val) => acc + Math.pow(val - mean, 2),
    0
  ) / energySignature.length;
  
  return 1 / (1 + variance);
}

function calculateResonance(energyPatterns: number[]): number {
  if (energyPatterns.length === 0) return 0.5;
  
  const maxEnergy = Math.max(...energyPatterns);
  const minEnergy = Math.min(...energyPatterns);
  return (maxEnergy - minEnergy) / (maxEnergy + minEnergy);
}

function determineTemporalLayer(stability: number): 'past' | 'present' | 'future' {
  if (stability < 0.3) return 'past';
  if (stability > 0.7) return 'future';
  return 'present';
}

function calculateEnergyLevel(
  patterns: QuantumPattern,
  neuralState: NeuralState
): number {
  const baseEnergy = patterns.energySignature.reduce(
    (acc, val) => acc + val,
    0
  ) / patterns.energySignature.length;
  
  const temporalModifier = 1 + (neuralState.temporalBias - 0.5);
  return Math.max(0, Math.min(1.5, baseEnergy * temporalModifier));
}