import { useEffect, useCallback } from 'react';
import { QuantumPattern } from '../types/quantum';

export const useBrainwaveInterface = (
  onPatternDetected: (patterns: QuantumPattern) => void
) => {
  const processPatterns = useCallback((rawData: number[]) => {
    // Convert raw brainwave data into quantum patterns
    const energySignature = rawData.map(value => value * 100);
    const temporalDissonance = Math.abs(
      energySignature.reduce((acc, val) => acc + val, 0) / energySignature.length
    );

    const pattern: QuantumPattern = {
      energySignature,
      temporalDissonance,
      type: 'brainwave'
    };

    onPatternDetected(pattern);
  }, [onPatternDetected]);

  useEffect(() => {
    // Simulate brainwave detection with random data
    const interval = setInterval(() => {
      const rawData = Array.from(
        { length: 8 },
        () => Math.random()
      );
      processPatterns(rawData);
    }, 1000);

    return () => clearInterval(interval);
  }, [processPatterns]);
};