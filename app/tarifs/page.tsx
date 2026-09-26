'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

// Plongee oceanique : houle Three.js + revelations au scroll (02/09).
const OceanWaves = dynamic(() => import('@/components/OceanWaves'), { ssr: false });
import Reveal from '@/components/Reveal';

const EditorialSculpture = dynamic(() => import('@/components/EditorialSculpture'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-tealNight" />,
});

// Formulaires internes RDV + formation (11/09) — plus de mailto qui ouvre le
// client mail externe, cf. components/BookingModal.tsx.
import BookingModal, { type BookingKind } from '@/components/BookingModal';

// Backend FastAPI (chatbot + billing Stripe) — meme service que le bot.
const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL || 'http://127.0.0.1:8001';

const forfaits = [
  {
    n: '01',
    name: 'Diagnostic IA',
    offerId: 'audit-ia',
    target: 'TPE / PME / asso curieuse mais hesitante',
    price: '690',
    duration: 'forfait · 1 jour',
    features: [
      "2h interview equipe + immersion processus",
      "Cartographie 5 a 10 taches automatisables",
      "ROI estime par tache (heures/mois)",
      "Demo d'un agent souverain live sur VOS donnees, pas une maquette",
      "Plan chiffre · deductible d'un forfait signe sous 30 jours",
    ],
    cta: 'Demander un devis',
  },
  {
    n: '02',
    name: 'Agent metier',
    offerId: 'agent-metier',
    target: 'Structure avec 1 process clair a automatiser',
    price: '1 900',
    duration: 'forfait · 3 jours',
    features: [
      "Agent metier (Claude, OpenClaw ou Mistral) deploye chez vous",
      "1 skill pack metier eprouve, teste sur vos cas reels",
      "Connexion 2 outils existants (mail, docs, CRM)",
      "2h prise en main avec votre equipe",
      "30 jours de support inclus · evolution 120 € / 4 mois, sans abonnement",
    ],
    cta: 'Reserver ce forfait',
    featured: true,
  },
  {
    n: '03',
    name: 'Agent souverain sur mesure',
    offerId: 'agent-souverain',
    target: 'Mairies, cabinets juridiques/sante, donnees sensibles',
    price: '2 700',
    duration: 'forfait · 5 jours',
    features: [
      "Audit hardware + la voie adaptee (OpenClaw, Hermes ou Ollama) installee sur VOTRE serveur",
      "Agent auto-evolutif : apprend de vos usages, memoire locale, 0 donnee sortante",
      "2 skill packs metier + 1 canal (mail, Teams, WhatsApp, SMS...)",
      "Formation 2h · 60 jours de support inclus",
      "Machine du client a part · evolution 120 € / 4 mois, sans abonnement",
    ],
    cta: 'Demander un devis',
  },
];

const modules: { n: string; t: string; d: string; p: string; offerId?: string }[] = [
  { n: '01', t: 'Skill pack metier additionnel', d: 'Un SKILL.md eprouve (DUERP, accueil citoyen, relance devis...), teste, signe', p: '290 €', offerId: 'skill-pack' },
  { n: '02', t: 'Mise a jour d\'agent (tous les 4 mois)', d: 'Proposee, jamais imposee. Refuser ne degrade rien', p: '120 €', offerId: 'maj-agent' },
  { n: '03', t: 'Pipeline IA generative communication', d: 'Visuels reseaux, supports print, montages video', p: '2 400 €', offerId: 'module-pipeline' },
  { n: '04', t: 'Chatbot citoyen / adherent', d: 'FAQ multilingue, base docs, multi-canal', p: '1 400 €', offerId: 'module-chatbot' },
  { n: '05', t: 'Formation IA equipe (1 jour)', d: 'Jusqu\'a 12 personnes, programme custom, hands-on', p: '1 200 €', offerId: 'module-formation' },
  { n: '06', t: 'Direction artistique IA-augmentee', d: 'Identite, motion, video — 20 ans Ps/Ai/Pr/Ae', p: '700 €/j' },
  { n: '07', t: 'Refonte / dev plateforme web', d: 'Next.js, Python, agents integres', p: ' 800 €/j' },
  { n: '08', t: 'Conseil strategique IA (RDV)', d: '2h cadrage direction, livrable ecrit', p: '450 €', offerId: 'conseil-2h' },
];

const garanties = [
  'Forfait ferme · pas d\'imprevus factures',
  'Devis sous 48h apres RDV',
  'Facture pro SASU · RIB direct',
  '1 cycle de retours inclus',
  'RDV decouverte 30min gratuit',
  'Confidentialite contractuelle',
];

export default function TarifsPage() {
  const [mailOpen, setMailOpen] = useState(false);
  const [booking, setBooking] = useState<BookingKind | null>(null);
  const [form, setForm] = useState({ nom: '', email: '', sujet: 'Demande de prestation IA', message: '' });
  // Paiement en ligne (Stripe Checkout via le backend) — les boutons ne
  // s'affichent que si le backend billing est configure (cle Stripe presente).
  const [billingReady, setBillingReady] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payStatus, setPayStatus] = useState<'succes' | 'annule' | null>(null);

  useEffect(() => {
    fetch(`${BOT_URL}/billing/offers`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setBillingReady(Boolean(d?.configured)))
      .catch(() => setBillingReady(false));
    const q = new URLSearchParams(window.location.search).get('paiement');
    if (q === 'succes' || q === 'annule') setPayStatus(q);
  }, []);

  const startCheckout = async (offerId: string) => {
    if (payingId) return;
    setPayingId(offerId);
    try {
      const res = await fetch(`${BOT_URL}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId }),
      });
      if (!res.ok) throw new Error(`billing_${res.status}`);
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error('billing_no_url');
      window.location.href = data.url;
    } catch {
      // Billing indisponible -> flux classique devis par mail.
      setPayingId(null);
      setMailOpen(true);
    }
  };

  const submitMail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(form.sujet || 'Contact tuveuxun.expert');
    const body = encodeURIComponent(
      `De : ${form.nom} <${form.email}>\n\n${form.message}\n\n--\nEnvoye depuis tuveuxun.expert`
    );
    window.location.href = `mailto:tabascocity@proton.me?subject=${subject}&body=${body}`;
    setMailOpen(false);
  };

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <main className="bg-tealNight text-aqua min-h-screen">
      {/* Bandeau retour Stripe Checkout */}
      {payStatus && (
        <div
          className={clsx(
            'fixed top-0 inset-x-0 z-[200] text-center font-monodisp text-[11px] uppercase tracking-[0.22em] py-3 px-4',
            payStatus === 'succes' ? 'bg-accent text-obsidian' : 'bg-carbon text-aqua border-b border-accent/30'
          )}
        >
          {payStatus === 'succes'
            ? '✓ Paiement reçu — vous recevez un email de confirmation, Naïmvous contacte sous 48h pour lancer la mission.'
            : 'Paiement annulé — aucun débit. Vous pouvez aussi demander un devis par mail.'}
          <button type="button" onClick={() => setPayStatus(null)} className="ml-4 font-bold" aria-label="Fermer">×</button>
        </div>
      )}
      {/* HERO — sculpture sovereign à droite, type editorial à gauche */}
      <section className="relative h-screen min-h-[760px] overflow-hidden">
        <div className="absolute top-0 right-0 w-full lg:w-[60%] h-full">
          <EditorialSculpture />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-tealNight via-tealNight/85 to-tealNight/0 pointer-events-none lg:via-tealNight/60" />

        <div className="relative z-10 h-full max-w-[1400px] mx-auto px-8 flex items-center">
          <div className="max-w-3xl">
            <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-10 flex items-center gap-3">
              <span className="w-8 h-px bg-accent" />
              Index 02 — Tarifs
            </div>

            <h1 className="display-edit-h1 text-aqua mb-12">
              TARIFS.<br />
              <span className="grad-mint">LIMPIDES.</span>
            </h1>

            <p className="display-edit-h2 text-aqua/65 max-w-2xl">
              Pas d'abonnement piege.<br />
              Pas de frais cache.<br />
              <span className="text-aqua font-light">Vous savez ce que vous payez.</span>
            </p>
          </div>
        </div>

        <div className="absolute bottom-12 right-12 z-10 max-w-xs text-right hidden lg:block">
          <div className="font-monodisp text-[10px] tracking-[0.25em] uppercase text-accent/60 mb-2">
            COVER · A_MORPHING_FORM
          </div>
          <p className="font-light text-sm text-aqua/55 leading-relaxed">
            "L'IA bien calibree epouse le metier comme un materiau organique."
          </p>
        </div>
      </section>

      {/* FORFAITS */}
      <section id="forfaits" className="py-32 border-t border-accent/15 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-20">
            <div className="col-span-12 lg:col-span-7">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent/60 mb-6">
                Section 03 — 3 forfaits
              </div>
              <h2 className="display-edit-h2 text-aqua">
                CHOISISSEZ<br />
                <span className="grad-mint">EN UN.</span>
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:pt-12">
              <p className="text-lg text-aqua/65 leading-relaxed font-light">
                Forfaits packages pour <span className="text-aqua font-medium">PME, mairies, associations</span>.
                Devis ferme sous 48h.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {forfaits.map((f) => (
              <article
                key={f.n}
                className={clsx(
                  'group col-span-12 lg:col-span-4 relative p-8 lg:p-10 flex flex-col border clip-civ-md',
                  'bg-obsidian/40 border-accent/30',
                  'transition-all duration-500 hover:-translate-y-2 wave-hover',
                  // On PLONGE : fond bleu profond au survol, texte clair.
                  // (Les bleus clairs + texte noir laissaient passer du blanc
                  // sur cyan sur les elements qui gardent leur couleur propre.)
                  'hover:[&_*]:!text-white hover:[&_*]:!font-medium',
                  // Hover : plongee oceanique. Les verts (emerald/lime) sont
                  // remplaces par trois paliers de bleu, de l'ecume a la pleine
                  // eau — on descend de carte en carte. Teintes volontairement
                  // claires : le texte passe en noir au survol, il doit rester
                  // lisible sur le bleu.
                  f.n === '01' && 'hover:bg-[#17607F] hover:border-surf/70 hover:text-white',
                  f.n === '02' && 'hover:bg-[#0E4159] hover:border-surf/60 hover:text-white overflow-y-visible',
                  f.n === '03' && 'hover:bg-[#08243A] hover:border-surf/50 hover:text-white'
                )}
              >
                {/* Badge "NOTRE RECOMMANDATION" — bg blanc, texte blanc indistinguable, devient noir au hover (delay 200ms) */}
                {f.featured && (
                  <div
                    className="absolute top-3 left-6 bg-white text-black z-40 font-monodisp text-[11px] uppercase tracking-[0.25em] px-4 py-1.5 font-bold clip-civ-sm whitespace-nowrap transition-colors duration-300 pointer-events-none group-hover:bg-surf group-hover:!text-abyss"
                    style={{ transitionDelay: '400ms' }}
                  >
                    → NOTRE RECOMMANDATION
                  </div>
                )}

                <div className={clsx(
                  'font-monodisp text-[10px] uppercase tracking-[0.3em] mb-12 text-accent/60',
                  f.featured && 'pt-8'
                )}>
                  Forfait — {f.n}
                </div>

                <h3 className="display-edit-h2 mb-4 text-aqua" style={{ fontSize: 'clamp(28px, 3.5vw, 48px)' }}>
                  {f.name.toUpperCase()}
                </h3>
                <p className="text-base mb-12 leading-relaxed text-aqua/65 font-light">
                  {f.target}
                </p>

                <div className="mb-2">
                  <span className="display-edit-h1 text-aqua" style={{ fontSize: 'clamp(64px, 8vw, 120px)', lineHeight: 0.9, fontWeight: 200 }}>
                    {f.price}
                  </span>
                </div>
                <div className="font-monodisp text-xs uppercase tracking-widest mb-12 text-aqua/50">
                  € HT — {f.duration}
                </div>

                <ul className="space-y-2 mb-12 flex-grow">
                  {f.features.map((feat, fidx) => (
                    <li key={feat} className="flex items-start gap-4 py-2 border-t border-accent/15 text-aqua/85 transition-colors group-hover:border-white/30">
                      <span className="font-monodisp text-[10px] mt-1 w-6 text-accent transition-colors group-hover:!text-surf">
                        0{fidx + 1}
                      </span>
                      <span className="text-sm leading-relaxed flex-1 font-light">{feat}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#rdv"
                  className="block text-center font-monodisp text-[11px] uppercase tracking-[0.22em] py-4 transition-colors clip-civ-sm border border-accent/40 text-aqua group-hover:border-white/55"
                >
                  → {f.cta}
                </a>
                {billingReady && (
                  <button
                    type="button"
                    onClick={() => startCheckout(f.offerId)}
                    disabled={payingId !== null}
                    className="mt-3 block w-full text-center font-monodisp text-[11px] uppercase tracking-[0.22em] py-4 transition-colors clip-civ-sm bg-accent text-obsidian font-bold hover:bg-aqua disabled:opacity-50 group-hover:!bg-surf group-hover:!text-abyss"
                  >
                    {payingId === f.offerId ? '… redirection Stripe' : '→ Payer en ligne'}
                  </button>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SUR MESURE */}
      <section className="py-32 bg-gradient-to-b from-obsidian via-abyss/60 to-abyss border-y border-accent/15 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 lg:col-span-7">
              <div className="hud-label mb-8">Section 04 — Bespoke</div>
              <h2 className="display-edit-h1 mb-8">
                <span className="grad-fusion">SUR MESURE.</span><br />
                <span className="text-aqua/85">DEVIS FERME.</span>
              </h2>
              <p className="text-lg text-aqua/65 max-w-xl leading-relaxed font-light">
                Multi-process chaines, refonte complete, integration profonde,
                formation interne, direction artistique, applications complètes.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-5 text-left lg:text-right">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-surf/70 mb-3">
                Tarif jour-a-jour
              </div>
              <div className="display-edit-h1 text-aqua" style={{ fontSize: 'clamp(56px, 7.5vw, 120px)', lineHeight: 0.9, fontWeight: 200 }}>
                900<span className="text-accent">–</span>1200
              </div>
              <div className="font-monodisp text-sm text-aqua/55 mt-3">€ HT / jour</div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="py-32 bg-gradient-to-b from-abyss via-oceanDeep to-abyss relative overflow-hidden">
        <OceanWaves />
        <div className="relative z-10 max-w-[1400px] mx-auto px-8">
          <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-surf/70 mb-8">
            Section 05 — Modules
          </div>
          <h2 className="display-edit-h2 mb-20 max-w-3xl text-aqua">
            PRESTATIONS<br />
            <span className="text-surf">COMPLEMENTAIRES.</span>
          </h2>

          <div className="border-t border-surf/35">
            {modules.map((m, mi) => (
              <Reveal key={m.n} dir={mi % 2 === 0 ? 'right' : 'left'} delay={mi * 70}>
              <div
                className="grid grid-cols-12 gap-4 lg:gap-8 py-8 border-b border-surf/20 hover:bg-surf/10 transition-colors -mx-4 px-4"
              >
                <div className="col-span-1 font-monodisp text-xs text-surf/70 pt-2">{m.n}</div>
                <div className="col-span-11 lg:col-span-7">
                  <h3 className="font-display font-light text-2xl lg:text-4xl text-aqua leading-tight mb-2 uppercase tracking-tight">
                    {m.t}
                  </h3>
                  <p className="text-sm text-aqua/55 leading-relaxed font-light">{m.d}</p>
                </div>
                <div className="col-span-12 lg:col-span-4 text-left lg:text-right pt-2">
                  <span className="font-display font-light text-3xl lg:text-4xl text-aqua">
                    {m.p}
                  </span>
                  {billingReady && m.offerId && (
                    <button
                      type="button"
                      onClick={() => startCheckout(m.offerId!)}
                      disabled={payingId !== null}
                      className="mt-2 block w-full lg:w-auto lg:ml-auto font-monodisp text-[10px] uppercase tracking-[0.2em] px-4 py-2 transition-colors clip-civ-sm border border-surf/50 text-surf hover:bg-surf hover:text-abyss disabled:opacity-50"
                    >
                      {payingId === m.offerId ? '… redirection' : '→ Payer en ligne'}
                    </button>
                  )}
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FORMATION EQUIPE — section dediee 1500/jour */}
      <section id="formation" className="py-32 bg-obsidian border-t border-surf/25 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 items-end mb-16">
            <div className="col-span-12 lg:col-span-7">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-surf/70 mb-6">
                Section 06 — Formation
              </div>
              <h2 className="display-edit-h1">
                <span className="text-aqua">FORMEZ </span>
                <span className="text-surf">VOS EQUIPES.</span>
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-5 text-left lg:text-right">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent/60 mb-3">
                Tarif jour-a-jour
              </div>
              <div className="display-edit-h1 text-aqua" style={{ fontSize: 'clamp(56px, 7.5vw, 120px)', lineHeight: 0.9, fontWeight: 200 }}>
                1 500
              </div>
              <div className="font-monodisp text-sm text-aqua/55 mt-3">€ HT / jour</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-surf/20">
            {[
              {
                n: '01',
                t: 'Bootcamp IA equipe',
                d: 'Jusqu\'a 12 personnes · 1 jour · programme custom selon votre metier · hands-on Claude/Qwen/MCP · supports ecrits inclus.',
              },
              {
                n: '02',
                t: 'Atelier dirigeants',
                d: '1 demi-journee · 4 a 6 personnes · cadrage strategique IA · cas d\'usage prioritaires · feuille de route 6 mois.',
              },
              {
                n: '03',
                t: 'Coaching mensuel',
                d: 'Suivi long terme · 1 jour/mois · accompagnement deploiement IA · revue process · ajustements outils.',
              },
            ].map((card) => (
              <div key={card.n} className="chrome-hover group bg-obsidian p-8 lg:p-10 hover:bg-carbon transition-colors relative overflow-hidden">
                <div className="font-monodisp text-[10px] text-surf tracking-widest mb-6">{card.n}</div>
                <h3 className="font-display text-2xl lg:text-3xl text-aqua mb-4 uppercase tracking-tight">{card.t}</h3>
                <p className="text-sm text-aqua/65 font-light leading-relaxed">{card.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                Pedigree formation
              </div>
              <p className="text-base text-aqua/80 font-light leading-relaxed">
                <span className="text-aqua font-medium">160 apprenants formes</span> en 2 ans bootcamp Insersite (Yvelines).
                Stack enseignee : full-stack web, IA generative, agents, motion. Public heterogene
                (reconversion, demandeurs d'emploi, jeunes diplomes). Capacite reconnue a vulgariser des concepts
                techniques pour publics non-tech.
              </p>
            </div>
            <div>
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-surf mb-4">
                Frais en sus
              </div>
              <ul className="space-y-2 text-sm text-aqua/75 font-light">
                <li>→ Deplacement : forfait selon zone (Ile-de-France inclus dans 4 communes)</li>
                <li>→ Hebergement : facture au reel si plus de 100 km</li>
                <li>→ Salle / materiel : a votre charge OU prevoir + 350 €/j</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-16">
            {/* data-sfx="footer" (11/09) : ce son quitte le footer (voir plus
                bas), il vit desormais sur les CTA "reserver". Formulaire
                interne (BookingModal) a la place du mailto — retour Naim :
                "il manque ces formulaires". */}
            <button
              type="button"
              onClick={() => setBooking('formation')}
              data-sfx="footer"
              className="inline-flex items-center gap-3 bg-surf text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold px-10 py-5 hover:bg-aqua transition-colors"
              style={{ borderRadius: '2px' }}
            >
              Reserver une journee de formation
              <span className="font-monodisp">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* GARANTIES */}
      <section className="py-20 bg-gradient-to-b from-oceanDeep to-abyss border-t border-surf/20 overflow-hidden">
        <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-surf/60 text-center mb-8">
          Garanties contractuelles
        </div>
        <div className="flex animate-marquee whitespace-nowrap gap-12">
          {[...garanties, ...garanties].map((g, i) => (
            <div key={i} className="flex items-center gap-12 font-display font-light text-3xl lg:text-5xl text-aqua/60 uppercase tracking-tight">
              <span>{g}</span>
              <span className="text-surf">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="rdv" className="py-32 bg-gradient-to-b from-abyss via-oceanDeep to-obsidian relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hud-label mb-10">RDV — 30 minutes — gratuit</div>
            <h2 className="display-edit-h1 mb-10">
              <span className="text-aqua">TU VEUX UN EXPERT ?</span><br />
              <span className="grad-volt-ember">PARLONS-EN.</span>
            </h2>
            <p className="text-lg text-aqua/65 mb-12 max-w-xl mx-auto leading-relaxed font-light">
              On regarde ensemble si l'IA peut reellement aider votre structure — et si oui, comment.
            </p>
            {/* data-sfx="footer" (11/09) : idem, le son quitte le footer pour ces 3 boutons. */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                type="button"
                onClick={() => setBooking('rdv')}
                data-sfx="footer"
                className="inline-flex items-center gap-3 bg-surf text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-medium px-10 py-5 hover:bg-aqua transition-colors"
                style={{ borderRadius: '2px' }}
              >
                Réserver un créneau
                <span className="font-monodisp">→</span>
              </button>
              <button
                type="button"
                onClick={() => setMailOpen(true)}
                data-sfx="footer"
                className="inline-flex items-center gap-3 border border-surf/40 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-10 py-5 hover:bg-surf hover:text-obsidian transition-colors"
                style={{ borderRadius: '2px' }}
              >
                Écrire un mail
                <span className="font-monodisp">✉</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL MAIL */}
      {mailOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-obsidian/80 backdrop-blur-md p-4"
          onClick={() => setMailOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-obsidian border border-surf/40 clip-civ-md p-8 lg:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t border-l border-surf" />
            <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t border-r border-surf" />
            <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-surf" />
            <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-surf" />

            <button
              type="button"
              onClick={() => setMailOpen(false)}
              aria-label="Fermer"
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-surf hover:text-aqua font-monodisp text-sm"
            >
              ×
            </button>

            <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-surf mb-4">
              new_message · demande tv1e
            </div>
            <h3 className="font-display text-3xl text-aqua mb-6 uppercase tracking-tight">Écrire un mail</h3>

            <form onSubmit={submitMail} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" required placeholder="Votre nom" value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="bg-carbon border border-surf/25 text-aqua placeholder-aqua/40 px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm" />
                <input type="email" required placeholder="Email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-carbon border border-surf/25 text-aqua placeholder-aqua/40 px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm" />
              </div>
              <input type="text" placeholder="Sujet" value={form.sujet}
                onChange={(e) => setForm({ ...form, sujet: e.target.value })}
                className="w-full bg-carbon border border-surf/25 text-aqua placeholder-aqua/40 px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm" />
              <textarea required rows={5} placeholder="Votre message..." value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-carbon border border-surf/25 text-aqua placeholder-aqua/40 px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm resize-none" />
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setMailOpen(false)}
                  className="border border-surf/40 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-6 py-3 hover:bg-carbon transition-colors clip-civ-sm">
                  Annuler
                </button>
                <button type="submit"
                  className="bg-surf text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold px-6 py-3 hover:bg-aqua transition-colors clip-civ-sm">
                  Envoyer →
                </button>
              </div>
              <p className="font-monodisp text-[9px] text-aqua/40 tracking-wider uppercase pt-2">
                Ouvre votre client mail prerempli
              </p>
            </form>
          </div>
        </div>
      )}

      <BookingModal kind={booking ?? 'rdv'} open={booking !== null} onClose={() => setBooking(null)} />
    </main>
  );
}
