'use client';

/**
 * FaqPanel — remplace le chatbot en v1, meme position, meme affordance.
 *
 * Pourquoi : mesures du 04/09/2026 sur le VPS cible (2 vCPU, 8 Go, CPU partage).
 * qwen2.5:7b en CPU pur = 34 s par reponse sur un i9 12900H, ~60 s une fois
 * ramene au CPU partage de l'hebergeur. Un visiteur ne reste pas 60 s devant un
 * curseur. L'agent existe et repond juste (20/20 conformite, 8/8 raisonnement) —
 * c'est le serveur qui manque, pas le modele. On le branchera quand le trafic
 * paiera la machine.
 *
 * Le backend FastAPI reste deploye : il sert Stripe (/billing/checkout) et la
 * capture de lead (/lead). Seul Ollama disparait de la v1, donc plus de modele
 * de 5 Go resident : le VPS respire.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL || 'http://127.0.0.1:8001';

type Qa = { q: string; a: string };
type Theme = { id: string; label: string; items: Qa[] };

// Source : backend/faq.md (meme grille que l'agent). Aucune donnee personnelle
// ici — le contact passe par /tarifs#rdv, jamais par une adresse en dur.
const THEMES: Theme[] = [
  {
    id: 'tarifs',
    label: 'Tarifs & budget',
    items: [
      {
        q: "Combien coûte une première mission ?",
        a: "Trois forfaits fermes, en HT : Diagnostic IA 690 € (1 jour), Agent métier 1 900 € (3 jours, le plus demandé), Agent souverain sur mesure 2 700 € (5 jours, agent et LLM installés chez vous). Le prix annoncé est le prix facturé.",
      },
      {
        q: "Y a-t-il un abonnement ?",
        a: "Jamais. Ni abonnement, ni SLA, ni support mensuel obligatoire. Vous payez une prestation, elle vous appartient. Tous les 4 mois, une mise à jour de votre agent vous est proposée à 120 € : vous la prenez ou vous la refusez, et refuser ne dégrade rien de ce qui tourne déjà.",
      },
      {
        q: "Que couvre exactement le diagnostic à 690 € ?",
        a: "Une journée : cartographie de vos tâches répétitives, ce qui est automatisable aujourd'hui, ce qui ne l'est pas et pourquoi, une démonstration d'un agent souverain en direct sur vos propres données, puis le chiffrage de ce qui vaut le coup. 690 € HT, déductibles d'un forfait signé sous 30 jours.",
      },
      {
        q: "Quels modules à la carte proposez-vous ?",
        a: "Skill pack métier additionnel 290 € · Mise à jour d'agent tous les 4 mois 120 € · Pipeline IA générative pour la communication 2 400 € · Chatbot citoyen ou adhérent 1 400 € · Formation équipe 1 200 € / jour · Direction artistique IA-augmentée 900 € / jour · Refonte ou développement de plateforme web 1 000 € / jour · Conseil stratégique en rendez-vous de 2 h 450 €.",
      },
      {
        q: "Mon besoin ne rentre dans aucun forfait, que faire ?",
        a: "Sur mesure, avec un TJM de 900 à 1 200 € HT selon la complexité. Le devis est ferme et arrive sous 48 h après le rendez-vous de cadrage.",
      },
      {
        q: "Je suis une association avec 3 000 € de budget, c'est jouable ?",
        a: "Oui. Le diagnostic à 690 € ou le rendez-vous de conseil à 450 € permettent de commencer sans engager la suite, et l'agent métier à 1 900 € tient dans votre budget. On ne pousse pas un forfait qui ne rentre pas dans votre budget.",
      },
      {
        q: "Comment se passe le paiement ?",
        a: "Acompte de 30 % au démarrage, solde à la livraison. Virement bancaire, facture professionnelle. Pas de prélèvement récurrent.",
      },
    ],
  },
  {
    id: 'delais',
    label: 'Délais & déroulement',
    items: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "Diagnostic IA 1 jour · Agent métier 3 jours · Agent souverain sur mesure 5 jours. Rendez-vous de découverte sous 48 h, devis ferme sous 48 h après le cadrage.",
      },
      {
        q: "Comment démarre-t-on concrètement ?",
        a: "1. Rendez-vous de découverte de 30 minutes, gratuit, en visio ou par téléphone. 2. Cadrage : on fixe ensemble le périmètre exact et les livrables. 3. Devis ferme sous 48 h. 4. Démarrage à réception de l'acompte de 30 %. 5. Livraison et 2 h de prise en main avec votre équipe. 6. Support 30 ou 60 jours selon le forfait.",
      },
      {
        q: "Le rendez-vous de découverte est-il payant ?",
        a: "Non. 30 minutes, gratuit, sans engagement. C'est là que l'on détermine si le besoin justifie une prestation — et il arrive que la réponse soit non.",
      },
      {
        q: "Intervenez-vous sur site ?",
        a: "Île-de-France sur site, partout ailleurs à distance. L'installation d'un agent souverain se fait sur votre serveur, que l'on soit dans vos locaux ou connecté.",
      },
      {
        q: "Que se passe-t-il si le résultat ne me convient pas ?",
        a: "Un cycle de retours est inclus sur chaque livrable, et le forfait est ferme : aucun imprévu ne vous est refacturé. Le périmètre fixé au cadrage est celui qui est livré.",
      },
    ],
  },
  {
    id: 'souverainete',
    label: 'Souveraineté & RGPD',
    items: [
      {
        q: "Mes données partent-elles dans le cloud ?",
        a: "Avec l'agent souverain, non : le modèle tourne sur votre serveur, les données ne sortent jamais de chez vous. C'est la configuration prévue pour les mairies, les cabinets juridiques et le secteur médical.",
      },
      {
        q: "Qu'est-ce que l'agent souverain exactement ?",
        a: "2 700 € HT, 5 jours, 60 jours de support. On installe la voie souveraine adaptée à votre machine — OpenClaw, Hermes ou un LLM local pur — avec Ollama et un modèle ouvert (Qwen3 ou Mistral) sur votre serveur, vos documents, vos garde-fous et deux skill packs métier. L'agent garde sa mémoire chez vous, aucune dépendance à un service externe.",
      },
      {
        q: "Quel matériel faut-il pour héberger un modèle chez nous ?",
        a: "8 Go de RAM sans carte graphique suffisent pour une démonstration (Phi-3 Mini). 16 Go avec 8 Go de VRAM font tourner Qwen 2.5 7B, le format mairie ou cabinet. 32 Go avec une RTX 3080 ou 4080 tiennent Llama 3 8B ou Mixtral en production. 64 Go avec une RTX 4090 permettent du multi-utilisateur.",
      },
      {
        q: "Puis-je savoir avant d'acheter ce que ma machine peut faire tourner ?",
        a: "Oui, l'audit matériel est gratuit : 15 minutes pour évaluer ce que votre parc existant supporte réellement. C'est souvent là que l'on découvre qu'un serveur déjà présent suffit.",
      },
      {
        q: "Combien de temps prend l'installation ?",
        a: "Une journée sur place ou à distance, quel que soit le système : Linux, macOS ou Windows, avec des installeurs natifs. L'installation se fait avec vous, pas à votre place : vous savez ensuite la refaire.",
      },
    ],
  },
  {
    id: 'equipe',
    label: 'Équipe & méthode',
    items: [
      {
        q: "Qui travaille sur mon projet ?",
        a: "Naïm est l'intervenant principal : architecte agentique et développeur full-stack senior. Selon le besoin, il s'appuie sur un collectif de 7 entités — organisation et management, plateformes et financements, applications SaaS, cybersécurité, écriture — chacune avec sa structure dédiée.",
      },
      {
        q: "Êtes-vous une agence ?",
        a: "Non. Un collectif de spécialistes indépendants qui travaillent ensemble depuis des années. Vous avez un interlocuteur unique, pas un commercial puis un chef de projet puis un prestataire.",
      },
      {
        q: "Travaillez-vous avec des startups en levée de fonds ?",
        a: "Ce n'est pas la cible. Le travail est calibré pour les PME, les TPE, les mairies, les collectivités et les associations — des structures où l'IA doit produire vite sans équipe technique interne.",
      },
      {
        q: "Faut-il des compétences techniques dans notre équipe ?",
        a: "Non. C'est même le point de départ : les livrables sont conçus pour des équipes non techniques, avec 2 h de prise en main incluses et une documentation écrite en français courant, sans jargon.",
      },
    ],
  },
  {
    id: 'formation',
    label: 'Formation',
    items: [
      {
        q: "Formez-vous les équipes ?",
        a: "Bootcamp IA d'une journée jusqu'à 12 personnes, programme construit sur vos cas réels : 1 200 € / jour. Atelier dirigeants d'une demi-journée pour le cadrage stratégique : 900 €. Coaching mensuel d'un jour par mois pour un suivi long terme : 1 200 € / jour.",
      },
      {
        q: "Combien de personnes avez-vous formées ?",
        a: "160 apprenants en deux ans de bootcamps.",
      },
      {
        q: "La formation est-elle incluse dans les forfaits ?",
        a: "Deux heures de prise en main sont incluses à chaque livraison. La formation approfondie de l'équipe est un module à part, parce qu'elle demande un programme construit sur vos cas et pas une démonstration générique.",
      },
    ],
  },
  {
    id: 'apres',
    label: 'Après la livraison',
    items: [
      {
        q: "Que devient l'agent une fois livré ?",
        a: "Il vous appartient et il tourne chez vous. Pas de licence à renouveler, pas de compte à garder ouvert, pas de service distant qui pourrait être coupé.",
      },
      {
        q: "Comment se passent les mises à jour ?",
        a: "Tous les 4 mois, votre agent vérifie s'il existe une mise à jour et vous la propose — jamais il ne l'installe seul. Elle coûte 120 €, à l'acte. Si vous refusez, absolument rien ne se dégrade : la version installée continue de fonctionner comme au premier jour.",
      },
      {
        q: "Y a-t-il un support après la livraison ?",
        a: "30 jours inclus sur l'agent métier, 60 jours sur l'agent souverain. Au-delà, l'intervention se paie à l'acte, et une mise à jour de l'agent vous est proposée tous les 4 mois à 120 €. Jamais de forfait mensuel.",
      },
      {
        q: "Que se passe-t-il si vous arrêtez l'activité ?",
        a: "Rien ne s'arrête chez vous. C'est précisément l'intérêt du local : le code, les modèles et les données sont sur vos machines, sans appel à un serveur extérieur. Un prestataire qui disparaît ne doit pas emporter votre outil de travail.",
      },
    ],
  },
  {
    id: 'technique',
    label: 'Technique',
    items: [
      {
        q: "Quelle stack utilisez-vous ?",
        a: "Côté IA : OpenClaw, Hermes, Ollama, Qwen3, Mistral, l'API Claude quand le cloud est acceptable, et le protocole MCP. Côté développement : Next.js, React, Three.js, Python, FastAPI, Node, PostgreSQL, Docker, Linux.",
      },
      {
        q: "Quelles sont les voies souveraines proposees ?",
        a: "Selon votre machine, votre budget et votre envie de vous impliquer, on installe la voie qui vous convient : OpenClaw, une plateforme d'agents auto-hébergée accessible qui tourne même sur une machine modeste ; Hermes, un runtime open source (MIT, Nous Research) auto-évolutif pour les machines plus puissantes ; ou un LLM local pur (Ollama + modèle ouvert) pour un chatbot souverain simple. Dans tous les cas : Ollama, un modèle ouvert sur votre serveur, aucun appel sortant, la mémoire chez vous. On peut aussi rester en cloud (Claude, DeepSeek...) quand c'est acceptable et que vous voulez aller vite.",
      },
      {
        q: "Publiez-vous du code ?",
        a: "Oui, à partir de 22 outils Claude Code développés en interne, publiés gratuitement sous licence MIT sur GitHub (suppléments sur devis). Le modèle économique porte sur l'expertise humaine — conseil, formation, intégration — pas sur la vente de fichiers.",
      },
      {
        q: "Pouvez-vous reprendre un projet IA déjà commencé ?",
        a: "Oui, et c'est fréquent. L'audit sert alors à établir ce qui est récupérable, ce qui doit être refait et ce qui doit être abandonné. Cette dernière catégorie n'est jamais vide.",
      },
    ],
  },
];

const COUNT = THEMES.reduce((n, t) => n + t.items.length, 0);

// Recherche insensible aux accents : "delai" doit trouver "delai" comme "délai".
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function FaqPanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [openQa, setOpenQa] = useState<string | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');

  // Les deux panneaux occupent le meme coin : ouvrir l'un ferme l'autre.
  // Un evenement DOM suffit et evite de remonter un etat partage dans le layout.
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('Tv1E:close-faq', close);
    return () => window.removeEventListener('Tv1E:close-faq', close);
  }, []);

  const openPanel = () => {
    window.dispatchEvent(new Event('Tv1E:close-chat'));
    setOpen(true);
  };

  const searching = query.trim().length > 1;

  const results = useMemo(() => {
    if (!searching) return THEMES;
    const q = norm(query.trim());
    return THEMES.map((t) => ({
      ...t,
      items: t.items.filter((i) => norm(i.q).includes(q) || norm(i.a).includes(q)),
    })).filter((t) => t.items.length > 0);
  }, [query, searching]);

  const found = results.reduce((n, t) => n + t.items.length, 0);

  const sendLead = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leadEmail)) return;
    try {
      await fetch(`${BOT_URL}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadEmail,
          message: query.trim().slice(0, 2000) || 'Depuis la FAQ du site',
          source: 'faq',
        }),
      });
      setLeadSent(true);
      setLeadOpen(false);
    } catch {
      // Backend injoignable : on renvoie vers le formulaire de la page tarifs.
      window.location.href = '/tarifs#rdv';
    }
  };

  return (
    <>
      {/* Lanceur — icone compacte, juste au-dessus du bouton de l'agent Tv1E.
          Le visiteur presse pour lire, l'agent en dessous pour demander. */}
      <button
        type="button"
        onClick={openPanel}
        aria-label={`Ouvrir la FAQ — ${COUNT} réponses immédiates`}
        title={`FAQ — ${COUNT} réponses immédiates`}
        className="fixed bottom-[88px] right-6 z-[150] items-center gap-2 bg-carbon hover:bg-accent border border-accent/50 hover:border-accent text-accent hover:text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold px-4 py-3 transition-colors clip-civ-sm shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
        style={{ display: open ? 'none' : 'inline-flex' }}
      >
        <span aria-hidden className="text-[13px] leading-none">?</span>
        FAQ · {COUNT}
      </button>

      {open && (
        <div className="fixed bottom-6 right-6 z-[150] w-[calc(100%-32px)] sm:w-[440px] h-[640px] max-h-[calc(100vh-48px)] flex flex-col bg-obsidian border border-accent/40 clip-civ-md shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent" />
          <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t border-r border-accent" />
          <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-accent" />
          <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent" />

          {/* En-tete */}
          <header className="flex items-center justify-between border-b border-accent/20 px-4 py-3 bg-carbon/50 backdrop-blur">
            <div className="flex items-center gap-2.5">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 bg-accent animate-ping opacity-50" />
                <span className="relative inline-flex h-2 w-2 bg-accent" />
              </span>
              <div>
                <div className="font-monodisp text-[11px] tracking-[0.22em] uppercase text-aqua font-bold">
                  Questions fréquentes
                </div>
                <div className="font-monodisp text-[9px] tracking-[0.2em] uppercase text-accent/70">
                  {searching ? `${found} résultat${found > 1 ? 's' : ''}` : `${COUNT} réponses · réponse humaine sous 48 h`}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="w-7 h-7 flex items-center justify-center text-accent hover:text-aqua font-monodisp text-base transition-colors"
            >
              ×
            </button>
          </header>

          {/* Recherche */}
          <div className="border-b border-accent/15 px-3 py-3 bg-carbon/30">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher : tarif, délai, RGPD, formation..."
              className="w-full bg-carbon border border-accent/20 text-aqua placeholder-aqua/40 px-3 py-2.5 font-monodisp text-[12px] focus:border-accent focus:outline-none clip-civ-sm"
            />
          </div>

          {/* Corps */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {/* Le mot d'explication — c'est un argument, pas une excuse */}
            {!searching && (
              <div className="border-l-2 border-accent/60 bg-carbon/40 pl-3 pr-3 py-3">
                <div className="font-monodisp text-[9px] tracking-[0.25em] uppercase text-accent/70 mb-1.5">
                  Ici c'est instantané
                </div>
                <p className="font-monodisp text-[11px] leading-relaxed text-aqua/80 font-light">
                  {"Ces réponses sont écrites et relues : elles s'affichent immédiatement. L'agent Tv1E, juste en dessous, tourne sur un modèle local hébergé sur un serveur économique — il comprend les questions inattendues, mais il lui faut une trentaine de secondes pour formuler."}
                </p>
                <p className="font-monodisp text-[11px] leading-relaxed text-accent/90 font-light mt-2">
                  {"C'est aussi cela, être expert : dimensionner la machine au trafic réel plutôt que faire payer un serveur surdimensionné. Vous trouvez ici, vous demandez là-bas."}
                </p>
              </div>
            )}

            {results.map((theme) => (
              <section key={theme.id}>
                <h3 className="font-monodisp text-[9px] tracking-[0.25em] uppercase text-accent/60 mb-2">
                  {theme.label}
                </h3>
                <div className="flex flex-col gap-1.5">
                  {theme.items.map((item) => {
                    const key = `${theme.id}-${item.q}`;
                    const isOpen = openQa === key;
                    return (
                      <div key={key} className="border border-accent/15 bg-carbon clip-civ-sm">
                        <button
                          type="button"
                          onClick={() => setOpenQa(isOpen ? null : key)}
                          aria-expanded={isOpen}
                          className={`w-full text-left flex items-start gap-2 px-3 py-2.5 font-monodisp text-[11px] leading-snug transition-colors ${
                            isOpen ? 'text-accent' : 'text-aqua/85 hover:text-accent'
                          }`}
                        >
                          <span aria-hidden className="mt-px shrink-0">
                            {isOpen ? '−' : '+'}
                          </span>
                          <span>{item.q}</span>
                        </button>
                        {isOpen && (
                          <p className="px-3 pb-3 pl-8 font-monodisp text-[11px] leading-relaxed text-aqua/70 font-light">
                            {item.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {searching && found === 0 && (
              <div className="py-6 text-center">
                <p className="font-monodisp text-[11px] text-aqua/60 leading-relaxed">
                  {"Aucune réponse écrite ne couvre cette question."}
                </p>
                <p className="font-monodisp text-[11px] text-accent/80 leading-relaxed mt-1">
                  {"C'est exactement le genre de cas qui mérite un humain — laissez votre email ci-dessous."}
                </p>
              </div>
            )}
          </div>

          {/* Contact — la sortie que l'on privilegie */}
          {!leadSent ? (
            <div className="border-t border-accent/15 px-3 py-2.5 bg-carbon/30">
              {!leadOpen ? (
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setLeadOpen(true)}
                    className="text-left font-monodisp text-[10px] tracking-[0.18em] uppercase text-accent hover:text-aqua transition-colors"
                  >
                    → Poser ma question à Naïm
                  </button>
                  <Link
                    href="/tarifs#rdv"
                    onClick={() => setOpen(false)}
                    className="font-monodisp text-[10px] tracking-[0.18em] uppercase text-aqua/60 hover:text-accent transition-colors whitespace-nowrap"
                  >
                    RDV 30 min
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="votre@email.fr"
                    autoFocus
                    className="flex-1 bg-carbon border border-accent/20 text-aqua placeholder-aqua/40 px-3 py-2 font-monodisp text-[11px] focus:border-accent focus:outline-none clip-civ-sm"
                  />
                  <button
                    type="button"
                    onClick={sendLead}
                    disabled={!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leadEmail)}
                    className="bg-accent hover:bg-aqua disabled:opacity-30 text-obsidian font-monodisp text-[10px] uppercase tracking-wider font-bold px-3 py-2 transition-colors clip-civ-sm"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="border-t border-accent/15 px-3 py-2.5 bg-carbon/30 font-monodisp text-[10px] tracking-[0.15em] uppercase text-accent/80">
              ✓ Bien reçu — réponse sous 48 h.
            </div>
          )}

          <div className="px-4 py-1.5 border-t border-accent/10 bg-carbon/60 font-monodisp text-[8px] tracking-[0.2em] uppercase text-accent/40 text-center">
            Réponses écrites et vérifiées · aucune génération automatique
          </div>
        </div>
      )}
    </>
  );
}
