'use client';

/**
 * SoundLayer — routage des sons de survol/clic, sur TOUTES les pages.
 *
 * Le moteur lui-meme (armement, decodage, lecture) vit dans lib/sfx.ts.
 * Ici on ne fait QUE le routage :
 *   survol nav / aside ........ nav
 *   survol carte forfait ...... forfait   (.wave-hover, .chrome-hover)
 *   survol catalogue .......... catalogue (nappe en boucle, fondu entree/sortie)
 *   autres liens & boutons .... link (bas volume)
 *   accordeon ouvre / ferme ... menuOpen / menuClose (evenement tve:sfx)
 *   Tv1E / FAQ ouvre / ferme ... botOpen / botClose
 *   arrivee sur une page ...... launch
 *
 * 11/09/2026 (retour de Naim) : le son de scroll generique a chaque depart de
 * defilement a ete RETIRE — trop present. Il ne reste que deux occurrences de
 * "scroll" dans tout le site, chacune une seule fois par visite : la home au
 * demarrage de son defile de cartes en profondeur (AgentWorld.tsx, appel
 * direct a lib/sfx.ts) et le marketplace a l'apparition des tours
 * (ComparisonTowers.tsx). Aucune des deux ne passe par ce composant.
 *
 * 11/09/2026, meme jour (retour suivant) : la home avait ete EXCLUE de tout
 * ce routage — seuls les 4 boutons OPTIONS du hero et le son de traversee
 * marchaient, navbar et reste muets. Naim a confirme vouloir le meme routage
 * partout, home comprise ; le garde-fou `onHome` est retire des deux effets
 * ci-dessous. Rien d'autre ne change : c'est litteralement le meme routage
 * qui tournait deja sur les pages secondaires.
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import * as sfx from '@/lib/sfx';
import type { Sfx } from '@/lib/sfx';

export default function SoundLayer() {
  const pathname = usePathname();
  const lastTarget = useRef<Element | null>(null);
  const lastHover = useRef(0);
  const firstMount = useRef(true);

  // Arrivee sur une page (navigation interne, pas le tout premier chargement
  // du site — le premier geste arme deja le moteur, pas besoin d'un doublon
  // sonore avant meme que l'armement soit termine).
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    sfx.play('launch');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const over = (ev: PointerEvent) => {
      const t = ev.target as Element | null;
      if (!t) return;
      const el =
        t.closest<HTMLElement>('[data-sfx]') ??
        t.closest<HTMLElement>('header a, header button, aside a, aside button') ??
        t.closest<HTMLElement>('.wave-hover, .chrome-hover') ??
        t.closest<HTMLElement>('a, button, [role="button"]');
      if (!el || el === lastTarget.current) return;
      lastTarget.current = el;
      if ((el as HTMLButtonElement).disabled) return;
      const tag = el.dataset.sfx;
      if (tag === 'none') return;
      const now = performance.now();
      if (now - lastHover.current < 70) return; // deux survols dans la meme frame = un seul blip
      lastHover.current = now;
      if (tag === 'catalogue') {
        sfx.loopStart('catalogue');
        return;
      }
      // Le footer n'a plus de son dedie (retire le 11/09, cf. lib/sfx.ts) :
      // ses liens retombent sur 'link', comme le reste des boutons non tagges.
      let k: Sfx = 'link';
      if (tag && tag in sfx.FILES) k = tag as Sfx;
      else if (el.closest('header, aside')) k = 'nav';
      else if (el.matches('.wave-hover, .chrome-hover')) k = 'forfait';
      sfx.play(k, 0.94 + Math.random() * 0.12);
    };
    const out = (ev: PointerEvent) => {
      const t = ev.target as Element | null;
      const el = t?.closest<HTMLElement>('[data-sfx="catalogue"]');
      if (!el) return;
      const to = ev.relatedTarget as Element | null;
      if (to && el.contains(to)) return;
      lastTarget.current = null;
      sfx.loopStop('catalogue');
    };
    const click = (ev: MouseEvent) => {
      const t = ev.target as Element | null;
      if (!t) return;
      if (t.closest('button[aria-label^="Ouvrir le chat"], button[aria-label^="Ouvrir la FAQ"]')) sfx.play('botOpen');
      else if (t.closest('button[aria-label="Fermer"], button[aria-label^="Fermer le chat"]')) sfx.play('botClose');
    };
    const custom = (ev: Event) => {
      const d = (ev as CustomEvent<{ name: Sfx; loop?: boolean; on?: boolean; rate?: number }>).detail;
      if (!d || !(d.name in sfx.FILES)) return;
      if (d.loop) (d.on === false ? sfx.loopStop(d.name) : sfx.loopStart(d.name));
      else sfx.play(d.name, d.rate ?? 1);
    };

    document.addEventListener('pointerover', over, { passive: true });
    document.addEventListener('pointerout', out, { passive: true });
    document.addEventListener('click', click, true);
    window.addEventListener('tve:sfx', custom);
    return () => {
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerout', out);
      document.removeEventListener('click', click, true);
      window.removeEventListener('tve:sfx', custom);
      sfx.loopStop('catalogue');
    };
  }, []); // routage identique sur toutes les pages : montee une seule fois.

  return null;
}
