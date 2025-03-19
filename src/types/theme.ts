export type TemporalLayer = 'past' | 'present' | 'future';

export interface QuantumThemeState {
  base: 'cyberpunk' | 'holographic';
  energyLevel: number;
  temporalLayer: TemporalLayer;
  colors: {
    cyberBlue: string;
    neonPink: string;
    quantumPurple: string;
  };
}

export interface QuantumThemeContext extends QuantumThemeState {
  warpTheme: (temporalLayer: TemporalLayer) => void;
  setEnergyLevel: (level: number) => void;
}