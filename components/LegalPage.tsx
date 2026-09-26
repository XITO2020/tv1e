/**
 * LegalPage — gabarit commun des pages légales (mentions légales, confidentialité,
 * CGV, CGU). Composant SERVEUR (pas de 'use client') : chaque page reste statique
 * et porte sa propre metadata. Style sobre, aligné sur l'obsidian/accent du site.
 *
 * Les valeurs à confirmer par Naim sont marquées « [À COMPLÉTER] » dans les pages.
 */
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main className="bg-obsidian min-h-screen text-aqua">
      <section className="pt-40 pb-16 border-b border-accent/15">
        <div className="max-w-[860px] mx-auto px-6">
          <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-5 flex items-center gap-3">
            <span className="w-8 h-px bg-accent" />
            Légal
          </div>
          <h1 className="display-cyber-h2 text-aqua mb-4">{title}</h1>
          <div className="font-monodisp text-[10px] tracking-[0.22em] uppercase text-aqua/40">
            Dernière mise à jour : {updated}
          </div>
          {intro && <p className="mt-6 text-base text-aqua/70 font-light leading-relaxed max-w-2xl">{intro}</p>}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[860px] mx-auto px-6 space-y-10">{children}</div>
      </section>

      <section className="pb-24">
        <div className="max-w-[860px] mx-auto px-6 flex flex-wrap gap-x-6 gap-y-2 font-monodisp text-[10px] tracking-[0.2em] uppercase text-aqua/45">
          <Link href="/mentions-legales" className="hover:text-accent transition-colors">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:text-accent transition-colors">Confidentialité</Link>
          <Link href="/cgv" className="hover:text-accent transition-colors">CGV</Link>
          <Link href="/cgu" className="hover:text-accent transition-colors">CGU</Link>
          <Link href="/" className="hover:text-accent transition-colors">Accueil</Link>
        </div>
      </section>
    </main>
  );
}

/** Sous-titre de section, style commun. */
export function LegalH2({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-xl text-aqua font-medium uppercase tracking-tight mb-3">{children}</h2>;
}

/** Paragraphe de corps, style commun. */
export function LegalP({ children }: { children: ReactNode }) {
  return <p className="text-sm lg:text-[15px] text-aqua/75 font-light leading-relaxed">{children}</p>;
}
