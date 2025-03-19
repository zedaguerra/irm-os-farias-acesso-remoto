import { createContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'cyberpunk' | 'holographic';
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'cyberpunk',
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<'cyberpunk' | 'holographic'>('cyberpunk');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'cyberpunk' ? 'holographic' : 'cyberpunk');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-theme={theme} className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};