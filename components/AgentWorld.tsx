'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import * as THREE from 'three';
import UseCasesChapter from './UseCasesChapter';
// La home n'a qu'UN son (demande Naim 11/09) : le depart de cette traversee
// 3D. Appel direct au moteur partage — SoundLayer/l'ecouteur d'evenements
// tve:sfx sont desactives sur la home, inutile de passer par un CustomEvent.
import * as sfx from '@/lib/sfx';

/* ============================================================
   AGENT WORLD — Hero 2 scroll-driven "Le Monde des Agents"
   qui SE TERMINE par le Hero 1 (coeur armillaire + message).

   Decoupage du scroll (progress p de 0 a 1) :
     p 0.00 -> 0.75  PHASE ACTIVE  : la camera traverse le corridor
                                     des 12 agents puis arrive au coeur
     p 0.75 -> 1.00  PHASE DE HOLD : plus rien ne bouge, le Hero 1 est
                                     plein ecran, on scrolle "dans le vide"
                                     avant que la page reprenne.

   Couche video Blender optionnelle : /public/video/intro.mp4 scrubee.
     ffmpeg -i in.mp4 -c:v libx264 -g 5 -pix_fmt yuv420p -an intro.mp4

   Bloom : seuls les materiaux toneMapped={false} (neons) depassent 1.0
   et declenchent le glow. Les affiches pixel art restent toneMapped
   (donc nettes, sans halo parasite).
   ============================================================ */

const AGENTS = [
  { slug: 'findor', name: 'Findor', tag: 'Prospection' },
  { slug: 'scrappowin', name: 'Scrappowin', tag: 'Scraping' },
  { slug: 'studio-antiguo', name: 'Studio-antiguo', tag: 'Generation' },
  { slug: 'openclaw', name: 'Agent souverain', tag: 'Souverain' },
  { slug: 'agentcron', name: 'AgentCron', tag: 'Orchestration' },
  { slug: 'mairiebot', name: 'MairieBot', tag: 'Citoyen' },
  { slug: 'reportium', name: 'Reportium', tag: 'Reporting' },
  { slug: 'docusweep', name: 'DocuSweep', tag: 'Documents' },
  { slug: 'cortexlab', name: 'CortexLab', tag: 'Multi-agents' },
  { slug: 'hyperframes-studio', name: 'HyperFrames', tag: 'Video' },
  { slug: 'tabasco-city', name: 'TabascoCity', tag: 'Marketplace' },
  { slug: 'memorial', name: 'Memorial', tag: 'Patrimoine' },
];

// Pseudo-aleatoire deterministe (stable entre rendus, pas de mismatch SSR).
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

type Vec3 = [number, number, number];

const LAYOUT = AGENTS.map((a, i) => {
  const side = i % 2 === 0 ? -1 : 1;
  const x = side * (2.3 + rnd(i, 1) * 1.1);
  const y = (rnd(i, 2) - 0.5) * 1.6;
  const z = -6 - i * 4.6 - rnd(i, 3) * 1.2;
  const rotY = -side * (0.35 + rnd(i, 4) * 0.3);
  // Deux panneaux volontairement de travers : patine, pas de vitrine lisse.
  const broken = i === 4 || i === 9;
  const rotZ = broken ? 0.32 * (rnd(i, 7) > 0.5 ? 1 : -1) : (rnd(i, 5) - 0.5) * 0.12;
  const scale = 0.85 + rnd(i, 6) * 0.35;
  return { ...a, url: `/carousel/${a.slug}.webp`, pos: [x, y, z] as Vec3, rot: [0, rotY, rotZ] as Vec3, scale };
});

const CAMERA_START = 4;
// Assez long pour DEPASSER la derniere carte (z ~ -57) : fin a z -68.
const CAMERA_TRAVEL = 72;
// Le coeur attend 10 unites devant la position finale de la camera.
const DEST_Z = -78;
// Decoupe du scroll (spec SPEC-CHAPITRE-06-CIRCUITS.json, validee par Naim) :
//   0    -> 0.69  traversee camera (2808 px, inchangee)
//   0.69 -> 0.92  hold : Hero 1 fige, rien ne bouge (936 px = "360 degres")
//   0.92 -> 1.00  chapitre 06 : DISPERSION choregraphiee du Hero 1 (312 px).
//                  Le noyau part le premier en retrecissant vers le haut,
//                  les anneaux s'alignent a l'horizontale et s'envolent en
//                  corridor de lumiere, les particules eclatent puis meurent
//                  en paillettes, le texte s'eleve et les boutons s'ecartent.
// Rallonge du 02/09 (retour Naim : "le chapitre 6 se deroule trop rapidement").
// La section gagne 55vh, entierement affectes au chapitre 06 : la traversee
// (~3510 px) et le hold du Hero 1 (~1170 px = les 360 degres valides) sont
// INCHANGES en pixels, seuls leurs ratios bougent. Le chapitre 06 passe de
// ~410 px a ~900 px, soit un ecran entier de dispersion.
const ACTIVE_END = 0.54;
const HERO1_HOLD_END = 0.72;
// Le chapitre de cloture (use_cases) se revele PENDANT que le faisceau acheve
// sa rotation et bascule vers le bas : il se superpose a la scene 3D au lieu
// d'arriver apres, plus bas dans la page.
const CLOSE_FROM = 0.80;
const CLOSE_TO = 0.89;

const CHAPTERS = [
  {
    k: '01',
    h1: 'UN GALAXIE EN EFFERVESCENCE',
    h2: "D'AGENTS.",
    p: "Chaque agent est une piece unique : un métier, un process greffé, une équipe de renfort concret. Pas un chatbot générique.",
  },
  {
    k: '02',
    h1: 'FABRIQUES',
    h2: 'SUR MESURE.',
    p: "Pas de template. Votre contexte devient l'architecture de l'agent — donnees, outils, ton, garde-fous.",
  },
  {
    k: '03',
    h1: 'INSTALLES PAR',
    h2: 'DES EXPERTS DEV-IA.',
    p: 'Manon, Eddy, Alex, Christina... Un groupe d\'actifs alliés qui deploie sur votre serveur, forme votre équipe, écoute, accompagne et assure votre succès.',
  },
  {
    k: '04',
    h1: 'DEPLOYES CHEZ',
    h2: 'VOUS. PAS AILLEURS.',
    p: "Selon votre puissance, en Api ou sur votre serveur, vos données ne sortent jamais. LLM locaux efficaces, RGPD blinde, 2nd brain et souverainete réelle.",
  },
  // 05 — arrivee au coeur : le Hero 1 complet (rendu a part, voir plus bas).
  { k: '05', h1: '', h2: '', p: '', finale: true },
];

/* ---------- 3D ---------- */

function Billboard({
  url, name, tag, pos, rot, scale, index,
}: { url: string; name: string; tag: string; pos: Vec3; rot: Vec3; scale: number; index: number }) {
  const tex = useTexture(url);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    tex.magFilter = THREE.NearestFilter; // pixel art net
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
  }, [tex]);

  useFrame((st) => {
    if (!ref.current) return;
    const t = st.clock.elapsedTime;
    ref.current.position.y = pos[1] + Math.sin(t * 0.6 + index) * 0.12;
    ref.current.rotation.y = rot[1] + Math.sin(t * 0.4 + index * 1.3) * 0.04;
  });

  return (
    <group ref={ref} position={pos} rotation={rot} scale={scale}>
      {/* Lisere accent — neon : toneMapped false => capte le bloom */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[2.14, 3.14]} />
        <meshBasicMaterial color="#5AD4B6" transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.015]}>
        <planeGeometry args={[2.06, 3.06]} />
        <meshBasicMaterial color="#0A0A0C" />
      </mesh>
      {/* Affiche : toneMapped=true => nette, pas de halo parasite */}
      <mesh>
        <planeGeometry args={[2, 3]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <Text position={[0, -1.72, 0]} fontSize={0.2} color="#D4ECEF" anchorX="center" anchorY="top" letterSpacing={0.08}>
        {name.toUpperCase()}
      </Text>
      <Text position={[0, -1.98, 0]} fontSize={0.11} color="#5AD4B6" anchorX="center" anchorY="top" letterSpacing={0.2}>
        {tag.toUpperCase()}
      </Text>
    </group>
  );
}

/* Fond galactique : nappe d'etoiles lointaines + nebuleuses additives. */
function Galaxy({ lite = false }: { lite?: boolean }) {
  const stars = useMemo(() => {
    const N = lite ? 600 : 1400; // mobile : moitie moins d'etoiles, invisible a l'oeil
    const p = new Float32Array(N * 3);
    const c = new Float32Array(N * 3);
    const cA = new THREE.Color('#D4ECEF');
    const cB = new THREE.Color('#5AD4B6');
    const cC = new THREE.Color('#CCFF00');
    for (let i = 0; i < N; i++) {
      p[i * 3] = (rnd(i, 31) - 0.5) * 90;
      p[i * 3 + 1] = (rnd(i, 32) - 0.5) * 60;
      p[i * 3 + 2] = 6 - rnd(i, 33) * 130;
      const k = rnd(i, 34);
      const col = k > 0.88 ? cC : k > 0.6 ? cB : cA;
      c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    return g;
  }, [lite]);

  // Nebuleuses : REJETEES loin derriere le corridor (z < -85) et hors de l'axe,
  // sinon leurs spheres enveloppent les cartes et delavent la traversee.
  const nebulas = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        pos: [
          (rnd(i, 41) - 0.5) * 70,
          (rnd(i, 42) - 0.5) * 40,
          -88 - rnd(i, 43) * 55,
        ] as Vec3,
        r: 10 + rnd(i, 44) * 14,
        color: i % 3 === 0 ? '#CCFF00' : i % 3 === 1 ? '#00FFE5' : '#5AD4B6',
        op: 0.02 + rnd(i, 45) * 0.025,
      })),
    []
  );

  const ref = useRef<THREE.Points>(null);
  useFrame((st) => {
    if (ref.current) ref.current.rotation.z = Math.sin(st.clock.elapsedTime * 0.03) * 0.04;
  });

  return (
    <>
      <points ref={ref}>
        <primitive object={stars} attach="geometry" />
        <pointsMaterial size={0.075} vertexColors transparent opacity={0.85} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </points>
      {nebulas.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[n.r, lite ? 10 : 20, lite ? 10 : 20]} />
          <meshBasicMaterial color={n.color} transparent opacity={n.op} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function Debris() {
  const items = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        pos: [(rnd(i, 11) - 0.5) * 9, (rnd(i, 12) - 0.5) * 6, -4 - rnd(i, 13) * 64] as Vec3,
        rot: [rnd(i, 14) * 3, rnd(i, 15) * 3, rnd(i, 16) * 3] as Vec3,
        s: 0.06 + rnd(i, 17) * 0.16,
        octa: rnd(i, 18) > 0.5,
      })),
    []
  );
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame((_, dt) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.rotation.x += dt * (0.2 + (i % 3) * 0.1);
      m.rotation.y += dt * 0.15;
    });
  });
  return (
    <>
      {items.map((d, i) => (
        <mesh key={i} ref={(el) => { if (el) refs.current[i] = el; }} position={d.pos} rotation={d.rot} scale={d.s}>
          {d.octa ? <octahedronGeometry args={[1, 0]} /> : <boxGeometry args={[1, 1, 1]} />}
          <meshBasicMaterial color={i % 4 === 0 ? '#CCFF00' : '#5AD4B6'} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

/* DESTINATION — le coeur du Hero 1 : 3 anneaux armillaires X/Y/Z + noyau
   + halo eblouissant. Se revele a l'approche, reste cadre pendant le hold. */
function Destination({ camPRef, exitPRef }: { camPRef: React.MutableRefObject<number>; exitPRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringX = useRef<THREE.Group>(null);
  const ringY = useRef<THREE.Group>(null);
  const ringZ = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const beamPivot = useRef<THREE.Group>(null);
  const sparkRef = useRef<THREE.Points>(null);
  // Rotation libre accumulee : on cesse de l'alimenter des que la dispersion
  // commence, pour pouvoir interpoler proprement vers l'horizontale.
  const spin = useRef<[number, number, number]>([0, 0, 0]);

  const RADIUS = 6.2;
  const TUBE = 0.2;
  // Couleurs de reference : pendant la dispersion on les MULTIPLIE au-dela de
  // 1.0 pour franchir le luminanceThreshold du Bloom -> glow reel (retour Naim
  // du 02/09 : "sans effet de glow").
  const BASE = useMemo(
    () => ({
      rings: [new THREE.Color('#CCFF00'), new THREE.Color('#39FF14'), new THREE.Color('#00FFE5')],
      core: new THREE.Color('#5AD4B6'),
      beam: new THREE.Color('#5AB82E'), // vert tirant sur le jaune, discret (Naim 22/09)
      spark: new THREE.Color('#CCFF00'),
    }),
    [],
  );
  // Inclinaisons au repos (etaient portees par les meshes ; desormais en JS
  // pour pouvoir les annuler pendant l'alignement du chapitre 06).
  const REST: Vec3[] = [
    [0, 0, 0],
    [Math.PI / 6, 0, 0],
    [Math.PI / 6, 0, Math.PI / 3],
  ];

  const sparks = useMemo(() => {
    const N = 90;
    const p = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = rnd(i, 51) * Math.PI * 2;
      const r = 2.2 + rnd(i, 52) * 4.4;
      p[i * 3] = Math.cos(a) * r;
      p[i * 3 + 1] = Math.sin(a) * r;
      p[i * 3 + 2] = (rnd(i, 53) - 0.5) * 4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, []);

  useFrame((st, dt) => {
    const reveal = Math.min(1, Math.max(0, (camPRef.current - 0.5) / 0.42));
    const e = exitPRef.current;
    const seg = (a: number, b: number) => Math.min(1, Math.max(0, (e - a) / (b - a)));
    const eOut = (x: number) => 1 - Math.pow(1 - x, 3);
    const eIn = (x: number) => x * x;
    const t = st.clock.elapsedTime;
    // Cloche de glow : monte des le depart de la dispersion, culmine au coeur
    // de l'action, redescend a la fin.
    const glow = 1 + 3.4 * Math.sin(Math.PI * Math.min(1, e * 1.08));

    if (groupRef.current) {
      groupRef.current.visible = reveal > 0.001 && e < 0.999;
      groupRef.current.scale.setScalar(0.7 + reveal * 0.3);
    }

    // Rotation libre : uniquement tant que la dispersion n'a pas commence.
    if (e <= 0.001) {
      spin.current[0] += dt * 0.3;
      spin.current[1] += dt * 0.4;
      spin.current[2] += dt * 0.24;
    }

    // ── ANNEAUX : alignement a l'horizontale, puis envol en faisceau ─────
    const align = eOut(seg(0.1, 0.5));
    const L = THREE.MathUtils.lerp;
    [ringX, ringY, ringZ].forEach((r, i) => {
      const g = r.current;
      if (!g) return;
      const base = REST[i];
      const rx = L(base[0] + (i === 0 ? spin.current[0] : 0), Math.PI / 2, align);
      const ry = L(base[1] + (i === 1 ? spin.current[1] : 0), 0, align);
      const rz = L(base[2] + (i === 2 ? spin.current[2] : 0), 0, align);
      g.rotation.set(rx, ry, rz);
      // Envol en cascade : chaque anneau part un peu apres le precedent et
      // monte plus haut -> les trois forment un corridor vertical.
      const fly = eIn(seg(0.32 + i * 0.08, 0.98));
      g.position.y = fly * (26 + i * 10);
      g.scale.setScalar(1 - fly * 0.22);
      const op = reveal * (1 - seg(0.78, 1));
      g.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          const mm = m.material as THREE.MeshBasicMaterial;
          if (mm && 'opacity' in mm) {
            mm.opacity = op;
            mm.color.copy(BASE.rings[i]).multiplyScalar(glow);
          }
        }
      });
    });

    // ── NOYAU : part LE PREMIER, retrecit en montant dans le corridor ────
    if (coreRef.current) {
      const up = seg(0, 0.44);
      coreRef.current.rotation.x += dt * (0.35 + up * 6);
      coreRef.current.rotation.y += dt * (0.28 + up * 4);
      coreRef.current.position.y = eIn(up) * 40;
      coreRef.current.scale.setScalar(Math.max(0.02, 1 - up * 0.94));
      const cm = coreRef.current.material as THREE.MeshBasicMaterial;
      cm.opacity = reveal * (1 - seg(0.3, 0.5));
      cm.color.copy(BASE.core).multiplyScalar(glow);
    }

    // ── FAISCEAU : colonne de lumiere, puis PROJECTEUR qui balaye 270 deg ──
    // Retour Naim : "le dernier faisceau jaune pourrait tourner vers le bas
    // comme le faisceau d'un projecteur qui fait un 270 degres du haut vers la
    // scene en dessous puis part en fading au-dessus".
    if (beamRef.current && beamPivot.current) {
      const sweep = seg(0.46, 0.9); // course du balayage
      const ang = sweep * Math.PI * 1.5; // 270 deg, pivot a la base
      beamPivot.current.rotation.z = ang;

      // Il pointe vers le bas a mi-course (ang = PI) : c'est la que le pinceau
      // eclaire la section suivante -> on pousse l'intensite a cet instant.
      const aim = Math.max(0, 1 - Math.abs(ang - Math.PI) / (Math.PI * 0.55));
      const rise = seg(0.16, 0.5);
      const fade = 1 - seg(0.88, 1);
      const b = rise * fade;
      const bm = beamRef.current.material as THREE.MeshBasicMaterial;
      bm.opacity = b * (0.12 + aim * 0.26);
      bm.color.copy(BASE.beam).multiplyScalar(1 + aim * 1.2);
      beamRef.current.scale.set(1 + aim * 0.35, 0.25 + rise * 1.6 + aim * 0.5, 1 + aim * 0.35);
      beamRef.current.visible = b > 0.002;
    }

    if (haloRef.current) {
      haloRef.current.scale.setScalar(1.5 + Math.sin(t * 1.4) * 0.16);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity =
        reveal * 0.5 * (1 - seg(0, 0.32));
    }

    // ── PARTICULES : eclatent en feu d'artifice, puis meurent en paillettes
    if (sparkRef.current) {
      const burst = eOut(seg(0.06, 0.5));
      const die = seg(0.42, 0.94);
      sparkRef.current.rotation.z += dt * 0.12 * (1 + burst * 5);
      sparkRef.current.scale.setScalar(1 + burst * 7.5);
      const mat = sparkRef.current.material as THREE.PointsMaterial;
      // Scintillement rapide en fin de vie = paillettes qui s'eteignent
      const glint = die > 0 ? 0.55 + 0.45 * Math.sin(t * 26) : 1;
      mat.opacity = reveal * (1 - die) * glint;
      mat.size = 0.22 * (1 - die * 0.65);
      mat.color.copy(BASE.spark).multiplyScalar(glow);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, DEST_Z]} rotation={[0.22, 0.32, 0.1]} visible={false}>
      <group ref={ringX}>
        <mesh>
          <torusGeometry args={[RADIUS, TUBE, 16, 150]} />
          <meshBasicMaterial color="#CCFF00" transparent opacity={0} toneMapped={false} />
        </mesh>
      </group>
      <group ref={ringY}>
        <mesh>
          <torusGeometry args={[RADIUS, TUBE, 16, 150]} />
          <meshBasicMaterial color="#39FF14" transparent opacity={0} toneMapped={false} />
        </mesh>
      </group>
      <group ref={ringZ}>
        <mesh>
          <torusGeometry args={[RADIUS, TUBE, 16, 150]} />
          <meshBasicMaterial color="#00FFE5" transparent opacity={0} toneMapped={false} />
        </mesh>
      </group>
      {/* Corridor de lumiere vertical (faisceau UFO) */}
      <group ref={beamPivot}>
      <mesh ref={beamRef} position={[0, 26, 0]} visible={false}>
        <cylinderGeometry args={[RADIUS * 0.9, RADIUS * 0.45, 52, 28, 1, true]} />
        <meshBasicMaterial
          color="#5AB82E"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      </group>
      {/* Halo eblouissant */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#CCFF00" transparent opacity={0} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* Noyau data fabric */}
      <mesh ref={coreRef}>
        <torusKnotGeometry args={[1.5, 0.42, 190, 26, 2, 3]} />
        <meshBasicMaterial color="#5AD4B6" transparent opacity={0} wireframe toneMapped={false} />
      </mesh>
      {/* Sparkles orbitaux */}
      <points ref={sparkRef}>
        <primitive object={sparks} attach="geometry" />
        <pointsMaterial size={0.22} color="#CCFF00" transparent opacity={0} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </points>
    </group>
  );
}

function CameraRig({ camPRef }: { camPRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const z = useRef(CAMERA_START);
  useFrame((st) => {
    const p = camPRef.current; // 0..1 sur la PHASE ACTIVE uniquement
    const target = CAMERA_START - p * CAMERA_TRAVEL;
    z.current += (target - z.current) * 0.08;
    const t = st.clock.elapsedTime;
    // Le balancement s'attenue a l'arrivee : cadrage stable sur le coeur.
    const sway = 1 - Math.min(1, Math.max(0, (p - 0.8) / 0.2));
    camera.position.set(
      (Math.sin(t * 0.3) * 0.35 + Math.sin(p * Math.PI * 2) * 0.6) * sway,
      Math.cos(t * 0.25) * 0.25 * sway,
      z.current
    );
    camera.lookAt(camera.position.x * 0.4, camera.position.y * 0.4, z.current - 9);
  });
  return null;
}

// Pilote automatique de la camera pour le mobile : au lieu du scroll (qui ne
// marche pas en tactile sur une scene epinglee), la camera fait un aller-retour
// doux a travers la galaxie, en boucle. La galaxie s'anime donc toute seule.
function AutoDrive({ camPRef }: { camPRef: React.MutableRefObject<number> }) {
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    camPRef.current = (1 - Math.cos(t * 0.22)) / 2; // 0 -> 1 -> 0, boucle douce
  });
  return null;
}

function Scene({ camPRef, exitPRef, lite = false, auto = false }: { camPRef: React.MutableRefObject<number>; exitPRef: React.MutableRefObject<number>; lite?: boolean; auto?: boolean }) {
  return (
    <>
      {auto && <AutoDrive camPRef={camPRef} />}
      <fog attach="fog" args={['#0A0A0C', 8, 48]} />
      <Galaxy lite={lite} />
      <gridHelper args={[140, lite ? 35 : 70, '#1a5e63', '#0F3D40']} position={[0, -3.4, -34]} />
      <gridHelper args={[140, lite ? 35 : 70, '#0F3D40', '#0A2E33']} position={[0, 3.4, -34]} />
      <CameraRig camPRef={camPRef} />
      <Suspense fallback={null}>
        {LAYOUT.map((a, i) => (
          <Billboard key={a.slug} url={a.url} name={a.name} tag={a.tag} pos={a.pos} rot={a.rot} scale={a.scale} index={i} />
        ))}
      </Suspense>
      <Destination camPRef={camPRef} exitPRef={exitPRef} />
      <Debris />

      {/* Glow neon + derive galactique — desactive en mode lite (mobile) :
          le post-processing lourd (Bloom + passes) fait ecran noir sur beaucoup
          de GPU mobiles. Sans lui, la galaxie reste nette et rend partout. */}
      {!lite && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          {/* Seuil haut : SEULS les neons toneMapped={false} glowent.
              Les affiches pixel art restent nettes, la traversee reste lisible. */}
          <Bloom intensity={1.15} kernelSize={KernelSize.LARGE} luminanceThreshold={0.62} luminanceSmoothing={0.4} mipmapBlur />
          <ChromaticAberration offset={[0.0012, 0.0012] as any} radialModulation modulationOffset={0.5} />
          <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
          <Vignette darkness={0.62} offset={0.2} />
        </EffectComposer>
      )}
    </>
  );
}

/* ---------- Section ---------- */

export default function AgentWorld() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const camPRef = useRef(0);
  // Chapitre 06 : avancement de la dispersion (0 = Hero 1 intact, 1 = tout parti)
  const exitPRef = useRef(0);
  const exitEls = useRef<HTMLElement[] | null>(null);
  const closeRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);
  const startedSfx = useRef(false); // le seul son de la home : une fois, au premier scroll

  // Mobile / tactile : le scroll-scrub 3D epingle (620vh + WebGL + pinning) casse
  // sur telephone -> ecran vide. On sert alors une version empilee, lisible, sans
  // Canvas (14/09/2026, retour Naim : "la 3d et les images n'apparaissent pas sur
  // mobile"). Detection au 1er rendu client (ssr:false) pour ne jamais monter le
  // Canvas sur mobile, meme brievement.
  const [isMobile] = useState(
    () => typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window)
  );
  // Boucle de rendu coupee quand la section est hors ecran (avant / apres le
  // scroll) : le canvas ne tourne ni sous le hero, ni sous les partenaires.
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = stickyRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Rattrapage : si le visiteur a deja depasse le tout debut de la traversee
  // AVANT d'armer le son (cas normal sur la home, ou le premier geste est
  // presque toujours un scroll, qui n'arme rien), on ne veut pas attendre un
  // NOUVEL evenement de scroll pour jouer le son — on le joue des l'armement.
  useEffect(() => {
    return sfx.subscribe(() => {
      if (!startedSfx.current && sfx.isArmed() && camPRef.current > 0.0005) {
        startedSfx.current = true;
        sfx.play('scroll');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;

        // Phase active 0..ACTIVE_END -> camP 0..1, puis HOLD (camP reste a 1).
        const camP = Math.min(1, p / ACTIVE_END);
        camPRef.current = camP;

        // Le seul son de la home (demande Naim 11/09) : une fois, au tout
        // premier mouvement dans la traversee des 12 cartes en profondeur.
        //
        // Bug corrige le 11/09 ("le son n'est toujours pas active d'office") :
        // la molette/le trackpad ne compte PAS comme un geste utilisateur pour
        // les navigateurs (seuls clic, touche, toucher armament le son — c'est
        // leur regle, pas la notre, cf. lib/sfx.ts). Sur la home, le premier
        // geste du visiteur est presque toujours un scroll : sans ce garde-fou,
        // ce if se declenchait AVANT l'armement, `sfx.play` ne faisait rien
        // (silencieux par design), et startedSfx passait quand meme a true —
        // le seul son de la page etait perdu pour toujours, sans jamais rejouer
        // meme apres un clic. Desormais on attend `sfx.isArmed()`, et l'abonnement
        // juste en dessous rattrape le coup des que l'armement survient plus tard.
        if (!startedSfx.current && p > 0.002 && sfx.isArmed()) {
          startedSfx.current = true;
          sfx.play('scroll');
        }

        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
        const v = videoRef.current;
        if (v && v.duration && isFinite(v.duration) && v.readyState >= 2) {
          v.currentTime = camP * v.duration;
        }
        // Le chapitre 05 (= copie conforme du Hero 1) ne s'affiche QU'UNE FOIS
        // la camera totalement arretee, cad des l'entree dans la phase HOLD.
        // Les 4 chapitres de traversee se repartissent sur toute la phase active.
        const c = p >= ACTIVE_END ? 4 : camP < 0.25 ? 0 : camP < 0.5 ? 1 : camP < 0.72 ? 2 : 3;
        setChapter((prev) => (prev === c ? prev : c));

        // ══ CHAPITRE 06 — DISPERSION CHOREGRAPHIEE ════════════════════════
        // Plus aucun fondu : chaque element du Hero 1 SORT par un mouvement
        // qui lui est propre. Cote 3D (cf. Destination) : le noyau part le
        // premier en retrecissant vers le haut, les anneaux s'alignent a
        // l'horizontale et s'envolent en corridor de lumiere, les particules
        // eclatent puis meurent en paillettes. Cote DOM (ici) : le texte
        // s'eleve et les boutons s'ecartent vers les bords, en cascade.
        const exitP = Math.min(1, Math.max(0, (p - HERO1_HOLD_END) / (1 - HERO1_HOLD_END)));
        exitPRef.current = exitP;

        // ── CHAPITRE DE CLOTURE : se leve sous le faisceau ────────────────
        const closeP = Math.min(1, Math.max(0, (p - CLOSE_FROM) / (CLOSE_TO - CLOSE_FROM)));
        const cw = closeRef.current;
        if (cw) {
          const ease = 1 - Math.pow(1 - closeP, 3);
          cw.style.opacity = ease.toFixed(3);
          cw.style.transform = `translate3d(0, ${((1 - ease) * 60).toFixed(1)}px, 0)`;
          cw.style.pointerEvents = closeP > 0.6 ? 'auto' : 'none';
          // La video n'est plus jouee : elle est SCRUBBEE au scroll par
          // UseCasesChapter lui-meme (la molette est la tete de lecture).
          // Rien a declencher ici.
        }

        const st = stickyRef.current;
        if (st) {
          if (!exitEls.current) {
            exitEls.current = Array.from(st.querySelectorAll<HTMLElement>('[data-exit]'));
          }
          const vwNow = window.innerWidth;
          // Sous-phase bornee : chaque element a sa propre fenetre temporelle
          const q = (a: number, b: number) => Math.min(1, Math.max(0, (exitP - a) / (b - a)));
          const out = (x: number) => 1 - Math.pow(1 - x, 3); // ease-out cubique

          for (const el of exitEls.current) {
            const kind = el.dataset.exit;
            const i = Number(el.dataset.exitI || 0);
            let tx = 0;
            let ty = 0;
            let op = 1;
            let sc = 1;

            if (exitP > 0) {
              if (kind === 'title') {
                ty = -190 * out(q(0.08, 0.62));
                sc = 1 - 0.12 * out(q(0.08, 0.62));
                op = 1 - q(0.3, 0.72);
              } else if (kind === 'stats') {
                tx = -160 * out(q(0.04, 0.5));
                op = 1 - q(0.18, 0.58);
              } else if (kind === 'para') {
                tx = -230 * out(q(0.14, 0.66));
                op = 1 - q(0.28, 0.74);
              } else if (kind === 'btn') {
                // Ecartement vers l'exterieur gauche, en cascade
                const a = 0.18 + i * 0.15;
                tx = -(vwNow * 0.75) * out(q(a, a + 0.6));
                op = 1 - q(a + 0.3, a + 0.62);
              } else if (kind === 'hud') {
                // Le panneau de droite part vers l'exterieur droit
                const a = 0.12 + i * 0.1;
                tx = vwNow * 0.7 * out(q(a, a + 0.6));
                op = 1 - q(a + 0.32, a + 0.62);
              } else {
                op = 1 - q(0.05, 0.4);
              }
            }

            el.style.transform =
              exitP > 0 ? `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${sc.toFixed(3)})` : '';
            el.style.opacity = exitP > 0 ? String(Math.max(0, op)) : '';
          }
        }
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

  // Mobile : on garde la VRAIE experience (cards, video, scroll) — on coupe
  // seulement le post-processing lourd et on baisse le dpr (voir Canvas).
  return (
    <section ref={sectionRef} className="relative h-[620vh] md:h-[820vh] bg-obsidian border-t border-accent/15">
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden scanlines">
        {/* Couche video Blender scrubee au scroll (optionnelle) */}
        <video
          ref={videoRef}
          src="/video/intro.mp4"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={() => setHasVideo(true)}
          onError={() => setHasVideo(false)}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700"
          style={{ opacity: hasVideo ? 0.35 : 0 }}
        />

        <div className="absolute inset-0">
          <Canvas dpr={isMobile ? [1, 1] : [1, 1.5]} frameloop={inView ? 'always' : 'never'} camera={{ position: [0, 0, CAMERA_START], fov: 55 }} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }} style={{ background: 'transparent' }}>
            <Scene camPRef={camPRef} exitPRef={exitPRef} lite={isMobile} />
          </Canvas>
        </div>

        {/* Vignettes TRAVERSEE : voile a gauche pour le texte, moitie droite
            DEGAGEE pour qu'on voie defiler les cartes d'agents. */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/10 to-transparent pointer-events-none z-[2] transition-opacity duration-700"
          style={{ opacity: chapter === 4 ? 0 : 1 }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-obsidian/75 via-transparent to-obsidian/25 pointer-events-none z-[2] transition-opacity duration-700"
          style={{ opacity: chapter === 4 ? 0 : 1 }}
        />

        {/* Vignettes HERO 1 : reprises A L'IDENTIQUE de app/page.tsx, elles
            remplacent les precedentes sur le finale pour un rendu identique. */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/40 to-transparent pointer-events-none z-[2] transition-opacity duration-700"
          style={{ opacity: chapter === 4 ? 1 : 0 }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-transparent to-obsidian/30 pointer-events-none z-[2] transition-opacity duration-700"
          style={{ opacity: chapter === 4 ? 1 : 0 }}
        />

        {/* HUD haut — s'efface sur le finale : le Hero 1 n'en a pas. */}

        {/* Chapitres */}
        <div className="relative z-10 h-full max-w-[1400px] mx-auto px-8 flex items-center">
          <div className="relative max-w-3xl w-full h-full">
            {CHAPTERS.map((c, i) => (
              <div
                key={c.k}
                className="absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-out"
                style={{
                  opacity: chapter === i ? 1 : 0,
                  transform: chapter === i ? 'translateY(0)' : chapter > i ? 'translateY(-24px)' : 'translateY(24px)',
                  pointerEvents: chapter === i ? 'auto' : 'none',
                }}
              >
                {!c.finale ? (
                  <>
                    <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-8 flex items-center gap-3">
                      <span className="w-8 h-px bg-accent" />
                      {c.k} / 05
                    </div>
                    <h2 className="display-cyber-h1 text-aqua mb-8">
                      {c.h1}<br />
                      <span className="grad-volt">{c.h2}</span>
                    </h2>
                    <p className="text-base lg:text-lg text-aqua/75 max-w-xl font-light leading-relaxed">{c.p}</p>
                  </>
                ) : (
                  /* ===== FINALE = HERO 1 INTEGRAL ===== */
                  <>
                    <div data-exit="fade" className="hud-label mb-10">
                      
                    </div>

                    <h2 data-exit="title" className="display-cyber-h1 text-aqua mb-10">
                      L&apos;IA<br />
                      <span className="grad-volt">CALIBREE</span><br />
                      <span className="grad-volt-mint">POUR PRODUIRE.</span>
                    </h2>

                    <div data-exit="stats" className="flex items-baseline gap-6 mb-10 font-monodisp text-[10px] uppercase tracking-[0.22em] text-ash">
                      <span><span className="text-accent">→</span> 12 cortex con_us en écosystème en 2024</span>
                      <span><span className="text-accent">→</span> 60 agents élaborés en nov 2024 avant Ruflo</span>
                      <span><span className="text-accent">→</span> SASU depuis 2023</span>
                      <span className="hidden md:inline"><span className="text-accent">→</span> Equipe pluridiscipliaire experimentee</span>
                    </div>

                    <p data-exit="para" className="text-base lg:text-lg text-aqua/75 max-w-xl mb-12 leading-relaxed font-light">
                      Consultant IA independant. Agents Claude et souverains (OpenClaw, Hermes, LLM local), locaux et indépendants, déjà skillés, chatbots metier
                      pour <span className="text-aqua font-medium">PME, mairies, associations</span>. <br/>
                      Mise en place sans jargon. Sans abonnement piege.<br/> Livrables cle-en-main avec démystification totale et formations.
                    </p>

                    <div className="flex flex-wrap gap-3 items-end">
                      <a
                        data-exit="btn"
                        data-exit-i="0"
                        href="mailto:tabascocity@proton.me?subject=RDV%20decouverte"
                        className="chrome-hover-light absolute bottom-32 left-[85%] items-center gap-3 text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-medium px-6 py-4 hover:brightness-110 transition-all"
                        style={{
                          background: 'linear-gradient(110deg, #2ed3ec 0%, #49DE8A 50%, #1a5e63 100%)',
                          borderRadius: '2px',
                          top: '-12px',
                          position: 'relative',
                        }}
                      >
                        Init RDV → 30min
                      </a>
                     
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chapitre de cloture, superpose a la scene pendant la rotation du faisceau */}
        <div ref={closeRef} className="absolute inset-0 z-20" style={{ opacity: 0 }}>
          <UseCasesChapter src="/video/chapitre7-cotes-du-container.mp4" scrubFrom={CLOSE_FROM} scrubTo={1} />
        </div>

        {/* ===== HUD menu options — copie conforme du Hero 1 (app/page.tsx).
             N'apparait QUE sur le finale, pour que la bascule soit identique. */}
        <div
          className="absolute right-8 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col gap-3 w-[280px] transition-opacity duration-700"
          style={{ opacity: chapter === 4 ? 1 : 0, pointerEvents: chapter === 4 ? 'auto' : 'none' }}
        >

          <div className="flex items-center gap-2 mt-1">
            <span className="font-monodisp text-[9px] tracking-[0.3em] uppercase text-accent/60">Options</span>
            <span className="flex-1 h-px bg-accent/20" />
            <span className="font-monodisp text-[9px] text-accent/40">04</span>
          </div>

          {[
            { n: '01', label: 'Commandez un agent', sub: 'fwd → 3 forfaits', href: '/tarifs#forfaits' },
            { n: '02', label: 'Structure souveraine', sub: 'fwd → setup souverain', href: '/structure-souveraine' },
            { n: '03', label: 'Nos creations de skills', sub: 'fwd → catalogue skills', href: '/skills' },
            { n: '04', label: 'Formez vos equipes', sub: 'fwd → formation 1500/j', href: '/tarifs#formation' },
          ].map((opt, oi) => (
            <a
              key={opt.n}
              data-exit="hud"
              data-exit-i={oi}
              href={opt.href}
              className="chrome-hover group relative bg-obsidian/40 backdrop-blur-md border border-accent/25 hover:border-accent hover:bg-accent/10 px-4 py-3.5 transition-all clip-civ-sm"
            >
              <span aria-hidden className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent/60 group-hover:border-accent transition-colors" />
              <span aria-hidden className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent/60 group-hover:border-accent transition-colors" />

              <div className="flex items-baseline gap-3">
                <span className="font-monodisp text-[9px] text-accent/60 group-hover:text-accent transition-colors w-5">
                  {opt.n}
                </span>
                <div className="flex-1">
                  <div className="font-monodisp text-[11px] text-aqua group-hover:text-accent uppercase tracking-[0.16em] mb-0.5 transition-colors">
                    {opt.label}
                  </div>
                  <div className="font-monodisp text-[9px] text-ash group-hover:text-accent/70 tracking-[0.18em] uppercase transition-colors">
                    {opt.sub}
                  </div>
                </div>
                <span className="font-monodisp text-[10px] text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
            </a>
          ))}

          <div className="flex items-center gap-2 mt-1 pt-1">
            <span className="w-1 h-1 bg-accent/60" />
            <span className="font-monodisp text-[9px] text-accent/40 tracking-[0.25em] uppercase">end_menu</span>
            <span className="flex-1 h-px bg-accent/15" />
          </div>
        </div>
      </div>
    </section>
  );
}
