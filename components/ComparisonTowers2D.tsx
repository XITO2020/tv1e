'use client';

/**
 * ComparisonTowers2D — clone ÉCONOMIQUE des tours du marketplace, sans WebGL.
 *
 * Rendu instantané, servi côté SSR : les 3 familles d'agents en 3 colonnes avec
 * leurs cartes (icône, nom, prix, délai, description). C'est la vue par défaut ;
 * le gate (ComparisonTowersLazy) ne charge la scène 3D par-dessus que si
 * l'appareil la supporte (batterie/cœurs/RAM/prefers-reduced-motion). Sur mobile
 * faible, cette vue reste affichée — meilleure lisibilité et zéro conso GPU.
 *
 * Import de type uniquement depuis ComparisonTowers (three.js n'est PAS embarqué).
 */

import Link from 'next/link';
import type { Pillar } from './ComparisonTowers';

export default function ComparisonTowers2D({ pillars }: { pillars: Pillar[] }) {
  const three = pillars.slice(0, 3);
  return (
    <section
      aria-label="Comparaison des trois familles d'agents"
      className="border-y border-accent/15 bg-obsidian py-14 md:py-20"
    >
      <div className="max-w-[1500px] mx-auto px-5 md:px-8">
        <div className="font-monodisp text-[10px] tracking-[0.28em] uppercase text-accent/60 mb-8 text-center">
          Marketplace · trois familles d'agents
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          {three.map((p) => (
            <div
              key={p.name}
              className="flex flex-col bg-carbon/40 border clip-civ-md p-5"
              style={{ borderColor: p.hue + '55' }}
            >
              <div className="font-monodisp text-[10px] tracking-[0.28em] uppercase mb-2" style={{ color: p.hue }}>
                {p.famille}
              </div>
              <h3 className="font-display font-bold uppercase text-2xl text-aqua tracking-tight leading-none mb-2">
                {p.name}
              </h3>
              <div className="font-monodisp text-[10px] tracking-[0.18em] uppercase text-accent/70 mb-2">
                {p.force}
              </div>
              <p className="font-monodisp text-[11px] leading-relaxed text-aqua/65 mb-5">{p.summary}</p>

              <div className="flex flex-col gap-2 flex-1">
                {p.agents.map((a) => (
                  <div key={a.name} className="border border-accent/15 bg-obsidian/60 clip-civ-sm p-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-accent text-sm shrink-0" aria-hidden>{a.icon}</span>
                        <span className="font-monodisp text-[11px] uppercase tracking-wide text-aqua truncate">{a.name}</span>
                      </div>
                      <span className="font-monodisp text-[11px] font-bold whitespace-nowrap" style={{ color: p.hue }}>
                        {a.price}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-aqua/55 font-light line-clamp-2">{a.desc}</p>
                    <div className="mt-1.5 font-monodisp text-[9px] tracking-[0.18em] uppercase text-accent/50">
                      → {a.delivery}
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={`#${p.anchor}`}
                className="mt-4 inline-block font-monodisp text-[10px] tracking-[0.2em] uppercase text-accent hover:text-aqua transition-colors"
              >
                → colonne complète
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center font-monodisp text-[9px] tracking-[0.22em] uppercase text-aqua/35">
          Vue économique · l'animation 3D se charge sur les appareils qui la supportent
        </p>
      </div>
    </section>
  );
}
