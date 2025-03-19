import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HoloPanelProps {
  children: ReactNode;
  className?: string;
}

export const HoloPanel = ({ children, className = '' }: HoloPanelProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`relative bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-lg rounded-xl border border-cyan-500/20 p-6 shadow-2xl shadow-cyan-500/10 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/5 to-purple-500/5 rounded-xl pointer-events-none" />
    <div className="relative z-10">
      {children}
    </div>
  </motion.div>
);