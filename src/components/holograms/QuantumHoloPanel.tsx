import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useQuantumTheme } from '../theme/QuantumThemeProvider';
import { ParticleField } from './ParticleField';

interface QuantumHoloPanelProps {
  children: ReactNode;
  className?: string;
}

export const QuantumHoloPanel = ({ children, className = '' }: QuantumHoloPanelProps) => {
  const { energyLevel, colors } = useQuantumTheme();
  
  return (
    <motion.div 
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br"
        animate={{
          background: [
            `linear-gradient(45deg, ${colors.cyberBlue}40 0%, ${colors.neonPink}40 100%)`,
            `linear-gradient(135deg, ${colors.neonPink}40 0%, ${colors.quantumPurple}40 100%)`
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <div className="absolute inset-0 backdrop-blur-sm" />
      
      <ParticleField density={energyLevel * 100} />
      
      <div className="relative z-10 p-6 rounded-xl border border-white/10 bg-black/20">
        <div className="quantum-interference-pattern" />
        {children}
      </div>
    </motion.div>
  );
};