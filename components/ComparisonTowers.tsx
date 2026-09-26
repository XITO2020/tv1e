'use client';

/**
 * ComparisonTowers — les trois familles du marketplace en trois gratte-ciel,
 * et les cartes d'agents des colonnes INCRUSTEES dans leurs facades.
 *
 * Le scroll est un rail de lecture :
 *   1. intro — les tours sortent du sol (debout) ou glissent dans le champ
 *      (couchees, une de la gauche, une de la droite, une de la gauche) ;
 *   2. puis chaque panneau, l'un apres l'autre : la camera se colle a la
 *      facade, la tour fait un quart de tour a chaque carte pour presenter la
 *      suivante. 22 cartes = 22 pas de scroll, de la premiere a la derniere.
 * Cliquer une tour saute a son segment ; la tirer la fait tourner (elle revient
 * d'elle-meme) ; la survoler l'eclaire et affiche l'indication.
 *
 * Deux dispositions, meme moteur :
 *   - `stand` (>= 768 px) : tours debout cote a cote ;
 *   - `lie`   (<  768 px) : la tour active est COUCHEE sur toute la largeur,
 *     les cartes tournees pour rester droites, la camera longe la facade.
 *
 * Fidelite des cartes : peintes dans un canvas avec les VRAIES polices du site
 * (variables CSS de next/font) — icone, nom, prix, description, delai — puis
 * plaquees dans les bandeaux lisses de la facade. Lisibilite mesuree en px.
 *
 * Modeles : public/models/agent-towers.glb (Blender). Les constantes H / STAGES
 * / SHRINK / BAND_* / PODIUM_* sont les MEMES que dans le script Blender.
 * Aucune ressource distante : environnement, vitrage et cartes sont generes ici.
 *
 * Harnais de verification : `?t=0.42` fige la progression, `?phone=1` rend la
 * disposition couchee dans un cadre 390x844 au milieu d'un ecran large.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, MeshReflectorMaterial, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
// Appel direct pour le SEUL son declenche par le scroll (voir plus bas) :
// il doit savoir si le moteur est deja arme, ce que le simple CustomEvent
// tve:sfx (utilise pour la nappe du catalogue) ne permet pas de verifier.
import * as sfx from '@/lib/sfx';

const MODEL = '/models/agent-towers.glb';

// --- Miroir exact du generateur Blender ---
const H = 40;
const STAGES = [0, 0.36, 0.63, 0.85, 1];
const SHRINK = 0.13;
// Bandeaux places etage par etage (bas des bandeaux, en m) : aucun ne chevauche
// un retrait, donc aucun parapet ne passe devant une carte. 3 + 2 + 2 + 1.
const BANDS = [3.7, 7.1, 10.5, 15.0, 18.7, 25.7, 29.4, 34.6];
const BAND_H = 3.4;
const PODIUM_K = 1.28;
const TILE_M = 4.2; // une tuile de vitrage = 4,2 m = 4 etages

const SPACING = 17; // ecart des tours debout
const OFF = 70; // parking hors champ des tours couchees
const CARD_ASPECT = 1.75;
const STEP_VH: Record<Layout, number> = { stand: 26, lie: 34 };
const INTRO_VH: Record<Layout, number> = { stand: 320, lie: 120 };

type Layout = 'stand' | 'lie';

export type PillarAgent = { name: string; desc: string; price: string; delivery: string; icon: string; img?: string };
export type Pillar = {
  anchor: string;
  famille: string;
  name: string;
  force: string;
  summary: string;
  hue: string;
  node: string;
  hx: number;
  hy: number;
  chamfer: number;
  agents: PillarAgent[];
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
// Paliers : un double lissage tient la carte au centre et concentre la rotation
// au milieu du pas — le scroll « colle » a chaque carte au lieu de glisser.
const dwell = (t: number) => smooth(smooth(t));
// Montee de la tour i pendant l'intro (t = 0..1) : une a la fois, chacune a
// le temps d'exister avant que la suivante ne parte. Pilotee par le scroll.
const riseOf = (t: number, i: number) => dwell((t - (0.22 + i * 0.2)) / 0.3);
const stageOf = (z: number) => {
  const r = Math.min(Math.max(z / H, 0), 0.999);
  for (let i = 0; i < STAGES.length - 1; i++) if (r >= STAGES[i] && r < STAGES[i + 1]) return i;
  return 0;
};
const halfAt = (z: number, half0: number) => half0 * (1 - SHRINK * stageOf(z));

/** Emplacement de la carte j sur la facade : bandeau j, face j mod 4 (helice). */
function slotOf(p: Pillar, j: number) {
  const y = BANDS[Math.min(j, BANDS.length - 1)] + BAND_H / 2;
  const f = j % 4;
  const theta = -f * (Math.PI / 2);
  const across = halfAt(y, f % 2 === 0 ? p.hx : p.hy);
  const depth = halfAt(y, f % 2 === 0 ? p.hy : p.hx) + 0.07;
  const w = Math.min(2 * (across - p.chamfer) * 0.94, BAND_H * 0.94);
  return { y, f, theta, depth, w, h: w / CARD_ASPECT };
}

/** Ligne de temps partagee : p (0..1 sur la section) -> intro t, puis rail u. */
function timeline(p: number, layout: Layout, count: number) {
  const introFrac = INTRO_VH[layout] / (INTRO_VH[layout] + count * STEP_VH[layout]);
  if (p < introFrac) return { t: p / introFrac, u: 0 };
  return { t: 1, u: ((p - introFrac) / (1 - introFrac)) * (count - 1) };
}

type Drive = {
  p: number;
  layout: Layout;
  reveal: number; // 0..1, temporel : montee des tours debout
  grabbing: boolean;
  dragTower: number;
  dragOffset: number;
  hover: number;
};

// ─── Textures generees ───────────────────────────────────────────────────────

let windowCache: { map: THREE.CanvasTexture; lit: THREE.CanvasTexture } | null = null;

/** Vitrage : une tuile de 4 etages x 16 fenetres, et sa carte de fenetres allumees. */
function windowTextures() {
  if (windowCache) return windowCache;
  const S = 512;
  const FLOOR = S / 4;
  const WIN = S / 16;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // Un etage = une allege opaque en bas + deux rangs de vitrage separes par
  // une traverse : des carreaux presque carres, pas des fentes.
  const SPANDREL = 34;
  const ROW = (FLOOR - SPANDREL) / 2;
  const base = document.createElement('canvas');
  base.width = base.height = S;
  const g = base.getContext('2d')!;
  g.fillStyle = '#101A22';
  g.fillRect(0, 0, S, S);
  for (let fy = 0; fy < 4; fy++) {
    const top = fy * FLOOR;
    // Allege : metal gris-bleu mat
    g.fillStyle = '#26333C';
    g.fillRect(0, top + FLOOR - SPANDREL, S, SPANDREL);
    for (let wx = 0; wx < 16; wx++) {
      for (let row = 0; row < 2; row++) {
        const y0 = top + row * ROW;
        const grad = g.createLinearGradient(0, y0, 0, y0 + ROW);
        grad.addColorStop(0, '#1A3140');
        grad.addColorStop(1, '#0C1A23');
        g.fillStyle = grad;
        g.fillRect(wx * WIN + 3, y0 + 3, WIN - 6, ROW - 6);
      }
    }
    // Traverse entre les deux rangs
    g.fillStyle = '#2C3F4A';
    g.fillRect(0, top + ROW - 2, S, 4);
  }
  g.fillStyle = '#233742';
  for (let wx = 0; wx <= 16; wx++) g.fillRect(wx * WIN - 1, 0, 3, S);
  g.fillStyle = '#31444F';
  for (let fy = 0; fy <= 4; fy++) g.fillRect(0, fy * FLOOR - 2, S, 5);

  const lit = document.createElement('canvas');
  lit.width = lit.height = S;
  const l = lit.getContext('2d')!;
  l.fillStyle = '#000';
  l.fillRect(0, 0, S, S);
  // Froid et sobre : blanc bleute, bleu pale, bleu-vert. Ni orange ni fluo.
  const tints = ['214,236,246', '176,208,226', '150,214,206', '198,224,236'];
  for (let fy = 0; fy < 4; fy++) {
    for (let wx = 0; wx < 16; wx++) {
      for (let row = 0; row < 2; row++) {
        if (rnd() > 0.17) continue;
        const a = 0.35 + rnd() * 0.4;
        l.fillStyle = `rgba(${tints[Math.floor(rnd() * tints.length)]},${a.toFixed(2)})`;
        l.fillRect(wx * WIN + 4, fy * FLOOR + row * ROW + 4, WIN - 8, ROW - 8);
      }
    }
  }
  const mk = (c: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  windowCache = { map: mk(base), lit: mk(lit) };
  return windowCache;
}

/** Halo doux derriere une tour survolee ou active. */
function haloTexture(hue: string) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(128, 256, 10, 128, 256, 250);
  grad.addColorStop(0, hue);
  grad.addColorStop(0.55, hue + '55');
  grad.addColorStop(1, hue + '00');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

type Fonts = { sans: string; mono: string };

function wrapText(g: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (g.measureText(test).width <= maxW || !cur) cur = test;
    else {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  if (lines.length === maxLines && (cur || words.length)) {
    // Derniere ligne rognee proprement si tout ne tient pas.
    let last = lines[maxLines - 1];
    const rest = words.slice(words.indexOf(last.split(' ').slice(-1)[0]) + 1);
    if (rest.length && cur !== last) {
      while (g.measureText(last + '…').width > maxW && last.length > 3) last = last.slice(0, -1);
      lines[maxLines - 1] = last.replace(/[\s,;:]+$/, '') + '…';
    }
  }
  return lines;
}

/** La carte d'agent des colonnes, a l'identique, peinte pour la facade. */
/** Charge une vignette ; absente ou illisible = null, la carte se dessine sans. */
function loadImage(src?: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

function makeCard(a: PillarAgent, hue: string, fonts: Fonts, compact: boolean, art: HTMLImageElement | null = null): THREE.CanvasTexture {
  const W = 1024;
  const Ht = Math.round(W / CARD_ASPECT);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = Ht;
  const g = c.getContext('2d')!;
  const ch = 18; // chanfrein, comme .clip-civ-sm

  // Fond et bord chanfreines
  const path = () => {
    g.beginPath();
    g.moveTo(ch, 0);
    g.lineTo(W - ch, 0);
    g.lineTo(W, ch);
    g.lineTo(W, Ht - ch);
    g.lineTo(W - ch, Ht);
    g.lineTo(ch, Ht);
    g.lineTo(0, Ht - ch);
    g.lineTo(0, ch);
    g.closePath();
  };
  g.fillStyle = '#05090C';
  g.fillRect(0, 0, W, Ht);
  path();
  g.fillStyle = '#0E161B';
  g.fill();
  g.lineWidth = 3;
  g.strokeStyle = 'rgba(90,212,182,0.28)';
  g.stroke();
  g.fillStyle = hue;
  g.fillRect(0, ch, 5, Ht - 2 * ch); // lisere de famille

  const pad = 52;
  const scale = compact ? 1.12 : 1;
  const gx = pad + 96 + 34; // colonne de texte, apres l'icone
  // Vignette : "trop petites" (Naim, 11/09) — passee de 150 a 230 (+53%),
  // presence nettement plus visible sans manger la colonne de texte.
  const artSz = art ? 230 : 0;

  // Icone dans son cadre
  g.strokeStyle = 'rgba(90,212,182,0.4)';
  g.lineWidth = 2;
  g.strokeRect(pad, pad, 96, 96);
  g.font = `${Math.round(54 * scale)}px ${fonts.sans}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#5AD4B6';
  g.fillText(a.icon, pad + 48, pad + 50);

  // Prix, a droite
  g.font = `700 ${Math.round(44 * scale)}px ${fonts.mono}`;
  g.textAlign = 'right';
  g.textBaseline = 'top';
  g.fillStyle = hue;
  g.fillText(a.price, W - pad, pad + 6);
  const priceW = g.measureText(a.price).width;

  // Nom : mono, capitales, espace, sur deux lignes au plus
  const ctx = g as CanvasRenderingContext2D & { letterSpacing?: string };
  ctx.letterSpacing = '0.09em';
  g.font = `700 ${Math.round(46 * scale)}px ${fonts.mono}`;
  g.textAlign = 'left';
  g.fillStyle = '#EAFBF5';
  const nameLines = wrapText(g, a.name.toUpperCase(), W - gx - pad - priceW - 28, 2);
  const nameLH = Math.round(56 * scale);
  nameLines.forEach((ln, i) => g.fillText(ln, gx, pad + 4 + i * nameLH));
  ctx.letterSpacing = '0px';

  // Description : la police d'affichage du site, fine
  const descSize = Math.round((compact ? 40 : 36) * scale);
  g.font = `300 ${descSize}px ${fonts.sans}`;
  g.fillStyle = 'rgba(196,234,224,0.8)';
  const descTop = pad + 4 + nameLines.length * nameLH + 18;
  const descLH = Math.round(descSize * 1.3);
  // La largeur reserve la place de la vignette, meme si le texte est court :
  // sur une description longue, la derniere ligne ne doit jamais passer dessous.
  const descLines = wrapText(g, a.desc, W - gx - pad - (artSz ? artSz + 20 : 0), compact ? 2 : 3);
  descLines.forEach((ln, i) => g.fillText(ln, gx, descTop + i * descLH));

  // Vignette pixel art de l'agent (public/agents-cards/, 300x300), en bas a
  // droite, chanfreinee et cerclee comme les vignettes des colonnes.
  if (art) {
    const sz = artSz;
    const ax = W - pad - sz;
    const ay = Ht - pad - sz;
    const c2 = 12;
    const artPath = () => {
      g.beginPath();
      g.moveTo(ax + c2, ay);
      g.lineTo(ax + sz - c2, ay);
      g.lineTo(ax + sz, ay + c2);
      g.lineTo(ax + sz, ay + sz - c2);
      g.lineTo(ax + sz - c2, ay + sz);
      g.lineTo(ax + c2, ay + sz);
      g.lineTo(ax, ay + sz - c2);
      g.lineTo(ax, ay + c2);
      g.closePath();
    };
    g.save();
    artPath();
    g.clip();
    g.drawImage(art, ax, ay, sz, sz);
    g.restore();
    artPath();
    g.lineWidth = 2;
    g.strokeStyle = 'rgba(90,212,182,0.45)';
    g.stroke();
  }

  // Delai, en bas : « → 5 JOURS »
  g.font = `500 ${Math.round(27 * scale)}px ${fonts.mono}`;
  g.textBaseline = 'bottom';
  g.fillStyle = 'rgba(90,212,182,0.75)';
  ctx.letterSpacing = '0.18em';
  g.fillText(`→ ${a.delivery.toUpperCase()}`, gx, Ht - pad + 6);
  ctx.letterSpacing = '0px';

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

// ─── Scene ───────────────────────────────────────────────────────────────────

type Flat = { i: number; j: number };

function Tower({
  pillar,
  index,
  start,
  layout,
  drive,
  cards,
  count,
  onGrab,
  onPick,
  onHover,
}: {
  pillar: Pillar;
  index: number;
  start: number;
  layout: Layout;
  drive: React.MutableRefObject<Drive>;
  cards: THREE.CanvasTexture[];
  count: number;
  onGrab: (i: number, x: number) => void;
  onPick: (i: number) => void;
  onHover: (i: number | null) => void;
}) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const steel = useRef<THREE.MeshStandardMaterial>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const { nodes } = useGLTF(MODEL) as unknown as { nodes: Record<string, THREE.Mesh> };
  const glassGeo = nodes[`${pillar.node}_glass`]?.geometry;
  const steelGeo = nodes[`${pillar.node}_steel`]?.geometry;
  const win = useMemo(() => windowTextures(), []);
  const haloTex = useMemo(() => haloTexture(pillar.hue), [pillar.hue]);
  const hue = useMemo(() => new THREE.Color(pillar.hue), [pillar.hue]);
  const dragged = useRef(false);
  const n = pillar.agents.length;
  const slots = useMemo(() => pillar.agents.map((_, j) => slotOf(pillar, j)), [pillar]);
  const hmax = Math.max(pillar.hx, pillar.hy);
  const y0Lie = pillar.hx * PODIUM_K + 0.32;
  const enterSide = index % 2 === 0 ? -1 : 1;

  useFrame((_, dt) => {
    const o = outer.current;
    const g = inner.current;
    if (!o || !g) return;
    const d = drive.current;
    const { t, u } = timeline(d.p, layout, count);
    const active = Math.round(u);
    const isActive = t >= 1 && active >= start && active < start + n;

    if (layout === 'stand') {
      const e = riseOf(t, index);
      // Enterree de H + 12 : la couronne et le mat depassent H de ~7 m, ils
      // doivent etre sous le sol avant la montee — sinon trois antennes
      // pointent deja quand l'ecran est cense etre vide.
      o.position.set((index - 1) * SPACING, -(H + 12) * (1 - e), 0);
      o.rotation.z = 0;
    } else {
      // Entree / sortie par les cotes, dans la transition entre deux tours.
      let x: number;
      const end = start + n - 1;
      if (index === 0 && t < 1) x = enterSide * OFF * (1 - smooth((t - 0.3) / 0.7));
      else if (u < start - 1) x = enterSide * OFF;
      else if (u < start) x = enterSide * OFF * (1 - smooth(u - (start - 1)));
      else if (u <= end) x = 0;
      else if (u < end + 1) x = -enterSide * OFF * smooth(u - end);
      else x = -enterSide * OFF;
      o.position.set(x, y0Lie, 0);
      o.rotation.z = -Math.PI / 2;
    }

    // Rail : un quart de tour par carte, la tour presente la suivante.
    const r = Math.min(Math.max(u - start, 0), n - 1);
    const spin = (Math.floor(r) + dwell(r - Math.floor(r))) * (Math.PI / 2);
    const manual = d.dragTower === index ? d.dragOffset : 0;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, spin + manual, 1 - Math.pow(0.0005, dt));

    const hover = d.hover === index;
    const k = 1 - Math.pow(0.004, dt);
    if (steel.current) {
      steel.current.emissiveIntensity = THREE.MathUtils.lerp(steel.current.emissiveIntensity, hover ? 0.16 : isActive ? 0.05 : 0, k);
      steel.current.roughness = THREE.MathUtils.lerp(steel.current.roughness, hover ? 0.11 : 0.19, k);
    }
    if (halo.current) {
      // Discret : un souffle derriere la tour, jamais un voile sur l'image.
      halo.current.opacity = THREE.MathUtils.lerp(halo.current.opacity, hover ? 0.13 : isActive ? 0.05 : 0, k);
    }
  });

  if (!glassGeo || !steelGeo) return null;

  return (
    <group
      ref={outer}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(index);
      }}
      onPointerOut={() => onHover(null)}
      onPointerDown={(e) => {
        e.stopPropagation();
        dragged.current = false;
        onGrab(index, e.clientX);
      }}
      onPointerMove={(e) => {
        if (drive.current.grabbing && drive.current.dragTower === index && Math.abs(drive.current.dragOffset) > 0.05) dragged.current = true;
        void e;
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!dragged.current) onPick(index);
      }}
    >
      {/* Halo : dans le groupe exterieur, il ne tourne pas avec la tour. */}
      <mesh position={[0, H / 2 + 2, -(hmax + 2.2)]}>
        <planeGeometry args={[hmax * 2 + 9, H + 16]} />
        <meshBasicMaterial ref={halo} map={haloTex} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      <group ref={inner}>
        {/* Vitrage : mur-rideau sombre, fenetres allumees, reflets du studio. */}
        <mesh geometry={glassGeo}>
          <meshStandardMaterial
            color="#FFFFFF"
            map={win.map}
            emissive="#FFFFFF"
            emissiveMap={win.lit}
            emissiveIntensity={0.7}
            metalness={0.62}
            roughness={0.16}
            envMapIntensity={1.35}
          />
        </mesh>
        {/* Acier trempe : dalles, meneaux, parapets, toiture. */}
        <mesh geometry={steelGeo}>
          <meshStandardMaterial
            ref={steel}
            color="#BCCBD0"
            metalness={1}
            roughness={0.19}
            envMapIntensity={1.9}
            emissive={hue}
            emissiveIntensity={0}
          />
        </mesh>

        {/* Les cartes, dans les bandeaux, en helice sur les quatre faces. */}
        {cards.map((tex, j) => {
          const s = slots[j];
          return (
            <group key={j} rotation-y={s.theta}>
              <mesh position={[0, s.y, s.depth]} rotation-z={layout === 'lie' ? Math.PI / 2 : 0}>
                <planeGeometry args={[s.w, s.h]} />
                <meshBasicMaterial map={tex} toneMapped={false} />
              </mesh>
            </group>
          );
        })}

        {/* Balise de couronne */}
        <mesh position={[0, H + 7.3, 0]}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshBasicMaterial color={hue} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Studio de reflexion fabrique sur place — c'est lui qui fait le metal. */
function Reflections() {
  return (
    <Environment resolution={256} frames={1}>
      <mesh scale={80}>
        <sphereGeometry args={[1, 32, 20]} />
        <meshBasicMaterial side={THREE.BackSide} color="#141C23" />
      </mesh>
      <mesh position={[-18, 34, -26]} rotation={[0, 0.5, 0.12]}>
        <planeGeometry args={[26, 96]} />
        <meshBasicMaterial color="#F2F7F8" />
      </mesh>
      <mesh position={[30, 22, -16]} rotation={[0, -0.7, -0.1]}>
        <planeGeometry args={[16, 80]} />
        <meshBasicMaterial color="#9FC4CC" />
      </mesh>
      <mesh position={[6, 16, 40]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[40, 60]} />
        <meshBasicMaterial color="#3E5A60" />
      </mesh>
      <mesh position={[0, -18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#55636B" />
      </mesh>
      <mesh position={[0, 74, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#0B1116" />
      </mesh>
    </Environment>
  );
}

function Ground({ layout }: { layout: Layout }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[360, 360]} />
      <MeshReflectorMaterial
        blur={[420, 120]}
        resolution={layout === 'lie' ? 256 : 512}
        mixBlur={1}
        mixStrength={26}
        roughness={0.85}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.6}
        color="#080D12"
        metalness={0.55}
        mirror={0.45}
      />
    </mesh>
  );
}

function Rig({
  pillars,
  flat,
  layout,
  drive,
  onActive,
}: {
  pillars: Pillar[];
  flat: Flat[];
  layout: Layout;
  drive: React.MutableRefObject<Drive>;
  onActive: (k: number) => void;
}) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(0, 22, 0));
  const lastK = useRef(-1);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  /** Position de lecture de la carte k et distance camera pour la remplir. */
  const readPos = useCallback(
    (k: number) => {
      const { i, j } = flat[k];
      const s = slotOf(pillars[i], j);
      const fov = (camera as THREE.PerspectiveCamera).fov;
      const tanH = Math.tan((fov * Math.PI) / 360);
      const aspect = size.width / size.height;
      // Dezoom (v1.0.3, retour beta-testeurs : "on zoome trop, l'ecriture devient
      // floue, on ne comprend pas ce qui se passe"). Camera reculee : la carte
      // occupe moins de largeur -> on lit la carte ET on garde la tour + ses
      // voisines dans le champ. lie (mobile) recule aussi.
      // La 3D ne se charge que sur desktop (>= 1024 px, cf. gate) : cadrage
      // lisible, la carte occupe ~32 % de la largeur.
      const fill = 0.32;
      const D = s.w / (fill * 2 * tanH * aspect) + s.depth;
      // Debout : la carte doit tomber au centre VISUEL, entre le bandeau haut et
      // les pancartes — on vise donc un peu sous elle pour la remonter a l'ecran.
      const lift = layout === 'stand' ? 0.11 * 2 * (D - s.depth) * tanH : 0;
      if (layout === 'stand') return { x: (i - 1) * SPACING, y: s.y - lift, D };
      return { x: s.y, y: pillars[i].hx * PODIUM_K + 0.32, D };
    },
    [flat, pillars, layout, camera, size.width, size.height],
  );

  useFrame((_, dt) => {
    const d = drive.current;
    const { t, u } = timeline(d.p, layout, flat.length);
    if (!d.grabbing) d.dragOffset *= Math.exp(-3.2 * dt);

    let x = 0;
    let y = 0;
    let z = 0;
    let lx = 0;
    let ly = 0;
    const first = readPos(0);
    if (t < 1) {
      if (layout === 'stand') {
        // Rue -> vue d'ensemble -> premiere carte.
        const a = smooth((t - 0.22) / 0.7);
        const b = smooth((t - 0.92) / 0.08);
        const sx = 0, sy = 3.5 + (17 - 3.5) * a, sz = 40 + (78 - 40) * a;
        const slx = 0, sly = 9 + (22 - 9) * a;
        x = sx + (first.x - sx) * b;
        y = sy + (first.y - sy) * b;
        z = sz + (first.D - sz) * b;
        lx = slx + (first.x - slx) * b;
        ly = sly + (first.y - sly) * b;
      } else {
        x = first.x;
        y = first.y;
        z = first.D + 14 * (1 - smooth((t - 0.3) / 0.7));
        lx = first.x;
        ly = first.y;
      }
    } else {
      const kA = Math.min(Math.floor(u), flat.length - 1);
      const kB = Math.min(kA + 1, flat.length - 1);
      const f = dwell(u - kA);
      const A = readPos(kA);
      const B = readPos(kB);
      x = A.x + (B.x - A.x) * f;
      y = A.y + (B.y - A.y) * f;
      z = A.D + (B.D - A.D) * f;
      if (flat[kA].i !== flat[kB].i) {
        // Saut de tour : on recule pour voir le changement.
        const hop = Math.sin(Math.PI * f);
        z += (layout === 'stand' ? 24 : 9) * hop;
        y += (layout === 'stand' ? 6 : 0) * hop;
      }
      lx = x;
      ly = A.y + (B.y - A.y) * f;
      const k = Math.round(u);
      if (k !== lastK.current) {
        lastK.current = k;
        onActive(k);
        // Le seul son restant au niveau des cards (11/09) : un swoosh par
        // pas de scroll, propre a la tour de la carte qui arrive. `sfx.play`
        // n'est pas un coup unique ici — s'il est manque parce que le son
        // n'est pas encore arme, la PROCHAINE carte le rejouera normalement,
        // pas besoin du rattrapage utilise pour les sons uniques.
        const swoosh = (['swooshTower1', 'swooshTower2', 'swooshTower3'] as const)[flat[k].i];
        sfx.play(swoosh, 0.96 + Math.random() * 0.08);
      }
    }
    const k = 1 - Math.pow(0.0008, dt);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, x, k);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, y, k);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, z, k);
    look.current.lerp(tmp.set(lx, ly, 0), k);
    camera.lookAt(look.current);
  });
  return null;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function ComparisonTowers({ pillars: all, onReady }: { pillars: Pillar[]; onReady?: () => void }) {
  const pillars = useMemo(() => all.slice(0, 3), [all]);
  const section = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const risenSfx = useRef(false); // son d'apparition : une fois par visite
  const driveT = useRef(0); // derniere valeur de `t` (timeline d'intro), pour le rattrapage ci-dessous
  const drive = useRef<Drive>({ p: 0, layout: 'stand', reveal: 0, grabbing: false, dragTower: -1, dragOffset: 0, hover: -1 });

  // Rattrapage, comme sur la home (meme bug, meme regle des navigateurs) : si
  // les tours ont deja commence a se lever AVANT que le son ne soit arme (le
  // scroll n'arme rien), on ne perd pas le son — on le joue des l'armement.
  useEffect(() => {
    return sfx.subscribe(() => {
      if (!risenSfx.current && sfx.isArmed() && driveT.current > 0.22) {
        risenSfx.current = true;
        sfx.play('scroll');
      }
    });
  }, []);
  const [layout, setLayout] = useState<Layout>('stand');
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState(false);
  // Vraie detection mobile (distincte du flag debug ?phone=1) : sur telephone,
  // le post-processing Bloom fait ecran noir et le dpr eleve rame. (14/09/2026)
  const [mob, setMob] = useState(false);
  const forced = useRef<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [activeK, setActiveK] = useState(-1);
  const [cards, setCards] = useState<THREE.CanvasTexture[][]>([]);

  const flat = useMemo<Flat[]>(() => pillars.flatMap((p, i) => p.agents.map((_, j) => ({ i, j }))), [pillars]);
  const starts = useMemo(() => {
    let s = 0;
    return pillars.map((p) => {
      const v = s;
      s += p.agents.length;
      return v;
    });
  }, [pillars]);
  const count = flat.length;

  // Harnais d'URL + disposition selon la largeur DU CADRE (pas de la fenetre).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const tq = q.get('t');
    forced.current = tq !== null && !Number.isNaN(Number(tq)) ? clamp01(Number(tq)) : null;
    setPhone(q.get('phone') === '1');
    setMob(window.innerWidth < 768 || 'ontouchstart' in window);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!host.current) return;
    const ro = new ResizeObserver(([e]) => {
      // Toujours DEBOUT, mobile compris (Naim 22/09 : les tours doivent rester
      // verticales sur telephone, plus la disposition couchee). Le dezoom mobile
      // est gere par l'aspect dans readPos.
      void e;
      const l: Layout = 'stand';
      setLayout(l);
      drive.current.layout = l;
    });
    ro.observe(host.current);
    return () => ro.disconnect();
  }, [ready]);

  // Cartes peintes avec les vraies polices, une fois qu'elles sont chargees.
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(async () => {
      // Les vignettes d'abord (celles qui manquent encore donnent null) : la
      // carte est peinte en un seul passage, texte et image ensemble.
      const arts = await Promise.all(pillars.map((p) => Promise.all(p.agents.map((a) => loadImage(a.img)))));
      if (!alive) return;
      const css = getComputedStyle(document.documentElement);
      const fonts: Fonts = {
        sans: css.getPropertyValue('--font-saira').trim() || 'system-ui, sans-serif',
        mono: css.getPropertyValue('--font-mono-display').trim() || 'ui-monospace, monospace',
      };
      setCards(pillars.map((p, i) => p.agents.map((a, j) => makeCard(a, p.hue, fonts, layout === 'lie', arts[i][j]))));
    });
    return () => {
      alive = false;
    };
  }, [pillars, layout]);
  useEffect(() => () => cards.flat().forEach((t) => t.dispose()), [cards]);

  // Signal "scene peinte" pour le gate 2D->3D : une fois les cartes construites
  // (polices + vignettes chargees), la scene a du contenu et on peut basculer.
  useEffect(() => {
    if (onReady && cards.length > 0) onReady();
  }, [cards, onReady]);

  // Scroll -> progression ; montee temporelle des tours debout.
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const loop = () => {
      const el = section.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const span = el.clientHeight - window.innerHeight;
        drive.current.p = forced.current ?? clamp01(span > 0 ? -r.top / span : 0);
        drive.current.reveal = 1; // la montee est pilotee par le scroll (riseOf)
        // Ouverture : le voile de grain et le titre se dissolvent avec le scroll,
        // AVANT que la premiere tour ne parte (22 %). Une chose a la fois.
        const { t } = timeline(drive.current.p, layout, count);
        driveT.current = t;
        // Son unique du marketplace, demande par Naim le 11/09 : plus de son
        // de scroll a chaque depart, UN SEUL a l'apparition des tours — au
        // moment ou la premiere se souleve (0.22 = le meme seuil que riseOf).
        // `sfx.isArmed()` : si le tout premier geste du visiteur est le scroll
        // qui nous amene ici (cas frequent), le son ne peut pas encore jouer —
        // le rattrapage ci-dessus le jouera des que le son sera arme.
        if (!risenSfx.current && t > 0.22 && sfx.isArmed()) {
          risenSfx.current = true;
          sfx.play('scroll');
        }
        if (veil.current) veil.current.style.opacity = String(1 - smooth((t - 0.1) / 0.14));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ready, layout, count]);

  // Ancres legeres : quand le scroll s'immobilise entre deux cartes, on cale sur
  // la plus proche. Jamais pendant l'intro, jamais pendant un calage en cours,
  // jamais si l'on est deja dessus. Scroll natif (Lenis n'est pas branche).
  useEffect(() => {
    if (!ready || forced.current !== null) return;
    let timer = 0;
    let settling = 0;
    const onScroll = () => {
      if (settling && performance.now() < settling) return;
      settling = 0;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const el = section.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const span = el.clientHeight - window.innerHeight;
        if (span <= 0) return;
        const p = -r.top / span;
        const introFrac = INTRO_VH[layout] / (INTRO_VH[layout] + count * STEP_VH[layout]);
        if (p < introFrac || p > 1) return;
        const u = ((p - introFrac) / (1 - introFrac)) * (count - 1);
        const k = Math.round(u);
        if (Math.abs(u - k) < 0.02) return;
        const pk = introFrac + (k / (count - 1)) * (1 - introFrac);
        settling = performance.now() + 900;
        window.scrollTo({ top: window.scrollY + r.top + pk * span, behavior: 'smooth' });
      }, 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  }, [ready, layout, count]);

  // Prise en main : glisser horizontalement fait tourner, la tour revient ensuite.
  useEffect(() => {
    let last = 0;
    const move = (e: PointerEvent) => {
      const d = drive.current;
      if (!d.grabbing) return;
      d.dragOffset += (e.clientX - last) * 0.008;
      last = e.clientX;
    };
    const up = () => {
      drive.current.grabbing = false;
    };
    const set = (x: number) => (last = x);
    (window as unknown as { __twSet?: (x: number) => void }).__twSet = set;
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);
  const grab = (i: number, x: number) => {
    drive.current.grabbing = true;
    drive.current.dragTower = i;
    (window as unknown as { __twSet?: (x: number) => void }).__twSet?.(x);
  };

  /** Saute au premier panneau de la tour i, par le scroll. */
  const jump = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    const span = el.clientHeight - window.innerHeight;
    const introFrac = INTRO_VH[layout] / (INTRO_VH[layout] + count * STEP_VH[layout]);
    const p = introFrac + (starts[i] / (count - 1)) * (1 - introFrac) + 0.002;
    window.scrollTo({ top: top + p * span, behavior: 'smooth' });
  };

  const onHover = (i: number | null) => {
    // La nappe en boucle au survol a ete retiree des tours le 11/09 ("trop
    // de son au niveau des tours") : seul le swoosh de transition (Rig,
    // plus bas) reste au niveau des cards. La nappe catalogue continue de
    // vivre ailleurs (colonnes du marketplace, agents maison) — inchangee.
    drive.current.hover = i ?? -1;
    setHover(i);
    if (host.current) host.current.style.cursor = i === null ? '' : 'grab';
  };
  const onMoveHost = (e: React.PointerEvent) => {
    if (!chip.current || !host.current) return;
    const r = host.current.getBoundingClientRect();
    chip.current.style.transform = `translate(${e.clientX - r.left + 18}px, ${e.clientY - r.top + 18}px)`;
  };

  const activeTower = activeK >= 0 ? flat[activeK].i : -1;
  const activeJ = activeK >= 0 ? flat[activeK].j : -1;
  const reading = activeK >= 0;
  const height = `${INTRO_VH[layout] + count * STEP_VH[layout]}vh`;

  const chipText = hover === null ? '' : hover === activeTower ? "Scrollez sur la tour pour découvrir d'autres agents" : 'Cliquez sur la tour';

  if (!ready) return null;

  const frame = (
    <div
      ref={host}
      onPointerMove={onMoveHost}
      className={`relative overflow-hidden bg-obsidian ${phone ? 'w-[390px] h-[844px] border border-accent/30' : 'h-screen w-full'}`}
    >
      <Canvas
        dpr={mob ? [1, 1] : [1, layout === 'lie' ? 1.5 : 1.75]}
        gl={{ antialias: !mob, powerPreference: 'high-performance' }}
        camera={{ position: [0, 3.5, 40], fov: 40, near: 0.1, far: 400 }}
        style={{ touchAction: 'pan-y' }}
        onPointerMissed={() => onHover(null)}
      >
        <color attach="background" args={['#05080B']} />
        <fog attach="fog" args={['#05080B', 70, 210]} />
        <ambientLight intensity={0.22} />
        <directionalLight position={[14, 40, 22]} intensity={0.55} />
        <directionalLight position={[-18, 16, -12]} intensity={0.22} color="#9FC4CC" />
        <Reflections />
        <Ground layout={layout} />
        {pillars.map((p, i) => (
          <Tower
            key={p.name}
            pillar={p}
            index={i}
            start={starts[i]}
            layout={layout}
            drive={drive}
            cards={cards[i] ?? []}
            count={count}
            onGrab={grab}
            onPick={jump}
            onHover={onHover}
          />
        ))}
        <Rig pillars={pillars} flat={flat} layout={layout} drive={drive} onActive={setActiveK} />
        {/* Bloom desactive sur mobile : le post-processing fait ecran noir sur
            beaucoup de GPU telephone. Sans lui, les tours restent visibles. */}
        {!mob && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.84} luminanceSmoothing={0.35} intensity={0.38} mipmapBlur />
          </EffectComposer>
        )}
      </Canvas>

      {/* Ouverture : ecran vide, titre, voile de grain qui se dissout — puis les
          tours montent une a une au rythme du scroll. Le grain est un motif CSS
          (points radiaux), aucune image a charger. */}
      <div
        ref={veil}
        className="pointer-events-none absolute inset-0 z-[5] bg-obsidian"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(159,196,204,0.10) 1px, transparent 1.6px)',
          backgroundSize: '6px 6px',
        }}
      />
      {/* Indication au curseur : suit le pointeur, change selon la tour. */}
      <div
        ref={chip}
        className="pointer-events-none absolute left-0 top-0 z-10 font-monodisp text-[10px] tracking-[0.22em] uppercase text-obsidian bg-accent px-3 py-2 clip-civ-sm transition-opacity duration-200"
        style={{ opacity: hover === null ? 0 : 1 }}
      >
        {chipText}
      </div>

      {/* Bandeau haut : famille en lecture + compteur. */}
      <div className="pointer-events-none absolute inset-x-0 top-[72px] flex justify-center px-4">
        {reading ? (
          <div className="flex items-center gap-3 bg-obsidian/70 backdrop-blur-md border border-accent/20 px-4 py-2 clip-civ-sm">
            <span className="font-monodisp text-[10px] tracking-[0.28em] uppercase" style={{ color: pillars[activeTower].hue }}>
              {pillars[activeTower].name}
            </span>
            <span className="font-monodisp text-[10px] tracking-[0.22em] uppercase text-aqua/70 tabular-nums">
              {String(activeJ + 1).padStart(2, '0')} / {String(pillars[activeTower].agents.length).padStart(2, '0')}
            </span>
            <span className="font-monodisp text-[9px] tracking-[0.22em] uppercase text-accent/60 animate-bounce">↓ scrollez</span>
          </div>
        ) : (
          <div className="font-monodisp text-[9px] tracking-[0.3em] uppercase text-accent/45 text-center">
            {layout === 'stand' ? 'Défilez : les tours se lèvent, puis chaque agent vient à vous' : 'Défilez pour parcourir les agents de chaque tour'}
          </div>
        )}
      </div>

      {/* Pancartes : trois a l'intro, compactes en lecture ; une seule couchee. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 md:px-8 md:pb-6">
        <div className={`max-w-[1500px] mx-auto grid gap-px ${layout === 'lie' ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {pillars.map((p, i) => {
            if (layout === 'lie' && i !== Math.max(activeTower, 0)) return null;
            const on = i === activeTower;
            const compact = reading || layout === 'lie';
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => jump(i)}
                className={`pointer-events-auto text-left bg-obsidian/72 backdrop-blur-md border transition-colors clip-civ-sm group ${compact ? 'px-4 py-2.5' : 'p-5'}`}
                style={{ borderColor: on ? p.hue : 'rgba(90,212,182,0.15)' }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <div className="font-monodisp text-[9px] tracking-[0.3em] uppercase" style={{ color: p.hue }}>
                      {p.famille}
                    </div>
                    <div className={`font-display font-bold uppercase text-aqua group-hover:text-white transition-colors ${compact ? 'text-base' : 'text-2xl mb-1'}`}>
                      {p.name}
                    </div>
                  </div>
                  {compact && (
                    <div className="font-monodisp text-[9px] tracking-[0.18em] uppercase text-accent/60 whitespace-nowrap">
                      {p.agents.length} agents
                    </div>
                  )}
                </div>
                {!compact && (
                  <>
                    <div className="font-monodisp text-[10px] tracking-[0.18em] uppercase text-accent/70 mb-3">{p.force}</div>
                    <p className="font-monodisp text-[11px] leading-relaxed text-aqua/65">{p.summary}</p>
                  </>
                )}
                {compact && on && (
                  <a
                    href={`#${p.anchor}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 inline-block font-monodisp text-[9px] tracking-[0.18em] uppercase text-accent/50 hover:text-accent"
                  >
                    → colonne complete
                  </a>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <section ref={section} aria-label="Comparaison des trois tours d'agents" className="relative border-y border-accent/15" style={{ height }}>
      <div className={`sticky top-0 h-screen overflow-hidden bg-obsidian ${phone ? 'flex items-center justify-center' : ''}`}>{frame}</div>
    </section>
  );
}

useGLTF.preload(MODEL);
