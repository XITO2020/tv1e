'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Environment, MarchingCubes, MarchingCube } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

/* ============================================================
   A — LIQUID CHROME (Parcours) — VRAI mercure liquide
   - MarchingCubes drei : 6 metaballs qui orbitent et fusionnent
   - Effet mercure : surface liquide qui se decompose et se recompose
   - meshPhysicalMaterial chrome iridescent metalness 1
   - Caustics + fog + bloom + chromatic aberration
   ============================================================ */

interface BallParams {
  radius: number;
  speed: number;
  offset: number;
  axisA: THREE.Vector3;
  axisB: THREE.Vector3;
  strength: number;
}

function MetaballField() {
  const groupRef = useRef<THREE.Group>(null);
  const balls = useMemo<BallParams[]>(() => {
    const arr: BallParams[] = [];
    for (let i = 0; i < 6; i++) {
      arr.push({
        radius: 0.3 + Math.random() * 0.45,
        speed: 0.3 + Math.random() * 0.4,
        offset: (i / 6) * Math.PI * 2 + Math.random() * 0.3,
        axisA: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        axisB: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        strength: 0.55 + Math.random() * 0.2,
      });
    }
    return arr;
  }, []);

  const ballRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    balls.forEach((b, i) => {
      const ref = ballRefs.current[i];
      if (!ref) return;
      const angleA = t * b.speed + b.offset;
      const angleB = t * b.speed * 0.5;
      const pos = new THREE.Vector3(
        Math.cos(angleA) * b.radius,
        Math.sin(angleB) * b.radius,
        Math.sin(angleA * 0.7) * b.radius
      );
      const rotMat = new THREE.Matrix4().makeRotationAxis(b.axisA, t * 0.15);
      pos.applyMatrix4(rotMat);
      ref.position.copy(pos);
    });

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      <MarchingCubes
        resolution={64}
        maxPolyCount={20000}
        enableUvs={false}
        enableColors={false}
        scale={2}
      >
        {balls.map((b, i) => (
          <group key={i} ref={(el) => { if (el) ballRefs.current[i] = el; }}>
            <MarchingCube strength={b.strength} subtract={6} color={new THREE.Color(0xffffff)} />
          </group>
        ))}
        <meshPhysicalMaterial
          color="#0F1A1F"
          metalness={1}
          roughness={0.04}
          clearcoat={1}
          clearcoatRoughness={0.02}
          iridescence={1}
          iridescenceIOR={1.55}
          iridescenceThicknessRange={[100, 1200]}
          envMapIntensity={2.4}
          reflectivity={1}
        />
      </MarchingCubes>
    </group>
  );
}

function FogVolume() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.04;
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.07 + Math.sin(t * 0.4) * 0.02;
  });
  return (
    <mesh ref={ref} position={[0, 0, -3]}>
      <sphereGeometry args={[6, 32, 32]} />
      <meshBasicMaterial
        color="#1a5e63"
        transparent
        opacity={0.08}
        side={THREE.BackSide}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function CausticBeams() {
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const m = mesh.material as THREE.MeshBasicMaterial;
      m.opacity = 0.04 + Math.sin(t * 0.6 + i * 1.5) * 0.02;
    });
  });
  return (
    <>
      {[
        { rot: [0.4, 0.3, 0.5], pos: [-2, 0.5, -2], color: '#5AD4B6' },
        { rot: [-0.3, -0.4, -0.6], pos: [2, -0.5, -3], color: '#D4ECEF' },
        { rot: [0.6, -0.2, 0.3], pos: [0, 1, -2], color: '#1a5e63' },
      ].map((b, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) refs.current[i] = el; }}
          rotation={b.rot as [number, number, number]}
          position={b.pos as [number, number, number]}
        >
          <cylinderGeometry args={[0.15, 0.05, 12, 16, 1, true]} />
          <meshBasicMaterial
            color={b.color}
            transparent
            opacity={0.05}
            side={THREE.DoubleSide}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

function FloatingMotes() {
  const COUNT = 400;
  const ref = useRef<THREE.Points>(null);
  const velRef = useRef<Float32Array>(new Float32Array(COUNT * 3));

  const geo = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const v = velRef.current;
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      v[i * 3]     = (Math.random() - 0.5) * 0.05;
      v[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      v[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const positions = geo.attributes.position.array as Float32Array;
    const v = velRef.current;
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     += v[i * 3]     * delta * 8;
      positions[i * 3 + 1] += v[i * 3 + 1] * delta * 8;
      positions[i * 3 + 2] += v[i * 3 + 2] * delta * 8;
      if (Math.abs(positions[i * 3]) > 6) v[i * 3] *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 5) v[i * 3 + 1] *= -1;
      if (Math.abs(positions[i * 3 + 2] + 1) > 4) v[i * 3 + 2] *= -1;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <primitive object={geo} attach="geometry" />
      <pointsMaterial
        size={0.025}
        color="#D4ECEF"
        transparent
        opacity={0.55}
        sizeAttenuation
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function LiquidChrome() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.5], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <fog attach="fog" args={['#0F1A1F', 5, 18]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#FFFFFF" />
        <directionalLight position={[-4, -2, -3]} intensity={0.7} color="#5AD4B6" />
        <pointLight position={[0, 3, 2]} intensity={0.7} color="#D4ECEF" />
        <pointLight position={[3, -3, 1]} intensity={0.4} color="#1a5e63" />

        <FogVolume />
        <CausticBeams />
        <MetaballField />
        <FloatingMotes />

        <Environment preset="warehouse" background={false} environmentIntensity={1.6} />

        <EffectComposer multisampling={4}>
          <Bloom
            intensity={1}
            kernelSize={KernelSize.LARGE}
            luminanceThreshold={0.18}
            luminanceSmoothing={0.7}
            mipmapBlur
          />
          <ChromaticAberration offset={[0.0008, 0.0008] as any} radialModulation modulationOffset={0.6} />
          <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
          <Vignette darkness={0.65} offset={0.18} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
