'use client';

/**
 * Revelation au scroll — page Tarifs.
 *
 * Un IntersectionObserver unique par instance, qui se DECONNECTE apres le
 * premier passage : pas de listener de scroll, aucun cout une fois l'element
 * revele. `delay` permet de cascader plusieurs elements d'une meme rangee.
 *
 * Respecte prefers-reduced-motion : contenu affiche immediatement.
 */

import { useEffect, useRef, useState } from 'react';

type Dir = 'up' | 'left' | 'right' | 'none';

const OFFSET: Record<Dir, string> = {
  up: 'translate3d(0, 38px, 0)',
  left: 'translate3d(-42px, 0, 0)',
  right: 'translate3d(42px, 0, 0)',
  none: 'none',
};

export default function Reveal({
  children,
  dir = 'up',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  dir?: Dir;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : OFFSET[dir],
        transition: `opacity 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 1100ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: shown ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
