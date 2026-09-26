'use client';

import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

/* ============================================================
   B — CYBERTUNNEL (Index) — Tron Refined
   - Tunnel grille volumetrique infinie qui defile
   - 5000 particules GPU instanced flowing
   - Filaments lumineux mint/volt
   - Scanlines fines en post-process via DOM overlay
   - Bloom intense + Chromatic Aberration + Noise
   ============================================================ */

function TunnelGrid() {
  const gridRef = useRef<THREE.Group>(null);
  const SEGMENTS = 24;
  const SPACING = 4;

  useFrame((_, delta) => {
    if (!gridRef.current) return;
    gridRef.current.position.z += delta * 6;
    if (gridRef.current.position.z > SPACING) {
      gridRef.current.position.z = 0;
    }
  });

  const lines = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: [number, number, number]; size: number; color: string }[] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const z = -i * SPACING;
      // 4 sides square per segment
      const half = 8;
      arr.push({ pos: [0, -half, z], rot: [0, 0, 0], size: half * 2, color: '#1a5e63' });
      arr.push({ pos: [0,  half, z], rot: [0, 0, 0], size: half * 2, color: '#1a5e63' });
      arr.push({ pos: [-half, 0, z], rot: [0, 0, Math.PI / 2], size: half * 2, color: '#1a5e63' });
      arr.push({ pos: [ half, 0, z], rot: [0, 0, Math.PI / 2], size: half * 2, color: '#1a5e63' });
    }
    return arr;
  }, []);

  return (
    <group ref={gridRef}>
      {lines.map((l, i) => (
        <mesh key={i} position={l.pos} rotation={l.rot}>
          <boxGeometry args={[l.size, 0.015, 0.015]} />
          <meshBasicMaterial color={l.color} />
        </mesh>
      ))}
    </group>
  );
}

/* Armillary sphere — 3 anneaux chrome metalliques meme taille,
   rotation sur axes X / Y / Z monde via groups parents.
   Aspect structure futuriste de controle du voyage dans le temps. */
function ArmillaryRings() {
  // Group parents = axes rotation monde
  const groupX = useRef<THREE.Group>(null);
  const groupY = useRef<THREE.Group>(null);
  const groupZ = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupX.current) groupX.current.rotation.x += delta * 0.32;
    if (groupY.current) groupY.current.rotation.y += delta * 0.42;
    if (groupZ.current) groupZ.current.rotation.z += delta * 0.26;
  });

  const RADIUS = 7;
  const TUBE = 0.22;

  // Tilt subtil du parent pour qu'aucun ring ne soit edge-on de la camera
  return (
    <group position={[0, 0, -14]} rotation={[0.22, 0.32, 0.1]}>
      {/* Group X — rotates on X world axis. Torus dans plan XY (axe normal Z) */}
      <group ref={groupX}>
        <mesh>
          <torusGeometry args={[RADIUS, TUBE, 24, 196]} />
          <meshPhysicalMaterial
            color="#1A1F26"
            metalness={0.85}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={2}
            emissive="#CCFF00"
            emissiveIntensity={1.6}
            toneMapped={false}
            iridescence={0.4}
            iridescenceIOR={1.4}
          />
        </mesh>
      </group>

      {/* Group Y — rotates on Y world axis. Torus dans plan YZ (axe normal X) */}
      <group ref={groupY}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[RADIUS, TUBE, 24, 196]} />
          <meshPhysicalMaterial
            color="#1A1F26"
            metalness={0.85}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={2}
            emissive="#39FF14"
            emissiveIntensity={1.8}
            toneMapped={false}
            iridescence={0.5}
            iridescenceIOR={1.4}
          />
        </mesh>
      </group>

      {/* Group Z — rotates on Z world axis. Torus dans plan XZ (axe normal Y) */}
      <group ref={groupZ}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[RADIUS, TUBE, 24, 196]} />
          <meshPhysicalMaterial
            color="#1A1F26"
            metalness={0.85}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.06}
            envMapIntensity={2}
            emissive="#00FFE5"
            emissiveIntensity={2}
            toneMapped={false}
            iridescence={0.6}
            iridescenceIOR={1.45}
          />
        </mesh>
      </group>
    </group>
  );
}

/* CenterDataFabric — recreation de la premiere animation complexe :
   torus knot iridescent + 16 nodes data orbitaux + lignes algorithmiques
   knot->nodes (fade pulsant) + sparkles aux extremites + glow eblouissant.
   Place au centre des anneaux armillaires (z=-14). */
function CenterDataFabric() {
  const NODE_COUNT = 16;
  const SCALE = 1.485; // 0.55 × 2.7

  const knotRef = useRef<THREE.Mesh>(null);
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const lineRef = useRef<THREE.LineSegments>(null);
  const sparklesRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const nodes = useMemo(() => {
    const arr: {
      radius: number;
      speed: number;
      offset: number;
      axis: THREE.Vector3;
      color: string;
      position: THREE.Vector3;
    }[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      arr.push({
        radius: 1.7 + Math.random() * 1.4,
        speed: 0.18 + Math.random() * 0.45,
        offset: Math.random() * Math.PI * 2,
        axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        // Palette fluo : volt acid / vert neon / turquoise neon
        color: i % 3 === 0 ? '#CCFF00' : i % 3 === 1 ? '#39FF14' : '#00FFE5',
        position: new THREE.Vector3(),
      });
    }
    return arr;
  }, []);

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NODE_COUNT * 6), 3));
    return g;
  }, []);

  const sparklesGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NODE_COUNT * 3), 3));
    return g;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Rotate the knot
    if (knotRef.current) {
      knotRef.current.rotation.x += delta * 0.4;
      knotRef.current.rotation.y += delta * 0.3;
    }

    // Pulse the glow halo
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 1.4) * 0.12;
      glowRef.current.scale.setScalar(s);
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.45 + Math.sin(t * 1.4) * 0.2;
    }

    // Update node orbital positions
    nodes.forEach((n, i) => {
      const angle = t * n.speed + n.offset;
      const base = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).multiplyScalar(n.radius);
      const rotMatrix = new THREE.Matrix4().makeRotationAxis(n.axis, t * 0.12);
      base.applyMatrix4(rotMatrix);
      n.position.copy(base);

      const mesh = meshRefs.current[i];
      if (mesh) {
        mesh.position.copy(n.position);
        const scale = 0.7 + Math.sin(t * 2 + n.offset) * 0.4;
        mesh.scale.setScalar(scale * 0.07);
      }
    });

    // Lines knot center -> each node, pulsing visibility
    if (lineRef.current) {
      const positions = lineGeo.attributes.position.array as Float32Array;
      nodes.forEach((n, i) => {
        const fade = Math.max(0, Math.sin(t * 0.8 + i * 0.4));
        positions[i * 6]     = 0;
        positions[i * 6 + 1] = 0;
        positions[i * 6 + 2] = 0;
        positions[i * 6 + 3] = n.position.x * fade;
        positions[i * 6 + 4] = n.position.y * fade;
        positions[i * 6 + 5] = n.position.z * fade;
      });
      lineGeo.attributes.position.needsUpdate = true;
    }

    // Sparkles at node tips
    if (sparklesRef.current) {
      const positions = sparklesGeo.attributes.position.array as Float32Array;
      nodes.forEach((n, i) => {
        positions[i * 3]     = n.position.x;
        positions[i * 3 + 1] = n.position.y;
        positions[i * 3 + 2] = n.position.z;
      });
      sparklesGeo.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, -14]} scale={SCALE}>
      {/* Glow halo eblouissant (additive) */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial
          color="#CCFF00"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Torus knot central iridescent */}
      <mesh ref={knotRef}>
        <torusKnotGeometry args={[1, 0.32, 220, 32, 2, 3]} />
        <meshPhysicalMaterial
          color="#0A0A0C"
          metalness={1}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.8}
          iridescence={1}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[100, 1000]}
          emissive="#00FFE5"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>

      {/* 16 data nodes orbitaux */}
      {nodes.map((n, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) meshRefs.current[i] = el; }}
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={n.color}
            emissive={n.color}
            emissiveIntensity={5}
            roughness={0.15}
            metalness={0.4}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Lignes algorithmiques knot center -> chaque node */}
      <lineSegments ref={lineRef}>
        <primitive object={lineGeo} attach="geometry" />
        <lineBasicMaterial color="#39FF14" transparent opacity={0.85} toneMapped={false} />
      </lineSegments>

      {/* Sparkles eblouissants au bout des traits */}
      <points ref={sparklesRef}>
        <primitive object={sparklesGeo} attach="geometry" />
        <pointsMaterial
          size={0.4}
          color="#CCFF00"
          transparent
          opacity={1}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

function FlowingParticles({ count = 5000 }: { count?: number }) {
  const COUNT = count;
  const ref = useRef<THREE.Points>(null);
  const speedsRef = useRef<Float32Array>(new Float32Array(COUNT));

  const geo = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const v = speedsRef.current;
    const cVolt = new THREE.Color('#D4FF00');
    const cMint = new THREE.Color('#49DE8A');
    const cTeal = new THREE.Color('#1a5e63');

    for (let i = 0; i < COUNT; i++) {
      // Distribute in a tunnel volume
      const r = 1 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3]     = Math.cos(theta) * r;
      positions[i * 3 + 1] = Math.sin(theta) * r;
      positions[i * 3 + 2] = -Math.random() * 80;

      v[i] = 4 + Math.random() * 12;

      const choice = Math.random();
      const c = choice < 0.5 ? cVolt : choice < 0.85 ? cMint : cTeal;
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const positions = geo.attributes.position.array as Float32Array;
    const v = speedsRef.current;
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3 + 2] += v[i] * delta;
      if (positions[i * 3 + 2] > 5) {
        positions[i * 3 + 2] = -80;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <primitive object={geo} attach="geometry" />
      <pointsMaterial
        size={0.04}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}

function CameraShake() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.4) * 0.08;
    state.camera.position.y = Math.cos(t * 0.5) * 0.08;
    state.camera.lookAt(0, 0, -10);
  });
  return null;
}

export default function CyberTunnel() {
  const host = useRef<HTMLDivElement>(null);
  // Mobile (14/09/2026) : dpr 1 (au lieu de 2 = 4x moins de pixels), 4x moins
  // de particules, pas de post-processing (Bloom + aberration + bruit saturent
  // le GPU telephone). Detection au 1er rendu client (ssr:false).
  const [lite] = useState(
    () => typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window)
  );
  // Boucle de rendu COUPEE des que le hero sort de l'ecran : sinon ce canvas
  // continue de tourner sous la galaxie = deux pipelines WebGL en parallele.
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} style={{ width: '100%', height: '100%' }}>
      <Canvas
        dpr={lite ? [1, 1] : [1, 2]}
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#0A0A0C', 8, 60]} />
          <ambientLight intensity={0.25} />
          <directionalLight position={[5, 5, 5]} intensity={0.9} color="#FFFFFF" />
          <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#49DE8A" />
          <pointLight position={[0, 0, -10]} intensity={1.2} color="#D4FF00" distance={10} />

          <Environment preset="warehouse" background={false} environmentIntensity={1.2} />

          <TunnelGrid />
          <ArmillaryRings />
          <CenterDataFabric />
          <FlowingParticles count={lite ? 1200 : 5000} />
          <CameraShake />

          {!lite && (
            <EffectComposer multisampling={0} enableNormalPass={false}>
              <Bloom
                intensity={1.4}
                kernelSize={KernelSize.LARGE}
                luminanceThreshold={0.15}
                luminanceSmoothing={0.6}
                mipmapBlur
              />
              <ChromaticAberration offset={[0.0015, 0.0015] as any} radialModulation modulationOffset={0.5} />
              <Noise opacity={0.06} blendFunction={BlendFunction.OVERLAY} />
              <Vignette darkness={0.6} offset={0.2} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
