import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TemporalLayer } from '../../types/theme';

interface TemporalRiftEffectProps {
  layer: TemporalLayer;
  intensity: number;
}

export const TemporalRiftEffect = ({ layer, intensity }: TemporalRiftEffectProps) => {
  const mesh = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(20, 4);
    const pos = geo.attributes.position;
    const vertices = [];
    
    for (let i = 0; i < pos.count; i++) {
      vertices.push(
        pos.getX(i) + (Math.random() - 0.5) * 2,
        pos.getY(i) + (Math.random() - 0.5) * 2,
        pos.getZ(i) + (Math.random() - 0.5) * 2
      );
    }
    
    return new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
  }, []);

  const material = useMemo(() => {
    const colors = {
      past: new THREE.Color(0x2244ff),
      present: new THREE.Color(0x00ffff),
      future: new THREE.Color(0xff44ff)
    };

    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: colors[layer] },
        intensity: { value: intensity }
      },
      vertexShader: `
        uniform float time;
        uniform float intensity;
        
        void main() {
          vec3 pos = position;
          pos.x += sin(time * 2.0 + position.z) * intensity;
          pos.y += cos(time * 2.0 + position.x) * intensity;
          pos.z += sin(time * 2.0 + position.y) * intensity;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float intensity;
        
        void main() {
          gl_FragColor = vec4(color, 0.5 * intensity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      wireframe: true
    });
  }, [layer, intensity]);

  useFrame((state) => {
    if (!mesh.current) return;
    material.uniforms.time.value = state.clock.getElapsedTime();
    mesh.current.rotation.x += 0.001 * intensity;
    mesh.current.rotation.y += 0.002 * intensity;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
};