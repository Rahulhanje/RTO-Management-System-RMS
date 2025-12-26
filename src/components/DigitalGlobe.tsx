import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const GlobePoints = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const globeRef = useRef<THREE.Mesh>(null);
  
  // Create points on the globe surface
  const particles = useMemo(() => {
    const points = [];
    const numPoints = 2000;
    
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      
      const x = Math.cos(theta) * Math.sin(phi) * 2;
      const y = Math.sin(theta) * Math.sin(phi) * 2;
      const z = Math.cos(phi) * 2;
      
      points.push(x, y, z);
    }
    
    return new Float32Array(points);
  }, []);

  // Create connection lines
  const lines = useMemo(() => {
    const linePositions = [];
    const numLines = 50;
    
    for (let i = 0; i < numLines; i++) {
      // Random start point on sphere
      const phi1 = Math.random() * Math.PI * 2;
      const theta1 = Math.random() * Math.PI;
      const x1 = Math.cos(phi1) * Math.sin(theta1) * 2;
      const y1 = Math.sin(phi1) * Math.sin(theta1) * 2;
      const z1 = Math.cos(theta1) * 2;
      
      // Random end point on sphere
      const phi2 = Math.random() * Math.PI * 2;
      const theta2 = Math.random() * Math.PI;
      const x2 = Math.cos(phi2) * Math.sin(theta2) * 2;
      const y2 = Math.sin(phi2) * Math.sin(theta2) * 2;
      const z2 = Math.cos(theta2) * 2;
      
      linePositions.push(x1, y1, z1, x2, y2, z2);
    }
    
    return new Float32Array(linePositions);
  }, []);

  // Outer network nodes
  const outerNodes = useMemo(() => {
    const nodes = [];
    const numNodes = 100;
    
    for (let i = 0; i < numNodes; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 2.5 + Math.random() * 0.8;
      
      const x = Math.cos(phi) * Math.sin(theta) * radius;
      const y = Math.sin(phi) * Math.sin(theta) * radius;
      const z = Math.cos(theta) * radius;
      
      nodes.push(x, y, z);
    }
    
    return new Float32Array(nodes);
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002;
    }
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Main globe wireframe */}
      <Sphere ref={globeRef} args={[2, 32, 32]}>
        <meshBasicMaterial
          color="#00d4ff"
          wireframe
          transparent
          opacity={0.15}
        />
      </Sphere>
      
      {/* Inner glow sphere */}
      <Sphere args={[1.95, 32, 32]}>
        <meshBasicMaterial
          color="#0066ff"
          transparent
          opacity={0.1}
        />
      </Sphere>

      {/* Surface points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#00d4ff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Connection lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={lines.length / 3}
            array={lines}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#0099ff"
          transparent
          opacity={0.3}
        />
      </lineSegments>

      {/* Outer network nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={outerNodes.length / 3}
            array={outerNodes}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#00ffff"
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

const DigitalGlobe: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[500px]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <GlobePoints />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

export default DigitalGlobe;
