import React, { useEffect, useRef } from 'react';

interface QuantumWaveVisualizerProps {
  patterns: number[];
  coherence: number;
}

export const QuantumWaveVisualizer = ({
  patterns,
  coherence
}: QuantumWaveVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw wave pattern
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      
      for (let x = 0; x < canvas.width; x++) {
        const patternIndex = Math.floor((x / canvas.width) * patterns.length);
        const value = patterns[patternIndex] || 0;
        
        const y = (canvas.height / 2) + 
          Math.sin(x * 0.05 + Date.now() * 0.002) * 
          value * 30 * coherence;
        
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `rgba(0, 255, 255, ${coherence})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      requestAnimationFrame(animate);
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    animate();

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [patterns, coherence]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-lg bg-black/40"
    />
  );
};