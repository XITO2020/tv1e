'use client';

/**
 * SfxArmer — arme le moteur son sur TOUTE page (y compris la home) et
 * affiche le bouton SON, sauf sur la home ou l'interface reste nue : elle
 * n'a qu'un seul son, sans reglage visible pour le couper.
 *
 * Regle des navigateurs (non contournable, identique a une video) : aucun
 * son avant un geste de l'utilisateur. L'armement se fait donc au premier
 * clic / touche / frappe n'importe ou sur la page, pas seulement sur ce
 * bouton — voir lib/sfx.ts::armGlobally().
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import * as sfx from '@/lib/sfx';

export default function SfxArmer() {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const [, force] = useState(0);

  useEffect(() => {
    sfx.armGlobally();
    return sfx.subscribe(() => force((n) => n + 1));
  }, []);

  if (onHome) return null;

  const armed = sfx.isArmed();
  const muted = sfx.isMuted();
  const on = armed && !muted;

  const toggle = () => {
    // Avant l'armement, un clic ici veut dire "active", jamais "coupe" —
    // l'armement global (ecouteur capture) a de toute facon deja tourne
    // avant que React ne traite ce clic.
    sfx.setMuted(armed ? !on : false);
    if (armed && !on) sfx.play('menuOpen');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-sfx="none"
      aria-pressed={on}
      aria-label={on ? 'Couper le son' : 'Activer le son'}
      className="fixed bottom-6 left-6 z-[150] inline-flex items-center gap-2.5 bg-obsidian/80 backdrop-blur-md border border-accent/30 hover:border-accent text-accent font-monodisp text-[10px] tracking-[0.22em] uppercase px-3.5 py-2.5 transition-colors clip-civ-sm"
    >
      <span className="relative flex w-2 h-2">
        {on && <span className="absolute inset-0 bg-accent animate-ping opacity-50" />}
        <span className={`relative inline-flex h-2 w-2 ${on ? 'bg-accent' : armed ? 'bg-aqua/30' : 'bg-accent/50 animate-pulse'}`} />
      </span>
      {!armed ? 'Son · cliquez pour activer' : on ? 'Son · on' : 'Son · off'}
    </button>
  );
}
