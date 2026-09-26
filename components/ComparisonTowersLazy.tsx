'use client';

/**
 * Gate 2D -> 3D des tours du marketplace.
 *
 * Problème résolu : sur mobile à faible batterie, la scène three.js chargeait
 * difficilement (contexte WebGL bridé/tué par l'économie d'énergie). Ici :
 *
 *  1. Le clone 2D (ComparisonTowers2D) est rendu PAR DÉFAUT, dès le SSR :
 *     instantané, lisible, zéro WebGL. Aucun trou noir, aucune attente.
 *  2. La scène 3D n'est chargée QUE si l'appareil la supporte : on écarte
 *     prefers-reduced-motion (déclenché par l'économie d'énergie), les appareils
 *     à peu de cœurs/RAM, l'absence de WebGL, et la batterie basse non branchée.
 *     Sur ces appareils, on RESTE sur le clone 2D — ça économise vraiment.
 *  3. Si l'appareil suit et que la section approche du viewport, la 3D est montée
 *     cachée (display:none) : ses textures de cartes se construisent hors-écran
 *     (canvas 2D, indépendant du WebGL). Quand elle signale `onReady`, on bascule
 *     D'UN COUP sur la 3D (le clone 2D disparaît).
 *  4. Filet de sécurité : si la 3D ne devient pas prête sous 15 s, on la démonte
 *     et on reste sur le clone 2D.
 *
 * La page marketplace reste un composant serveur ; ce fragment client porte la
 * logique et le chargement différé de three.js.
 */

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Pillar } from './ComparisonTowers';
import ComparisonTowers2D from './ComparisonTowers2D';

const ComparisonTowers3D = dynamic(() => import('./ComparisonTowers'), {
  ssr: false,
  loading: () => null, // le clone 2D reste visible pendant le fetch du chunk
});

/** Appareil jugé apte à faire tourner la scène 3D sans ramer. */
function deviceCapable(): boolean {
  if (typeof window === 'undefined') return false;
  // Mobile / tablette portrait : on garde le clone 2D (cartes lisibles). Trois
  // tours debout sur un écran étroit = illisible (Naim 22/09). 3D = desktop ≥ 1024.
  if (window.innerWidth < 1024) return false;
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  } catch {
    /* matchMedia indisponible : on continue */
  }
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory > 0 && nav.deviceMemory < 4) return false;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency < 4) return false;
  try {
    const c = document.createElement('canvas');
    if (!c.getContext('webgl2') && !c.getContext('webgl')) return false;
  } catch {
    return false;
  }
  return true;
}

export default function ComparisonTowersGate({ pillars }: { pillars: Pillar[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [load3d, setLoad3d] = useState(false); // 3D montée (cachée) et en cours d'init
  const [show3d, setShow3d] = useState(false); // 3D prête -> on bascule dessus

  // Décision : appareil apte + batterie ok -> on arme un observer qui charge la
  // 3D quand la section approche.
  useEffect(() => {
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    const arm = () => {
      if (cancelled || !deviceCapable()) return; // appareil faible -> reste en 2D
      const el = hostRef.current;
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              io.disconnect();
              setLoad3d(true);
            }
          }
        },
        { rootMargin: '250px 0px' },
      );
      io.observe(el);
      cleanups.push(() => io.disconnect());
    };

    const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number; charging: boolean }> };
    if (nav.getBattery) {
      nav
        .getBattery()
        .then((b) => {
          // Batterie basse et non branchée -> on reste en 2D (économie réelle).
          if (b.charging || b.level > 0.2) arm();
        })
        .catch(arm);
    } else {
      arm();
    }

    return () => {
      cancelled = true;
      cleanups.forEach((f) => f());
    };
  }, []);

  // Filet : si la 3D ne signale pas "prête" sous 15 s, on la démonte -> 2D.
  useEffect(() => {
    if (!load3d || show3d) return;
    const t = window.setTimeout(() => setLoad3d(false), 15000);
    return () => window.clearTimeout(t);
  }, [load3d, show3d]);

  return (
    <div ref={hostRef} className="relative">
      {!show3d && <ComparisonTowers2D pillars={pillars} />}
      {load3d && (
        <div style={{ display: show3d ? 'block' : 'none' }}>
          <ComparisonTowers3D pillars={pillars} onReady={() => setShow3d(true)} />
        </div>
      )}
    </div>
  );
}
