'use client';

/**
 * MEGASTUDIO — bloc homepage, sous le carousel d'agents.
 *
 * Deux portes de sortie :
 *  - "Faire installer en local" ouvre en accordeon le configurateur ci-dessous ;
 *  - "Voir la totalite du catalogue" mene au marketplace.
 *
 * Le configurateur est "liquide" : on compose son studio module par module et
 * le total se recalcule. Les agents sur mesure ne portent pas de prix et
 * basculent le total en "sur devis" — un devis ne se chiffre pas tout seul.
 *
 * ⚠ PRIX (revus le 02/09) : l'ancienne grille (4 500 + 1 500) demandait 5 ans
 * pour battre un abonnement cloud a 100 EUR/mois — invendable. On ne facture
 * plus une licence (la stack est open source) mais l'integration et la prise en
 * main. Seul le socle a 1 500 EUR vient de la grille reelle de /tarifs ; les
 * autres montants sont des PROPOSITIONS marquees `aValider: true`.
 */

import { useState } from 'react';
import Link from 'next/link';

type Module = {
  id: string;
  name: string;
  desc: string;
  price: number | null; // null = sur devis
  base?: boolean; // socle non decochable
  aValider?: boolean; // montant propose, pas encore valide
};

const MODULES: Module[] = [
  {
    // Le socle a 4 500 EUR ne tenait pas face a un abonnement cloud a 100 EUR/mois
    // (5 ans de retour). On ne vend pas un logiciel — la stack est open source —
    // on vend l'integration et la prise en main. Le prix suit ce qu'on apporte
    // vraiment : du temps d'expert, pas une licence.
    id: 'socle',
    name: 'Studio essentiel',
    desc: "Image, video, montage. Installe, configure a vos usages, et 10 h de prise en main. Production illimitee des le premier jour.",
    price: 1500,
    base: true,
  },
  {
    id: 'sound',
    name: 'Son — Sound-Cortex',
    desc: 'Musique, doublage, audiobook, effets sonores.',
    price: 600,
    aValider: true,
  },
  {
    id: 'voice',
    name: 'Voix — VoiceBox',
    desc: 'Synthese vocale et clonage. Aucune voix ne sort du poste.',
    price: 600,
    aValider: true,
  },
  {
    id: 'hyperframes',
    name: 'Habillage — HyperFrames',
    desc: 'Titres animes, sous-titres synchronises, transitions.',
    price: 500,
    aValider: true,
  },
  {
    id: 'moderation',
    name: 'Moderation — Cortex Vision',
    desc: 'Filtrage avant publication, des que plusieurs mains produisent.',
    price: 600,
    aValider: true,
  },
  {
    // Reponse a l'objection "la tech est obsolete en six mois" — SANS abonnement
    // (decision Naim 02/09 : le "suivi annuel" etait un abo deguise, retire).
    // Le studio PROPOSE lui-meme une mise a jour tous les 4 mois ; le client
    // l'accepte ou non, a l'acte. Rien de preleve. Refuser ne degrade rien.
    // Ce n'est pas une option qu'on coche : c'est une propriete du produit,
    // affichee ici pour l'annoncer. Prix a l'acte, hors total.
    id: 'evolution',
    name: 'Auto-evolution incluse',
    desc: "Tous les 4 mois, votre studio vous propose sa mise a jour (nouveaux modeles, corrections). Vous acceptez ou non : 120 EUR a l'acte, jamais preleve. Si vous refusez, il continue tel quel.",
    price: 0,
    base: true,
  },
  {
    id: 'custom',
    name: 'Agents sur mesure',
    desc: 'Un besoin que rien ne couvre ? On fabrique l’agent dedie, integre au studio.',
    price: null,
  },
];

/**
 * Prerequis machine. Les seuils VRAM viennent des modeles reellement utilises :
 * Wan 2.2 tourne des 8 Go en 5B quantifie, LTX-2.5 en 10 Go, Wan 3.0 14B reclame
 * 24 Go. Les couts cloud sont des ordres de grandeur a confirmer au devis :
 * ils dependent du fournisseur et de la duree d'engagement.
 */
const SETUPS = [
  {
    k: 'Local · entree',
    specs: ['GPU 12 Go VRAM', '32 Go RAM', '500 Go SSD NVMe'],
    d: "Image et video courtes en definition standard. Le socle tourne, les rendus sont juste plus lents.",
    cout: 'materiel existant ou ~1 500 EUR',
  },
  {
    k: 'Local · confort',
    specs: ['GPU 16 a 24 Go VRAM', '64 Go RAM', '1 To SSD NVMe'],
    d: 'Le bon point : video HD, son et image en parallele, plusieurs modeles charges sans jonglage.',
    cout: 'poste dedie ~2 500 a 3 500 EUR',
    star: true,
  },
  {
    k: 'Cloud souverain',
    specs: ['GPU 24 Go et plus', 'VPS ou serveur dedie', 'stockage selon volume'],
    d: "Chez un hebergeur francais ou europeen. Aucun materiel a acheter, vous coupez quand vous ne produisez pas.",
    cout: 'a partir de ~250 EUR / mois',
  },
];

const PILIERS = [
  ['Image', 'Generation et retouche locales, styles maison'],
  ['Video', 'Wan, LTX, MiniMax — clips produits sur place'],
  ['Voix', 'Synthese et clonage, moteurs sous licence libre'],
  ['Montage', 'Assemblage programmatique, rendu reproductible'],
];

const euro = (n: number) => n.toLocaleString('fr-FR');

export default function MegaStudioBlock() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>(['socle', 'evolution']);

  const toggle = (m: Module) => {
    if (m.base) return; // le socle ne se retire pas
    setPicked((p) => (p.includes(m.id) ? p.filter((x) => x !== m.id) : [...p, m.id]));
  };

  const chosen = MODULES.filter((m) => picked.includes(m.id));
  const surDevis = chosen.some((m) => m.price === null);
  const total = chosen.reduce((s, m) => s + (m.price ?? 0), 0);

  return (
    <section className="relative py-28 border-t border-accent/15 bg-obsidian">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="hud-label mb-6">produit lie · tabascocity</div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <h2 className="display-cyber-h2 text-aqua mb-6">
              LE MEGASTUDIO.<br />
              <span className="grad-volt">TOUT SE PRODUIT ICI.</span>
            </h2>
            <p className="text-[15px] text-aqua/70 font-light leading-relaxed mb-5">
              Image, video, voix, montage : la chaine complete tourne sur une seule machine,
              sans abonnement et sans qu&apos;un fichier quitte le poste. C&apos;est le studio qui
              produit nos propres visuels — celui-la meme dont sortent les vignettes de ce site
              et ses sequences animees.
            </p>
            <p className="text-[15px] text-aqua/70 font-light leading-relaxed mb-8">
              Il est integre a TabascoCity, ou les creations peuvent etre publiees et valorisees.
              Nous l&apos;installons chez vous, avec vos modeles et votre direction artistique.
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="megastudio-config"
                className="chrome-hover-light inline-flex items-center gap-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-medium px-8 py-4 hover:bg-aqua transition-colors clip-civ-sm"
              >
                <span className="w-1 h-1 bg-obsidian" />
                Faire installer en local
                <span className={`transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
              </button>
              <Link
                href="/marketplace"
                className="chrome-hover inline-flex items-center gap-3 border border-accent/40 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-8 py-4 hover:border-accent hover:text-accent transition-colors clip-civ-sm"
              >
                Voir la totalite du catalogue d&apos;agents
                <span className="font-monodisp">→</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 gap-px bg-accent/15">
            {PILIERS.map(([t, d]) => (
              <div key={t} className="bg-obsidian p-6">
                <div className="font-monodisp text-[11px] text-accent uppercase tracking-[0.2em] mb-2">{t}</div>
                <div className="text-[15px] text-aqua/70 font-light leading-relaxed">{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Accordeon : composez votre studio ─────────────────────────── */}
        <div
          id="megastudio-config"
          className="overflow-hidden transition-[max-height,opacity] duration-700 ease-out"
          style={{ maxHeight: open ? 3400 : 0, opacity: open ? 1 : 0 }}
        >
          <div className="mt-14 pt-10 border-t border-accent/25">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-3">
              <h3 className="display-cyber-h2 text-aqua" style={{ fontSize: 'clamp(22px, 2.4vw, 34px)' }}>
                COMPOSEZ VOTRE STUDIO.
              </h3>
              <span className="font-monodisp text-[10px] tracking-[0.25em] uppercase text-accent/60">
                installation · formation · sur mesure
              </span>
            </div>
            <p className="text-[15px] text-aqua/65 font-light leading-relaxed max-w-2xl mb-10">
              Le studio essentiel suffit a produire, sans limite de volume. Les modules s&apos;ajoutent
              quand le besoin arrive — jamais avant. Tout reste sur vos machines.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULES.map((m) => {
                const on = picked.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggle(m)}
                    disabled={m.base}
                    aria-pressed={on}
                    className={`group text-left p-6 border transition-all clip-civ-sm ${
                      on
                        ? 'border-accent/70 bg-accent/10'
                        : 'border-accent/20 bg-carbon/30 hover:border-accent/50 hover:bg-carbon/60'
                    } ${m.base ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span className="font-monodisp text-[13px] text-aqua uppercase tracking-[0.16em]">
                        {m.name}
                      </span>
                      <span className="font-monodisp text-[13px] text-accent shrink-0">
                        {m.id === 'evolution'
                          ? "120 € a l'acte"
                          : m.price === null
                            ? 'sur devis'
                            : `${euro(m.price)} €`}
                      </span>
                    </div>
                    <p className="text-[14px] text-aqua/65 font-light leading-relaxed">{m.desc}</p>
                    <div className="mt-4 font-monodisp text-[10px] uppercase tracking-[0.2em] text-ash">
                      {m.id === 'evolution' ? 'propriete du produit · hors total' : m.base ? 'inclus · non optionnel' : on ? '— retirer' : '+ ajouter'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Prerequis machine — la question qui vient toujours ensuite */}
            <div className="mt-12 pt-10 border-t border-accent/25">
              <div className="flex flex-wrap items-baseline justify-between gap-4 mb-3">
                <h4 className="font-monodisp text-[13px] text-accent uppercase tracking-[0.2em]">
                  Ou le faire tourner
                </h4>
                <span className="font-monodisp text-[10px] tracking-[0.2em] uppercase text-ash">
                  local ou cloud souverain
                </span>
              </div>
              <p className="text-[15px] text-aqua/65 font-light leading-relaxed max-w-2xl mb-8">
                Le studio tourne chez vous, sur une machine que vous possedez ou louez. Si vous
                n&apos;avez pas le materiel, un serveur europeen fait le travail et se coupe quand
                vous ne produisez pas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-accent/15">
                {SETUPS.map((sp) => (
                  <div
                    key={sp.k}
                    className={`bg-obsidian p-7 ${sp.star ? 'ring-1 ring-inset ring-accent/40' : ''}`}
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-4">
                      <span className="font-monodisp text-[12px] text-accent uppercase tracking-[0.18em]">
                        {sp.k}
                      </span>
                      {sp.star && (
                        <span className="font-monodisp text-[9px] text-obsidian bg-accent px-2 py-0.5 uppercase tracking-[0.15em]">
                          conseille
                        </span>
                      )}
                    </div>
                    <ul className="mb-4 space-y-1">
                      {sp.specs.map((x) => (
                        <li key={x} className="font-monodisp text-[12px] text-aqua/80">
                          <span className="text-accent">-</span> {x}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[14px] text-aqua/65 font-light leading-relaxed mb-4">{sp.d}</p>
                    <div className="font-monodisp text-[11px] text-aqua/50 uppercase tracking-[0.15em]">
                      {sp.cout}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 font-monodisp text-[10px] text-ash tracking-[0.15em] uppercase leading-relaxed">
                Couts materiel et cloud donnes a titre indicatif, precises au devis. Nous auditons
                votre parc avant toute recommandation : souvent, la machine est deja la.
              </p>
            </div>

            {/* Total */}
            <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-accent/25 pt-8">
              <div>
                <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent/60 mb-2">
                  Votre configuration · {chosen.length} module{chosen.length > 1 ? 's' : ''}
                </div>
                <div className="display-cyber-h2 text-aqua" style={{ fontSize: 'clamp(34px, 5vw, 64px)', lineHeight: 1 }}>
                  {surDevis ? (
                    <>
                      {euro(total)} <span className="text-accent">€</span>
                      <span className="font-monodisp text-base text-aqua/60"> + sur devis</span>
                    </>
                  ) : (
                    <>
                      {euro(total)} <span className="text-accent">€</span>
                    </>
                  )}
                </div>
                <div className="font-monodisp text-xs text-aqua/50 mt-3">
                  HT · installation et 10 h de formation comprises · production illimitee · aucun abonnement, jamais
                </div>
              </div>

              <Link
                href="/tarifs#rdv"
                className="chrome-hover-light inline-flex items-center gap-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-medium px-8 py-4 hover:bg-aqua transition-colors clip-civ-sm"
              >
                <span className="w-1 h-1 bg-obsidian" />
                Cadrer cette configuration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
