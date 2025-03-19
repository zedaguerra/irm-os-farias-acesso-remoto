export interface QuantumPattern {
  energySignature: number[];
  temporalDissonance: number;
  type: string;
}

export interface RealityState {
  temporalCoordinates: {
    x: number;
    y: number;
    z: number;
  };
  quantumState: {
    entanglement: number;
    coherence: number;
    energyLevel: number;
  };
  stabilityMetrics: {
    temporalIntegrity: number;
    realityConsistency: number;
    paradoxProbability: number;
  };
}

export interface DistortionParams {
  intensity: number;
  direction: {
    x: number;
    y: number;
    z: number;
  };
  target?: {
    temporalLayer?: string;
    energyLevel?: number;
    coherence?: number;
  };
}