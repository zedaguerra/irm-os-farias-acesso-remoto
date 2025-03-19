import { createContext, useState, useContext, ReactNode } from 'react';
import type { QuantumThemeState, QuantumThemeContext, TemporalLayer } from '../../types/theme';

const defaultThemeState: QuantumThemeState = {
  base: 'cyberpunk',
  energyLevel: 0.7,
  temporalLayer: 'present',
  colors: {
    cyberBlue: '#00fff2',
    neonPink: '#ff00ff',
    quantumPurple: '#b042ff'
  }
};

const QuantumThemeContext = createContext<QuantumThemeContext>({
  ...defaultThemeState,
  warpTheme: () => {},
  setEnergyLevel: () => {}
});

export const useQuantumTheme = () => useContext(QuantumThemeContext);

interface QuantumThemeProviderProps {
  children: ReactNode;
}

export const QuantumThemeProvider = ({ children }: QuantumThemeProviderProps) => {
  const [theme, setTheme] = useState<QuantumThemeState>(defaultThemeState);

  const warpTheme = (temporalLayer: TemporalLayer) => {
    setTheme(prev => ({
      ...prev,
      temporalLayer,
      energyLevel: temporalLayer === 'future' ? 1.2 : temporalLayer === 'past' ? 0.5 : 0.7
    }));
  };

  const setEnergyLevel = (level: number) => {
    setTheme(prev => ({
      ...prev,
      energyLevel: Math.max(0, Math.min(1.5, level))
    }));
  };

  return (
    <QuantumThemeContext.Provider value={{ ...theme, warpTheme, setEnergyLevel }}>
      <div 
        className={`quantum-field-${theme.temporalLayer}`}
        style={{
          '--energy-level': theme.energyLevel,
          '--cyber-blue': theme.colors.cyberBlue,
          '--neon-pink': theme.colors.neonPink,
          '--quantum-purple': theme.colors.quantumPurple
        } as React.CSSProperties}
      >
        {children}
      </div>
    </QuantumThemeContext.Provider>
  );
};