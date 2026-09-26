'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

// INDEX (01) n'est plus un lien : c'est le logo a gauche qui EST l'index et
// affiche « 01 INDEX » au survol. Les autres suivent donc a partir de 02.
const links = [
  { href: '/tarifs', label: 'TARIFS' },
  { href: '/marketplace', label: 'MARKETPLACE' },
  { href: '/a-propos', label: 'A PROPOS' },
  { href: '/monthly-agents', label: 'NEW AGENTS' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Referme le menu mobile a chaque changement de page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-[1320px]">
      {/* Outer frame with corner brackets — Civ Beyond Earth panel */}
      <div className="relative">
        {/* Corner brackets */}
        <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent/60" />
        <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t border-r border-accent/60" />
        <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-accent/60" />
        <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent/60" />

        {/* Main panel — clip-path notched corners */}
        <div
          className="flex items-stretch justify-between bg-obsidian/40 backdrop-blur-2xl border border-accent/15 clip-civ-md"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(90, 212, 182, 0.04)',
          }}
        >
          {/* Logo block */}
          <Link
            href="/"
            className="chrome-hover group flex items-center gap-3 pl-6 pr-8 py-3 border-r border-accent/15 hover:bg-accent/5 transition-colors"
          >
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 bg-accent animate-ping opacity-50" />
              <span className="relative inline-flex h-2 w-2 bg-accent" />
            </span>
            {/* Nom par defaut, remplace par « 01 INDEX » au survol (desktop).
                Les deux couches sont superposees : la largeur reste celle du nom
                pour ne pas faire sauter la barre. */}
            <span className="relative font-monodisp text-[11px] font-medium tracking-[0.18em] uppercase">
              <span className="text-aqua transition-opacity duration-200 md:group-hover:opacity-0">
                tuveuxun<span className="text-accent">.expert</span>
              </span>
              <span
                aria-hidden
                className="hidden md:flex absolute inset-0 items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap"
              >
                <span className="text-accent/70">01</span>
                <span className="text-aqua">INDEX</span>
              </span>
            </span>
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-stretch flex-1 justify-center">
            {links.map((link, idx) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'chrome-hover group relative flex items-center gap-2 px-6 transition-colors font-monodisp text-[11px] tracking-[0.22em]',
                  pathname === link.href
                    ? 'text-accent bg-accent/10'
                    : 'text-aqua/60 hover:text-aqua hover:bg-accent/5',
                  idx > 0 && 'border-l border-accent/15'
                )}
              >
                <span className="font-monodisp text-[9px] text-accent/50 group-hover:text-accent transition-colors">
                  {String(idx + 2).padStart(2, '0')}
                </span>
                {link.label}
                {pathname === link.href && (
                  <span aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-px bg-accent" />
                )}
              </Link>
            ))}
          </nav>

          {/* Burger — mobile uniquement */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            className="md:hidden chrome-hover flex flex-col items-center justify-center gap-1.5 px-5 border-l border-accent/15 hover:bg-accent/5 transition-colors"
          >
            <span className={clsx('block w-5 h-px bg-aqua transition-transform duration-300', open && 'translate-y-[7px] rotate-45')} />
            <span className={clsx('block w-5 h-px bg-aqua transition-opacity duration-300', open && 'opacity-0')} />
            <span className={clsx('block w-5 h-px bg-aqua transition-transform duration-300', open && '-translate-y-[7px] -rotate-45')} />
          </button>

          {/* CTA — angular notched corner */}
          <Link
            href="#rdv"
            className="chrome-hover group flex items-center gap-2 pl-5 pr-6 py-3 bg-accent/10 hover:bg-accent/20 border-l border-accent/30 transition-colors text-accent font-monodisp text-[11px] tracking-[0.18em] uppercase"
          >
            <span>RDV</span>
            <span className="font-monodisp">→ 30min</span>
          </Link>
        </div>

        {/* Menu deroulant mobile */}
        <nav
          className={clsx(
            'md:hidden absolute left-0 right-0 top-[calc(100%+8px)] origin-top bg-obsidian/95 backdrop-blur-2xl border border-accent/20 clip-civ-md overflow-hidden transition-all duration-300',
            open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-0 pointer-events-none'
          )}
        >
          {links.map((link, idx) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-6 py-4 font-monodisp text-[12px] tracking-[0.22em] transition-colors',
                idx > 0 && 'border-t border-accent/10',
                pathname === link.href ? 'text-accent bg-accent/10' : 'text-aqua/70 hover:text-aqua hover:bg-accent/5'
              )}
            >
              <span className="font-monodisp text-[9px] text-accent/50">{String(idx + 2).padStart(2, '0')}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
