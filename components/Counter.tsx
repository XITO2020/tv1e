'use client';

/**
 * Compteur qui s'incremente tout seul a l'entree dans le viewport.
 *
 * Deux details qui font la difference entre "un chiffre qui monte" et un
 * compteur de machine :
 *  - `tabular-nums` : les chiffres gardent tous la meme largeur, sinon le
 *    texte qui suit tremble a chaque increment.
 *  - un leger sur-defilement (overshoot) avant de se caler sur la valeur,
 *    comme un afficheur mecanique qui se stabilise.
 *
 * Respecte prefers-reduced-motion : affichage direct de la valeur finale.
 */

import { useEffect, useRef, useState } from 'react';

export default function Counter({
  to,
  pad = 4,
  duration = 1900,
}: {
  to: number;
  pad?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(to);
      return;
    }

    let raf = 0;
    let started = false;

    const run = (t0: number) => {
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / duration);
        // Ease-out fort + oscillation amortie : l'afficheur depasse puis se cale
        const ease = 1 - Math.pow(1 - k, 4);
        const wobble = k < 1 ? Math.sin(k * Math.PI * 3) * (1 - k) * 0.035 : 0;
        setN(Math.max(0, Math.round(to * (ease + wobble))));
        raf = k < 1 ? requestAnimationFrame(tick) : 0;
        if (k >= 1) setN(to);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started) {
            started = true;
            run(performance.now());
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {String(n).padStart(pad, '0')}
    </span>
  );
}
