'use client';

/**
 * Vagues oceaniques — fond Three.js de la section "Prestations complementaires".
 *
 * Demande Naim (02/09) : cette section "manque d'esthetisme et d'animation",
 * et la page doit plonger "dans des bleus oceans et pacifique, dans des vagues
 * fraiches qui nous eloignent de la froideur metallique du reste du site".
 *
 * Une nappe de lignes horizontales deformees par une houle (somme de deux
 * sinusoides croisees + derive lente). Rendu en LINES et non en surface
 * pleine : ca reste graphique, lisible derriere le texte, et tres leger.
 *
 * Le scroll incline la houle et accelere legerement la derive, donc la nappe
 * repond au geste sans etre pilotee image par image.
 */

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COLS = 130; // points par ligne — plus de definition dans la crete
const ROWS = 54; // lignes : la nappe etait trop maigre (Naim 02/09)
const W = 56; // largeur de la nappe
const D = 32; // profondeur

function Swell({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.LineSegments>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);

  // Une seule geometrie : les lignes horizontales, deformees a chaque frame.
  const geo = useMemo(() => {
    const seg = COLS - 1;
    const pos = new Float32Array(ROWS * seg * 2 * 3);
    const col = new Float32Array(ROWS * seg * 2 * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, []);

  // Palette : pleine eau -> ecume, du fond vers l'avant
  const cDeep = useMemo(() => new THREE.Color('#17607F'), []);
  const cSurf = useMemo(() => new THREE.Color('#7FD4E8'), []);

  useFrame((st) => {
    const t = st.clock.elapsedTime;
    const s = scrollRef.current;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;
    const seg = COLS - 1;
    let i = 0;

    const height = (x: number, z: number) =>
      Math.sin(x * 0.24 + t * 0.85) * 1.25 +
      Math.sin(z * 0.38 - t * 0.6) * 0.8 +
      Math.sin((x + z) * 0.15 + t * 0.33) * 0.95 +
      Math.sin(x * 0.61 - z * 0.29 + t * 1.4) * 0.32; // clapot fin

    // Respiration : deux ondes lentes desynchronisees, pour que la houle ne
    // pulse jamais deux fois pareil.
    const breath = 0.5 + 0.5 * Math.sin(t * 0.41);
    const surge = 0.5 + 0.5 * Math.sin(t * 0.23 + 1.7);
    if (matRef.current) {
      // Plus dense quand on est au coeur de la section, et ca respire
      matRef.current.opacity = 0.22 + 0.22 * breath + 0.1 * s;
    }
    // Le glow global monte et descend : les cretes s'allument par vagues
    // Glow FLUCTUANT : trois harmoniques qui ne retombent jamais en phase,
    // donc l'eau ne pulse jamais deux fois pareil.
    const glow =
      0.75 +
      0.95 * surge +
      0.35 * Math.sin(t * 0.77 + 0.9) +
      0.18 * Math.sin(t * 1.63 + 2.2);

    const tmp = new THREE.Color();
    const lit = new THREE.Color();

    for (let r = 0; r < ROWS; r++) {
      const z = -D / 2 + (r / (ROWS - 1)) * D;
      // Plus on est pres, plus la ligne est claire (ecume) et haute
      const near = r / (ROWS - 1);
      tmp.copy(cDeep).lerp(cSurf, Math.pow(near, 1.7));
      for (let c = 0; c < seg; c++) {
        const x0 = -W / 2 + (c / seg) * W;
        const x1 = -W / 2 + ((c + 1) / seg) * W;
        const y0 = height(x0, z) * (0.45 + near * 0.9);
        const y1 = height(x1, z) * (0.45 + near * 0.9);
        // La crete brille, le creux s'eteint : le relief devient lisible
        const l0 = glow * (0.3 + Math.max(0, y0) * 0.85);
        const l1 = glow * (0.3 + Math.max(0, y1) * 0.85);
        pos[i * 3] = x0;
        pos[i * 3 + 1] = y0;
        pos[i * 3 + 2] = z;
        lit.copy(tmp).multiplyScalar(l0);
        col[i * 3] = lit.r; col[i * 3 + 1] = lit.g; col[i * 3 + 2] = lit.b;
        i++;
        pos[i * 3] = x1;
        pos[i * 3 + 1] = y1;
        pos[i * 3 + 2] = z;
        lit.copy(tmp).multiplyScalar(l1);
        col[i * 3] = lit.r; col[i * 3 + 1] = lit.g; col[i * 3 + 2] = lit.b;
        i++;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    if (ref.current) {
      // Le scroll redresse la houle et la fait deriver
      ref.current.rotation.x = -0.62 + s * 0.22;
      ref.current.position.y = -2.4 + s * 1.2;
      ref.current.position.z = s * 3.5;
    }
  });

  return (
    <lineSegments ref={ref} geometry={geo} position={[0, -2.4, 0]} rotation={[-0.62, 0, 0]}>
      <lineBasicMaterial
        ref={matRef}
        vertexColors
        transparent
        opacity={0.28}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
}

export default function OceanWaves() {
  const hostRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const section = host.parentElement;
    if (!section) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = section.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 quand la section arrive par le bas, 1 quand elle sort par le haut
        scrollRef.current = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={hostRef} aria-hidden className="absolute inset-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.6, 12], fov: 52 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Swell scrollRef={scrollRef} />
      </Canvas>
      {/* Le texte est roi. La houle est ADDITIVE : elle eclaircit tout ce
          qu'elle traverse, donc sans voile dense le texte aqua devient
          blanc-sur-cyan et disparait. Voile sur TOUTE la largeur, renforce
          a gauche ou vit la colonne de texte. */}
      <div className="absolute inset-0 bg-abyss/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-abyss/90 via-abyss/60 to-abyss/40" />
    </div>
  );
}
