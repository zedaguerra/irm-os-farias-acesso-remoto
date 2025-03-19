import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useQuantumTheme } from '../theme/QuantumThemeProvider';
import { QuantumParticles } from './QuantumParticles';
import { TemporalRiftEffect } from './TemporalRiftEffect';
import { motion } from 'framer-motion';

export const QuantumFieldSimulator = () => {
  const { temporalLayer, energyLevel } = useQuantumTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div 
      ref={containerRef}
      className="w-full h-[400px] rounded-xl overflow-hidden relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Canvas
        camera={{ position: [0, 0, 50], fov: 75 }}
        dpr={window.devicePixelRatio}
      >
        <color attach="background" args={['#000']} />
        <fog attach="fog" args={['#000', 50, 190]} />
        
        <QuantumParticles
          count={5000}
          energyLevel={energyLevel}
        />
        
        <TemporalRiftEffect
          layer={temporalLayer}
          intensity={energyLevel}
        />

        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
      </Canvas>

      <div className="absolute bottom-4 left-4 text-sm text-cyan-300 bg-black/50 px-3 py-1 rounded-full">
        Energy Level: {energyLevel.toFixed(2)}
      </div>
      
      <div className="absolute bottom-4 right-4 text-sm text-cyan-300 bg-black/50 px-3 py-1 rounded-full">
        Temporal Layer: {temporalLayer}
      </div>
    </motion.div>
  );
};