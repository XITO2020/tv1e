import type { Metadata } from 'next';
import Link from 'next/link';
import { existsSync } from 'fs';
import { join } from 'path';
// Donnees GENEREES par agents/_chassis/export_catalogue.py (README + cards.json). Ne pas editer.
import { B2B_AGENTS, type B2BAgent } from '../agents/b2b-agents';

// Page « Les nouveautes de septembre 2026 » (decision Naim 15/09/2026) : une edition mensuelle
// facon jeu de cartes. Chaque carte detaille les proprietes d'un agent pour le vendre :
// portrait photorealiste (public/monthly/<slug>.webp, style eco-tech vert d'eau), type, cinq
// stats, description, capacites, prix plafonne a 1 770 EUR. Les agents 2027 portent la mention
// imposee « En vente en 2027 selon puissance du marche et Qbits ». Page 100 % statique.

export const metadata: Metadata = {
  title: 'Les nouveautés de septembre 2026 : 23 agents',
  description:
    "L'édition de septembre 2026 du catalogue tuveuxun.expert : 10 agents IA prêts à installer chez vous (PME, mairies, grandes structures, associations) et 13 agents d'avant-garde en pré-commande pour 2027. Prix fermes, jamais d'abonnement.",
};

const EDITION = B2B_AGENTS[0]?.edition ?? 'Septembre 2026';
const PLACEHOLDER = '/carousel/_placeholder-agent.webp';
const hasImg = (p: string) => existsSync(join(process.cwd(), 'public', p));
const CARDS = B2B_AGENTS.map((a) => ({ ...a, img: hasImg(a.img) ? a.img : PLACEHOLDER }));
const READY = CARDS.filter((a) => !a.future);
const FUTURE = CARDS.filter((a) => a.future);

const STAT_LABELS: { key: keyof B2BAgent['stats']; label: string; hint: string }[] = [
  { key: 'autonomie', label: 'Autonomie', hint: 'agit seul dans le temps' },
  { key: 'souverainete', label: 'Souveraineté', hint: 'tourne chez vous, sans cloud' },
  { key: 'integration', label: 'Intégration', hint: 'branchements à vos outils' },
  { key: 'impact', label: 'Impact', hint: 'effet cash ou temps attendu' },
  { key: 'installation', label: 'Installation', hint: '1 = une demi-journée, 5 = plusieurs jours' },
];

const ELEMENT_LABEL: Record<string, string> = {
  cash: 'Cash', temps: 'Temps', reseau: 'Réseau', visibilite: 'Visibilité', conformite: 'Conformité',
  citoyen: 'Citoyen', securite: 'Sécurité', terrain: 'Terrain', studio: 'Studio',
};

function Stat({ value, label, hint }: { value: number; label: string; hint: string }) {
  return (
    <div className="flex items-center gap-3" title={hint}>
      <span className="font-monodisp text-[10px] uppercase tracking-[0.18em] text-aqua/60 w-24 shrink-0">{label}</span>
      <span className="flex gap-1 flex-1" aria-label={`${label} ${value} sur 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 ${i <= value ? 'bg-accent' : 'bg-accent/15'}`}
            style={i <= value ? { boxShadow: '0 0 8px rgba(90,212,182,0.55)' } : undefined}
          />
        ))}
      </span>
      <span className="font-monodisp text-[10px] text-accent w-6 text-right">{value}/5</span>
    </div>
  );
}

function Card({ a, index, total }: { a: (typeof CARDS)[number]; index: number; total: number }) {
  return (
    <article
      id={a.slug}
      className="relative flex flex-col bg-carbon/50 border border-accent/25 hover:border-accent/70 transition-colors clip-civ-md scroll-mt-24"
      style={{ background: 'linear-gradient(180deg, rgba(10,26,28,0.9) 0%, rgba(6,14,16,0.98) 100%)' }}
    >
      {/* Portrait */}
      <div className="relative aspect-[2/3] overflow-hidden border-b border-accent/20">
        <img src={a.img} alt={a.name} className="absolute inset-0 w-full h-full object-cover" loading={index < 3 ? 'eager' : undefined} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(4,12,14,0.15) 0%, rgba(4,12,14,0) 35%, rgba(4,12,14,0.85) 100%)' }} />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10 gap-2">
          <span className="font-monodisp text-[10px] text-obsidian tracking-[0.2em] uppercase bg-accent px-2 py-1 font-bold">
            {a.future ? 'Pré-commande 2027' : `Édition ${EDITION}`}
          </span>
          <span className="font-monodisp text-[10px] text-aqua/85 tracking-[0.2em] uppercase bg-obsidian/70 backdrop-blur px-2 py-1 border border-accent/30">
            {String(index + 1).padStart(2, '0')} / {total}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="font-monodisp text-[10px] tracking-[0.25em] uppercase text-accent mb-1">
            {ELEMENT_LABEL[a.element] ?? a.element} · {a.type}
          </div>
          <h2 className="font-display text-2xl lg:text-3xl text-aqua uppercase tracking-tight leading-none">{a.name}</h2>
        </div>
        <span aria-hidden className="absolute top-2 left-2 w-3 h-3 border-t border-l border-accent z-10" />
        <span aria-hidden className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-accent z-10" />
      </div>

      {/* Corps de carte */}
      <div className="p-6 lg:p-7 flex flex-col gap-6 flex-1">
        <p className="font-monodisp italic text-sm text-accent leading-relaxed">{a.pitch}</p>

        <div className="space-y-2">
          {STAT_LABELS.map((s) => (
            <Stat key={s.key} value={a.stats[s.key]} label={s.label} hint={s.hint} />
          ))}
        </div>

        <p className="text-sm text-aqua/80 font-light leading-relaxed">{a.description[0]}</p>

        {a.features.length > 0 && (
          <ul className="space-y-1.5">
            {a.features.slice(0, 3).map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-aqua/80">
                <span className="font-monodisp text-[10px] text-accent mt-1 w-5 shrink-0">0{i + 1}</span>
                <span className="text-[13px] leading-relaxed font-light">{f}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-5 border-t border-accent/20">
          <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-2">Prix</div>
          {a.future ? (
            <div className="font-monodisp text-sm text-aqua leading-relaxed">{a.price}</div>
          ) : (
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-3xl text-aqua">{(a.prix ?? a.prix_souverain) ?? '—'} €</span>
              <span className="font-monodisp text-[10px] uppercase tracking-wider text-aqua/60">
                {a.prix ? `cloud · ${a.prix_souverain} € souverain` : 'souverain, installé chez vous'} · MAJ 120 € / 4 mois · sans abonnement
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            <a
              href={`mailto:tabascocity@proton.me?subject=${encodeURIComponent((a.future ? 'Pré-commande 2027 · ' : 'Démo · ') + a.name)}`}
              className="inline-flex items-center gap-2 bg-accent text-obsidian font-monodisp text-[10px] uppercase tracking-[0.2em] font-bold px-5 py-3 hover:bg-aqua transition-colors clip-civ-sm"
            >
              {a.cta}
              <span className="font-monodisp">→</span>
            </a>
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-2 border border-accent/30 text-aqua font-monodisp text-[10px] uppercase tracking-[0.2em] px-5 py-3 hover:border-accent hover:text-accent transition-colors clip-civ-sm"
            >
              Tarifs
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MonthlyAgentsPage() {
  return (
    <main className="bg-obsidian min-h-screen">
      {/* HERO */}
      <section className="relative pt-40 pb-20 border-b border-accent/15 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(60% 50% at 70% 20%, rgba(90,212,182,0.14) 0%, rgba(90,212,182,0) 70%)' }}
        />
        <div className="max-w-[1400px] mx-auto px-8 relative">
          <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-accent" />
            Édition mensuelle · {EDITION} · {CARDS.length} cartes
          </div>
          <h1 className="display-cyber-h1 text-aqua mb-8">
            LES NOUVEAUTÉS DE<br />
            <span className="grad-volt-mint">SEPTEMBRE 2026.</span>
          </h1>
          <p className="text-base lg:text-lg text-aqua/70 max-w-3xl font-light leading-relaxed mb-8">
            Chaque mois, une nouvelle édition. Celle-ci ouvre le catalogue d'agents déployables : {READY.length} agents
            prêts à installer chez vous, en conteneur, en local ou avec l'API de votre choix, bornés par un périmètre
            écrit, qui ne font rien d'irréversible sans votre validation et mesurent eux-mêmes ce qu'ils améliorent.
            Et {FUTURE.length} cartes d'avant-garde en pré-commande, conçues pour ce que 2027 rendra possible.
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {STAT_LABELS.map((s) => (
              <span key={s.key} className="font-monodisp text-[10px] uppercase tracking-[0.18em] text-aqua/55">
                <span className="text-accent">{s.label}</span> · {s.hint}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-10">
            {CARDS.map((a) => (
              <a
                key={a.slug}
                href={`#${a.slug}`}
                className="font-monodisp text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 border border-accent/25 text-aqua/75 hover:border-accent hover:text-accent transition-colors clip-civ-sm"
              >
                {a.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* PRETS A INSTALLER */}
      <section className="py-24 border-b border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="hud-label mb-6 inline-block">série 01 · prêts à installer</div>
          <h2 className="display-cyber-h2 text-aqua mb-12">
            DIX AGENTS <span className="grad-mint">PRÊTS À INSTALLER</span>.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {READY.map((a, i) => (
              <Card key={a.slug} a={a} index={i} total={CARDS.length} />
            ))}
          </div>
        </div>
      </section>

      {/* AVANT-GARDE 2027 */}
      <section className="py-24 border-b border-accent/15 bg-carbon/30">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="hud-label mb-6 inline-block">série 02 · avant-garde · pré-commande</div>
          <h2 className="display-cyber-h2 text-aqua mb-6">
            TREIZE CARTES <span className="grad-volt">POUR 2027</span>.
          </h2>
          <p className="text-base text-aqua/70 max-w-3xl font-light leading-relaxed mb-12">
            Conçues dès maintenant pour les capacités attendues en 2027 : agents qui travaillent une nuit entière,
            vision et voix temps réel en local, protocoles agent-à-agent et paiements agentiques, portefeuille
            d'identité européen, robots de flotte, et trois extensions MegaStudio. Chaque carte porte la même mention :
            en vente en 2027 selon puissance du marché et Qbits. Les premiers inscrits sont prévenus dès que le
            prérequis technique est réel.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {FUTURE.map((a, i) => (
              <Card key={a.slug} a={a} index={READY.length + i} total={CARDS.length} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-32 bg-obsidian">
        <div className="max-w-[1400px] mx-auto px-8 text-center">
          <div className="hud-label mb-8 inline-block">prochaine édition / octobre 2026</div>
          <h2 className="display-cyber-h2 mb-10">
            <span className="text-aqua">UNE CARTE </span>
            <span className="grad-volt">VOUS MANQUE</span>
            <span className="text-aqua"> ?</span>
          </h2>
          <p className="text-base text-aqua/70 mb-10 max-w-xl mx-auto font-light">
            Décrivez le problème en trois lignes. Si un agent peut le résoudre, il entre dans la prochaine édition.
          </p>
          <Link
            href="/tarifs#rdv"
            className="inline-flex items-center gap-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold px-10 py-5 hover:bg-aqua transition-colors clip-civ-sm"
          >
            Réserver 30 minutes
            <span className="font-monodisp">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
