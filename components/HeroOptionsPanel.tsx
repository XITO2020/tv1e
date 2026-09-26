/**
 * HeroOptionsPanel — le panneau "OPTIONS" du hero home.
 *
 * Extrait en composant a part le 11/09 pour lui donner le son du choix d'un
 * forfait tarifs, a l'epoque ou SoundLayer etait desactive sur la home. Ce
 * n'est plus le cas (meme retour de Naim, meme jour) : SoundLayer route
 * desormais tout le site, et detecte deja `.chrome-hover` -> 'forfait'
 * (classe presente sur ces liens depuis toujours). Plus besoin d'appel
 * direct ici — un onMouseEnter en plus aurait double le son a chaque survol.
 * Redevenu un composant purement presentationnel, pas de 'use client'.
 */

import Link from 'next/link';

const OPTIONS = [
  { n: '01', label: 'Commandez un agent', sub: 'fwd → 3 forfaits', href: '/tarifs#forfaits' },
  { n: '02', label: 'Structure souveraine', sub: 'fwd → setup souverain', href: '/structure-souveraine' },
  { n: '03', label: 'Nos creations de skills', sub: 'fwd → catalogue skills', href: '/skills' },
  { n: '04', label: 'Formez vos equipes', sub: 'fwd → formation 1500/j', href: '/tarifs#formation' },
];

export default function HeroOptionsPanel() {
  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col gap-3 w-[280px]">
      <div className="flex items-center gap-2 mt-1">
        <span className="font-monodisp text-[9px] tracking-[0.3em] uppercase text-accent/60">Options</span>
        <span className="flex-1 h-px bg-accent/20" />
        <span className="font-monodisp text-[9px] text-accent/40">04</span>
      </div>

      {OPTIONS.map((opt) => (
        <Link
          key={opt.n}
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
        </Link>
      ))}

      <div className="flex items-center gap-2 mt-1 pt-1">
        <span className="w-1 h-1 bg-accent/60" />
        <span className="font-monodisp text-[9px] text-accent/40 tracking-[0.25em] uppercase">end_menu</span>
        <span className="flex-1 h-px bg-accent/15" />
      </div>
    </div>
  );
}
