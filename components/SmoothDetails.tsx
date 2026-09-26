'use client';

/**
 * SmoothDetails — un accordeon qui s'ouvre en glissant, pas d'un coup.
 *
 * Le <details> natif ouvre instantanement. Ici la hauteur est animee par
 * `grid-template-rows: 0fr -> 1fr`, la seule technique CSS qui anime une
 * hauteur inconnue sans mesurer le contenu. Les enfants peuvent etre des
 * composants serveur (les colonnes du marketplace lisent le disque) : ce
 * composant ne les touche pas, il les enveloppe.
 *
 * Un lien vers une ancre situee a l'interieur (#tour-openclaw…) ouvre le
 * panneau puis y descend, une fois la glissade finie.
 */

import { useEffect, useId, useState } from 'react';

export default function SmoothDetails({
  summary,
  meta,
  children,
}: {
  summary: string;
  meta?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  useEffect(() => {
    const reveal = () => {
      const h = window.location.hash.slice(1);
      if (!h) return;
      const target = document.getElementById(h);
      if (!target || !target.closest(`[data-smooth-details="${id}"]`)) return;
      setOpen(true);
      window.setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 720);
    };
    reveal();
    window.addEventListener('hashchange', reveal);
    return () => window.removeEventListener('hashchange', reveal);
  }, [id]);

  return (
    <div data-smooth-details={id} className="border-b border-accent/15">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() =>
          setOpen((o) => {
            // Son d'accordeon (SoundLayer) : deroulement a l'ouverture, clic sec a la fermeture.
            window.dispatchEvent(new CustomEvent('tve:sfx', { detail: { name: o ? 'menuClose' : 'menuOpen' } }));
            return !o;
          })
        }
        data-sfx="none"
        className="group w-full text-left cursor-pointer select-none"
      >
        <div className="max-w-[1500px] mx-auto px-8 py-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="font-monodisp text-accent text-base inline-block transition-transform duration-500 ease-out"
              style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              →
            </span>
            <span className="font-monodisp text-[11px] tracking-[0.28em] uppercase text-aqua group-hover:text-white transition-colors">
              {summary}
            </span>
          </div>
          {meta && (
            <span className="font-monodisp text-[9px] tracking-[0.22em] uppercase text-accent/50 hidden sm:inline">
              {meta}
            </span>
          )}
        </div>
      </button>
      <div
        id={id}
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="min-h-0 overflow-hidden"
          style={{ opacity: open ? 1 : 0, transition: 'opacity 0.45s ease' + (open ? ' 0.2s' : '') }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
