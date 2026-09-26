'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Environment, MeshTransmissionMaterial, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { createNoise3D } from 'simplex-noise';

/* ============================================================
   C — EDITORIAL SCULPTURE (Tarifs)
   - Une seule sculpture statement piece
   - MeshTransmissionMaterial drei (verre chrome refraction)
   - Vertex displacement par simplex noise (organique)
   - HDRI studio cinema, ambient particles tres legers
   - Bloom subtil + Vignette + Noise
   ============================================================ */

function MorphingSculpture() {
  const meshRef = useRef<THREE.Mesh>(null);
  const noise3D = useMemo(() => createNoise3D(), []);

  // Pre-compute base geometry & store original positions
  const { geometry, originalPositions } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.4, 32);
    const pos = geo.attributes.position;
    const orig = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count * 3; i++) orig[i] = (pos.array as Float32Array)[i];
    return { geometry: geo, originalPositions: orig };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * 0.25;
    const pos = geometry.attributes.position;
    const arr = pos.array as Float32Array;
    const FREQ = 1.2;
    const AMP = 0.18;

    for (let i = 0; i < pos.count; i++) {
      const ox = originalPositions[i * 3];
      const oy = originalPositions[i * 3 + 1];
      const oz = originalPositions[i * 3 + 2];

      const n = noise3D(ox * FREQ + t, oy * FREQ + t * 0.7, oz * FREQ - t * 0.3);
      const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
      const factor = 1 + n * AMP;
      arr[i * 3]     = (ox / len) * len * factor;
      arr[i * 3 + 1] = (oy / len) * len * factor;
      arr[i * 3 + 2] = (oz / len) * len * factor;
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();

    meshRef.current.rotation.x = state.clock.elapsedTime * 0.08;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.12;
  });

  return (
    <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={meshRef} geometry={geometry}>
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.3}
          thickness={0.5}
          chromaticAberration={0.4}
          anisotropy={0.6}
          distortion={0.3}
          distortionScale={0.4}
          temporalDistortion={0.15}
          ior={1.4}
          color="#D4ECEF"
          roughness={0.05}
          transmission={1}
          attenuationDistance={1.2}
          attenuationColor="#5AD4B6"
          envMapIntensity={1.5}
        />
      </mesh>
    </Float>
  );
}

function GlowAura() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const s = 2.4 + Math.sin(t * 0.6) * 0.15;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        color="#5AD4B6"
        transparent
        opacity={0.05}
        side={THREE.BackSide}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function AmbientParticles() {
  const COUNT = 200;
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.05;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <points ref={ref}>
      <primitive object={geo} attach="geometry" />
      <pointsMaterial
        size={0.02}
        color="#5AD4B6"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        depthWrite={false}
      />
    </points>
  );
}

export default function EditorialSculpture() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#FFFFFF" />
        <directionalLight position={[-3, -2, -3]} intensity={0.8} color="#5AD4B6" />
        <pointLight position={[0, 3, 2]} intensity={0.6} color="#D4ECEF" />

        <GlowAura />
        <MorphingSculpture />
        <AmbientParticles />

        <Environment preset="studio" background={false} environmentIntensity={1.4} />

        <EffectComposer multisampling={4}>
          <Bloom
            intensity={0.7}
            kernelSize={KernelSize.LARGE}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.7}
            mipmapBlur
          />
          <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
          <Vignette darkness={0.5} offset={0.3} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
