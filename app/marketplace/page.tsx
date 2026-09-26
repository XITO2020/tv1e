import type { Metadata } from 'next';
import fs from 'node:fs';
import path from 'node:path';

export const metadata: Metadata = {
  title: "Marketplace d'agents Claude",
  description:
    'Agents Claude spécialisés (juridique, comptabilité, support…) intégrables dans votre structure.',
};

import Link from 'next/link';
import ComparisonTowers from '@/components/ComparisonTowersLazy';
import SmoothDetails from '@/components/SmoothDetails';

/** Vignette d'agent. Composant SERVEUR : on teste l'existence du fichier au
 *  rendu, donc l'icone reste tant que l'image pixel art n'est pas generee, et
 *  bascule toute seule des qu'elle arrive dans public/carousel/. */
function AgentThumb({ icon, img, name }: { icon: string; img?: string; name: string }) {
  const exists = img ? fs.existsSync(path.join(process.cwd(), 'public', img)) : false;
  if (img && exists) {
    return (
      <div className="w-12 h-12 shrink-0 overflow-hidden border border-accent/30 clip-civ-sm bg-obsidian">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover [image-rendering:pixelated] group-hover:scale-110 transition-transform duration-500"
        />
      </div>
    );
  }
  return (
    <div className="w-12 h-12 flex items-center justify-center border border-accent/30 text-accent text-xl shrink-0 clip-civ-sm group-hover:bg-accent/10 transition-colors">
      {icon}
    </div>
  );
}

// ── AGENTS MAISON — outils reellement construits dans QISHIM-CORTEX ──
// Inventaire du 02/09/2026 : descriptions tirees des README de chaque projet,
// pas inventees. Les prix sont a fixer par Naim (marques "sur devis").
const MAISON_AGENTS = [
  {
    name: 'Tintenfisch',
    desc: "Le monstre magnifique : une pieuvre de prospection pour tout projet ou événement dont chaque tentacule alimente sa propre base de prospects chauds, et referme la boucle sur les réponses.",
    price: 'sur devis',
    delivery: 'SaaS · 12 tentacules',
    icon: '🐙',
    img: '/carousel/tintenfisch.webp',
  },
  {
    name: 'Cortex Moderation',
    desc: 'Service unique de moderation par vision IA, partage entre plusieurs plateformes. NSFW auto, IA detectee signalee, recours utilisateur.',
    price: 'sur devis',
    delivery: 'Service partage',
    icon: '◉',
    img: '/carousel/cortex-moderation.webp',
  },
  {
    name: 'Sound-Cortex',
    desc: "Studio d'ingenierie son IA : musique, doublage, audiobook, effets. Dual-mode, pret pour du SaaS.",
    price: 'sur devis',
    delivery: 'Studio complet',
    icon: '♫',
    img: '/carousel/sound-cortex.webp',
  },
  {
    name: 'VoiceBox',
    desc: 'Synthese vocale et clonage zero-shot, 7 moteurs sous licence MIT. Tourne en local, aucune voix ne sort de chez vous.',
    price: 'sur devis',
    delivery: 'Local · MIT',
    icon: '◍',
    img: '/carousel/voicebox.webp',
  },
  {
    name: 'Hub Pilotage IA',
    desc: "Interface unique qui pilote plusieurs IA depuis un seul endroit — locales et distantes, sans changer d'outil.",
    price: 'sur devis',
    delivery: 'Interface unifiee',
    icon: '⊞',
    img: '/carousel/hub-pilotage.webp',
  },
  {
    name: 'Scraper Galerie',
    desc: "Collecte d'images a grande echelle, interface graphique locale. Python + navigateur pilote, rien dans le cloud.",
    price: 'sur devis',
    delivery: 'Outil local',
    icon: '⛶',
    img: '/carousel/scraper-galerie.webp',
  },
  {
    name: 'ISTQB Trainer',
    desc: "Entrainement aux tests psychotechniques d'admission : series, logique, correction expliquee.",
    price: 'sur devis',
    delivery: 'App formation',
    icon: '◈',
    img: '/carousel/istqb-trainer.webp',
  },
  {
    name: 'Serie-Forge Converter',
    desc: 'Transforme un scénario lisible par un humain en scénario machine valide, prêt à produire.',
    price: 'sur devis',
    delivery: 'Pipeline',
    icon: '⇄',
    img: '/carousel/serie-forge.webp',
  },
];

const CLAUDE_AGENTS = [
  {
    name: 'Redacteur juridique',
    img: '/agents-cards/redacteur-juridique.png',
    desc: 'CGV, CGU, mentions legales, RGPD adaptes a votre activite.',
    price: '800 €',
    delivery: '2 jours',
    icon: '§',
  },
  {
    name: 'Reponse mail commerciale',
    img: '/agents-cards/reponse-mail-commerciale.png',
    desc: 'Reponses personnalisees a vos prospects depuis votre boite mail. Integration + 30j support.',
    price: '2 500 €',
    delivery: '5 jours',
    icon: '✉',
  },
  {
    name: 'Veille concurrentielle',
    img: '/agents-cards/veille-concurrentielle.png',
    desc: 'Suit vos concurrents (sites, presse, RS) et synthetise hebdo. Setup + 30j support. \n Comparaison et sélection optimisées entre api: Deepseek, Claude, Gemini, Kimi, Qwen, Mistral',
    price: '1 800 €',
    delivery: '4 jours',
    icon: '◎',
  },
  {
    name: 'Traduction professionnelle',
    img: '/agents-cards/traduction-professionnelle.png',
    desc: 'FR / EN / ES / AR. Glossaire métier intégré pour cohérence.',
    price: '900 €/j',
    delivery: 'TJM',
    icon: '⌘',
  },
  {
    name: 'Analyse sentiment RS',
    img: '/agents-cards/analyse-sentiment-rs.png',
    desc: 'Extrait avis clients de vos réseaux sociaux. Alertes négatives en temps réel.',
    price: '1 800 €',
    delivery: '4 jours',
    icon: '◐',
  },
  {
    name: 'Rapport mensuel narratif',
    img: '/agents-cards/rapport-mensuel-narratif.png',
    desc: 'Reportium configure : KPIs + commentaire + recommandations + livraison auto.',
    price: '2 500 €',
    delivery: '5 jours',
    icon: '◇',
  },
  {
    name: 'Assistant developpeur',
    img: '/agents-cards/assistant-developpeur.png',
    desc: 'Accompagne votre dev sur sa codebase via Claude Code dédié + skills custom.',
    price: 'Sur devis',
    delivery: 'Custom',
    icon: '⌗',
  },
  {
    name: 'Generateur fiches produit',
    img: '/agents-cards/generateur-fiches-produit.png',
    desc: 'Catalogue e-commerce : titre, description, balises SEO, traduction.',
    price: '0.10 €/fiche',
    delivery: 'Volume',
    icon: '▤',
  },
];

const DIY_OPTIONS = [
  {
    name: 'Pack onboarding dev',
    img: '/agents-cards/pack-onboarding-dev.png',
    desc: '1 skill custom fabrique pour vous + demo install + 1h coaching pour comprendre comment poser un skill. Apres, vous etes autonome.',
    price: '450 €',
    delivery: 'one-shot',
    icon: '◈',
  },
  {
    name: 'Skill .md telechargeable',
    img: '/agents-cards/skill-md-telechargeable.png',
    desc: 'Tous les skills du catalogue ci-contre vendus en .md téléchargeable. Pour devs déjà onboardés qui savent installer.',
    price: '99 €',
    delivery: '/ skill',
    icon: '⊡',
  },
  {
    name: 'Bibliothèque complète',
    img: '/agents-cards/bibliotheque-complete.png',
    desc: 'Accès à partir de 22 skills custom (suppléments sur devis) + futurs skills publiés. Renouvelable annuellement. Accès GitHub privé ou export ZIP.',
    price: '690 €',
    delivery: '/ an',
    icon: '⊞',
  },
  {
    name: 'Coaching ad hoc',
    img: '/agents-cards/coaching-ad-hoc.png',
    desc: 'Question précise sur un skill, un workflow, une intégration. RDV 1h en visio. Pas de prep nécessaire.',
    price: '120 €',
    delivery: '/ heure',
    icon: '◐',
  },
  {
    name: 'Skill custom sur brief',
    img: '/agents-cards/skill-custom-sur-brief.png',
    desc: 'Vous décrivez votre workflow récurrent, je fabrique le skill dédié. Documentation + tests + livraison .md.',
    price: 'A partir de 350 €',
    delivery: '2-4 jours',
    icon: '⌬',
  },
  {
    name: 'Audit skills existants',
    img: '/agents-cards/audit-skills-existants.png',
    desc: 'Vous avez déjà des skills, j\'audite + recommandations + refactor pour qualité production. Livre rapport écrit.',
    price: '600 €',
    delivery: '2 jours',
    icon: '◭',
  },
];

const OPENCLAW_AGENTS = [
  {
    name: 'Chatbot citoyen souverain',
    img: '/agents-cards/chatbot-citoyen-souverain.png',
    desc: 'MairieBot souverain (OpenClaw, Hermes ou Ollama), déployé sur votre serveur. Données jamais cloud.',
    price: '2 700 €',
    delivery: '5 jours',
    icon: '◭',
  },
  {
    name: 'Classification documents internes',
    img: '/agents-cards/classification-documents-internes.png',
    desc: 'DocuSweep on-premise. Tri archives, contrats, dossiers.',
    price: '2 700 €',
    delivery: '5 jours',
    icon: '⊞',
  },
  {
    name: 'FAQ chatbot RGPD',
    img: '/agents-cards/faq-chatbot-rgpd.png',
    desc: 'Repond aux questions sur vos docs sans rien envoyer dehors.',
    price: '2 700 €',
    delivery: '5 jours',
    icon: '◌',
  },
  {
    name: 'Transcription audio sensible',
    img: '/agents-cards/transcription-audio-sensible.png',
    desc: 'Whisper local + Qwen3 pour notes. Reunions confidentielles.',
    price: '1 900 €',
    delivery: '3 jours',
    icon: '◉',
  },
  {
    name: 'Recherche dans archives',
    img: '/agents-cards/recherche-dans-archives.png',
    desc: 'Memorial avec recherche semantique sur fonds documentaires.',
    price: '2 700 €',
    delivery: '5 jours',
    icon: '⊟',
  },
  {
    name: 'Extraction infos contrats',
    img: '/agents-cards/extraction-infos-contrats.png',
    desc: 'OCR + LLM local pour extraire montants, dates, parties.',
    price: 'Sur volume',
    delivery: 'Devis',
    icon: '⌬',
  },
  {
    name: 'Suggestion réponses RH',
    img: '/agents-cards/suggestion-reponses-rh.png',
    desc: 'Modele forme sur votre conventionnel collectif et politique.',
    price: '2 700 €',
    delivery: '5 jours',
    icon: '◭',
  },
  {
    name: 'Agent veille interne',
    img: '/agents-cards/agent-veille-interne.png',
    desc: 'Surveille vos canaux internes (Slack, mail) pour signaux faibles.',
    price: '2 700 €',
    delivery: '5 jours',
    icon: '◍',
  },
];

// Les trois tours, telles que la scene 3D les presente. Les resumes sont
// volontairement plus courts que dans les colonnes : la pancarte annonce, la
// colonne detaille.
const PILLARS = [
  {
    anchor: 'tour-openclaw',
    famille: 'Tour A - souverain',
    name: 'SOUVERAIN',
    force: 'RGPD - 100% local',
    summary:
      "OpenClaw, Hermes ou Ollama + Qwen3 / Mistral sur votre serveur, selon votre machine. Un agent qui apprend chez vous. Aucune donnee ne sort. Mairies, juridique, sante.",
    hue: '#5AD4B6',
    node: 'tower_openclaw',
    hx: 2.3,
    hy: 2.3,
    chamfer: 0.62,
    agents: OPENCLAW_AGENTS.map((a) => ({ name: a.name, desc: a.desc, price: a.price, delivery: a.delivery, icon: a.icon, img: a.img })),
  },
  {
    anchor: 'tour-claude',
    famille: 'Tour B - cloud',
    name: 'CLAUDE, MISTRAL & autres API',
    force: 'Performance - Polyvalence',
    summary:
      "Claude Sonnet ou Opus en SaaS. Déploiement rapide, coût à l'usage, données chez Anthropic.",
    hue: '#2CC46A', // vert matrix tempere — plus de jaune-vert pomme
    node: 'tower_claude',
    hx: 2.1,
    hy: 2.55,
    chamfer: 0.42,
    agents: CLAUDE_AGENTS.map((a) => ({ name: a.name, desc: a.desc, price: a.price, delivery: a.delivery, icon: a.icon, img: a.img })),
  },
  {
    anchor: 'tour-diy',
    famille: 'Tour C - autonomie',
    name: 'DIY DEV',
    force: 'Vous gardez la main',
    summary:
      "Les skills, la méthode et le coaching. Vous installez, vous modifiez, vous n'avez plus besoin de moi.",
    hue: '#8FB4D8', // bleu metallique
    node: 'tower_diy',
    hx: 2.55,
    hy: 2.05,
    chamfer: 0.86,
    agents: DIY_OPTIONS.map((a) => ({ name: a.name, desc: a.desc, price: a.price, delivery: a.delivery, icon: a.icon, img: a.img })),
  },
];

export default function MarketplacePage() {
  return (
    <main className="bg-obsidian min-h-screen">
      {/* HERO */}
      <section className="relative pt-40 pb-20 border-b border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-accent" />
            Catalogue · 3 voies selon votre profil
          </div>
          <h1 className="display-cyber-h1 text-aqua mb-8">
            <span className="grad-volt">CLAUDE &+</span> · <span className="grad-volt-mint">SOUVERAIN</span><br />
            · <span className="text-aqua">DIY DEV</span>
          </h1>
          <p className="text-base lg:text-lg text-aqua/70 max-w-3xl font-light leading-relaxed mb-6">
            Trois voies selon votre profil : <span className="text-aqua font-medium">Claude API (& autres: OpenAi, Deepseek...)</span> ou <span className="text-aqua font-medium">souverain auto-hébergé (OpenClaw, Hermes, Ollama + Qwen3, Mistral, Kimi...)</span> pour les structures qui veulent un livrable clé-en-main avec support inclus.
            <span className="text-aqua font-medium"> DIY Dev</span> pour les developpeurs qui savent (ou apprennent) a poser un skill Claude Code et veulent juste les outils.
          </p>
          <div className="bg-accent/5 border-l-2 border-accent/60 pl-5 py-3 max-w-3xl">
            <p className="font-monodisp text-[11px] uppercase tracking-[0.18em] text-accent/80 leading-relaxed">
              Honnête : si vous maîtrisez la gestion de skills, les connecteurs et MCP Claude Code, ne payez pas le prix livrable clé-en-main. La 3e tour d'agents est ce que vous recherchez.
            </p>
          </div>
        </div>
      </section>

      {/* THREE COLUMNS */}
      {/* En-tete 3D de la comparaison. Ne s'affiche qu'en pointeur fin, grand
          ecran et mouvement autorise ; sinon on passe directement aux colonnes. */}
      <ComparisonTowers pillars={PILLARS} />

      {/* Les trois colonnes d'origine, repliees sous la scene 3D : les cartes
          vivent desormais sur les tours ; ici, la vue d'ensemble, deroulable.
          Accordeon fluide (SmoothDetails) ; un lien vers #tour-... l'ouvre puis y descend. */}
      <SmoothDetails summary="Derouler pour une vue d'ensemble des trois tours d'agents" meta="22 agents · 3 tours · souverain, cloud, autonomie">
      <section className="py-20">
        <div className="max-w-[1500px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-accent/15">
            {/* COLONNE OPENCLAW */}
            <div id="tour-openclaw" className="scroll-mt-24 bg-obsidian p-8 lg:p-12">
              <div className="flex items-baseline justify-between mb-12 pb-6 border-b border-accent/30">
                <div>
                  <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
                    Tour A · souverain
                  </div>
                  <h2 className="display-cyber-h2 text-aqua">SOUVERAIN</h2>
                </div>
                <div className="text-right">
                  <div className="font-monodisp text-[9px] tracking-[0.2em] uppercase text-accent/60 mb-1">
                    Force
                  </div>
                  <div className="font-monodisp text-xs text-aqua">RGPD · 100% local</div>
                </div>
              </div>

              <p className="text-sm text-aqua/70 mb-10 leading-relaxed font-light">
                La voie souveraine adaptée à votre machine — OpenClaw, Hermes ou Ollama — avec Qwen3 / Mistral déployés
                sur votre serveur : un agent qui garde sa memoire chez vous.
                <span className="text-aqua"> Aucune donnee n'envoie nulle part.</span> Conforme RGPD strict,
                ideal mairies, juridiques, sante, defense. Forfait 2 700 € · 5 jours · sans abonnement.
              </p>

              <div className="space-y-5">
                {OPENCLAW_AGENTS.map((a, i) => (
                  <div
                    key={a.name}
                    data-sfx="catalogue" className="group relative bg-carbon/40 border border-accent/15 hover:border-accent/50 hover:bg-carbon/70 p-7 lg:p-8 transition-all clip-civ-sm"
                  >
                    <div className="flex items-start gap-5">
                      <AgentThumb icon={a.icon} img={(a as { img?: string }).img} name={a.name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3 mb-1">
                          <h3 className="font-monodisp text-[15px] text-aqua font-medium uppercase tracking-wider">
                            {a.name}
                          </h3>
                          <span className="font-monodisp text-sm text-accent shrink-0">{a.price}</span>
                        </div>
                        <p className="text-[15px] text-aqua/70 font-light leading-relaxed mb-3 whitespace-pre-line">{a.desc}</p>
                        <div className="font-monodisp text-[10px] text-aqua/40 tracking-wider uppercase">
                          → {a.delivery}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="mailto:tabascocity@proton.me?subject=Agent%20souverain%20sur%20mesure"
                className="block text-center mt-8 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold py-4 hover:bg-aqua transition-colors clip-civ-sm"
              >
                Commander un agent souverain →
              </a>
            </div>

            {/* COLONNE CLAUDE */}
            <div id="tour-claude" className="scroll-mt-24 bg-obsidian p-8 lg:p-12">
              <div className="flex items-baseline justify-between mb-12 pb-6 border-b border-accent/30">
                <div>
                  <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
                    Tour B · cloud
                  </div>
                  <h2 className="display-cyber-h2 text-aqua">CLAUDE API</h2>
                </div>
                <div className="text-right">
                  <div className="font-monodisp text-[9px] tracking-[0.2em] uppercase text-accent/60 mb-1">
                    Force
                  </div>
                  <div className="font-monodisp text-xs text-aqua">Performance · Polyvalence</div>
                </div>
              </div>

              <p className="text-sm text-aqua/70 mb-10 leading-relaxed font-light">
                Modele Claude Sonnet/Opus en SaaS Anthropic. Performance maximale, deploiement rapide,
                coûts à l'usage. <span className="text-aqua">Vos données transitent par les serveurs Anthropic
                (USA, conforme SOC 2 / ISO 27001).</span>
              </p>

              <div className="space-y-5">
                {CLAUDE_AGENTS.map((a, i) => (
                  <div
                    key={a.name}
                    data-sfx="catalogue" className="group relative bg-carbon/40 border border-accent/15 hover:border-accent/50 hover:bg-carbon/70 p-7 lg:p-8 transition-all clip-civ-sm"
                  >
                    <div className="flex items-start gap-5">
                      <AgentThumb icon={a.icon} img={(a as { img?: string }).img} name={a.name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3 mb-1">
                          <h3 className="font-monodisp text-[15px] text-aqua font-medium uppercase tracking-wider">
                            {a.name}
                          </h3>
                          <span className="font-monodisp text-sm text-accent shrink-0">{a.price}</span>
                        </div>
                        <p className="text-[15px] text-aqua/70 font-light leading-relaxed mb-3 whitespace-pre-line">{a.desc}</p>
                        <div className="font-monodisp text-[10px] text-aqua/40 tracking-wider uppercase">
                          → {a.delivery}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="mailto:tabascocity@proton.me?subject=Agent%20Claude%20API"
                className="block text-center mt-8 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold py-4 hover:bg-aqua transition-colors clip-civ-sm"
              >
                Commander un agent Claude, Deepseek V4, Kimi K3... →
              </a>
            </div>

            {/* COLONNE DIY DEV */}
            <div id="tour-diy" className="scroll-mt-24 bg-obsidian p-8 lg:p-10">
              <div className="flex items-baseline justify-between mb-12 pb-6 border-b border-accent/30">
                <div>
                  <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
                    Tour C · autonomie
                  </div>
                  <h2 className="display-cyber-h2 text-aqua">DIY DEV</h2>
                </div>
                <div className="text-right">
                  <div className="font-monodisp text-[9px] tracking-[0.2em] uppercase text-accent/60 mb-1">
                    Force
                  </div>
                  <div className="font-monodisp text-xs text-aqua">Outils + autonomie</div>
                </div>
              </div>

              <p className="text-sm text-aqua/70 mb-10 leading-relaxed font-light">
                Pour développeurs déjà à l'aise avec Claude Code (ou prêts à apprendre).
                <span className="text-aqua"> Une fois le pack onboarding fait, vous etes autonome —</span>
                vous achetez juste les skills .md ou la bibliothèque complète, sans repayer du livrable clé-en-main.
              </p>

              <div className="space-y-5">
                {DIY_OPTIONS.map((a) => (
                  <div
                    key={a.name}
                    data-sfx="catalogue" className="group relative bg-carbon/40 border border-accent/15 hover:border-accent/50 hover:bg-carbon/70 p-7 lg:p-8 transition-all clip-civ-sm"
                  >
                    <div className="flex items-start gap-5">
                      <AgentThumb icon={a.icon} img={(a as { img?: string }).img} name={a.name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3 mb-1">
                          <h3 className="font-monodisp text-[15px] text-aqua font-medium uppercase tracking-wider">
                            {a.name}
                          </h3>
                          <span className="font-monodisp text-sm text-accent shrink-0">{a.price}</span>
                        </div>
                        <p className="text-[15px] text-aqua/70 font-light leading-relaxed mb-3 whitespace-pre-line">{a.desc}</p>
                        <div className="font-monodisp text-[10px] text-aqua/40 tracking-wider uppercase">
                          → {a.delivery}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="mailto:tabascocity@proton.me?subject=Pack%20DIY%20Dev%20Claude%20Code"
                className="block text-center mt-8 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold py-4 hover:bg-aqua transition-colors clip-civ-sm"
              >
                Commander pack onboarding →
              </a>
            </div>
          </div>
        </div>
      </section>
      </SmoothDetails>

      {/* AGENTS MAISON — ce qui tourne deja dans QISHIM-CORTEX */}
      <section id="agents-maison" className="scroll-mt-24 py-20 border-t border-accent/15 bg-carbon/20">
        <div className="max-w-[1500px] mx-auto px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
            <h2 className="display-cyber-h2 text-aqua">AGENTS MAISON</h2>
            <span className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent/60">
              {MAISON_AGENTS.length} outils · construits et en service
            </span>
          </div>
          <p className="text-sm text-aqua/60 font-light leading-relaxed max-w-2xl mb-10">
            Pas des maquettes : des outils qui tournent chez nous tous les jours. Ce sont eux
            qui font marcher le studio, la moderation, la voix et la prospection de l&apos;ecosysteme.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MAISON_AGENTS.map((a) => (
              <div
                key={a.name}
                data-sfx="catalogue" className="group relative bg-carbon/40 border border-accent/15 hover:border-accent/50 hover:bg-carbon/70 p-7 lg:p-8 transition-all clip-civ-sm"
              >
                <div className="flex items-start gap-5">
                  <AgentThumb icon={a.icon} img={a.img} name={a.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <h3 className="font-monodisp text-[15px] text-aqua font-medium uppercase tracking-wider">
                        {a.name}
                      </h3>
                      <span className="font-monodisp text-sm text-accent shrink-0">{a.price}</span>
                    </div>
                    <p className="text-[15px] text-aqua/70 font-light leading-relaxed mb-3 whitespace-pre-line">{a.desc}</p>
                    <div className="font-monodisp text-[10px] text-aqua/40 tracking-wider uppercase">
                      → {a.delivery}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* COMPARATIF MINI */}
      <section className="py-20 bg-carbon/40 border-y border-accent/15">
        <div className="max-w-[1100px] mx-auto px-8">
          <div className="hud-label mb-6 text-center">comparatif technique</div>
          <h2 className="display-cyber-h2 text-aqua text-center mb-16">
            CLAUDE <span className="text-accent">vs</span> SOUVERAIN
          </h2>

          <div className="grid grid-cols-3 gap-px bg-accent/15">
            {[
              ['Critere', 'Claude API', 'Souverain on-premise'],
              ['Hebergement', 'Anthropic (USA)', 'Votre serveur · on-premise'],
              ['Conformite RGPD', 'Standard (DPA)', 'Maximale · zero exfiltration'],
              ['Cout', 'A l\'usage (pay-per-token)', 'Setup + infra · pas d\'API'],
              [
                'Modeles 2026',
                'Claude (Fable, Opus, Sonnet)',
                'Qwen 3.8-27B · Kimi K3 · Mistral — poids ouverts',
              ],
              ['Latence', '500ms-3s API', '1-5s GPU local'],
              ['Internet requis', 'Oui', 'Non (offline-capable)'],
              ['Mise a jour modele', 'Automatique cote editeur', 'Vous choisissez quand, et quel modele'],
              ['Apprentissage', 'Aucun entre deux sessions', 'Skills auto-crees + memoire locale (OpenClaw / Hermes)'],
              ['Public ideal', 'PME, scale-ups, agences', 'Mairies, sante, juridique, defense'],
            ].map((row, idx) => (
              <div key={idx} className="contents">
                {row.map((cell, ci) => (
                  <div
                    key={ci}
                    className={
                      idx === 0
                        ? 'bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.2em] font-bold p-4'
                        : 'bg-obsidian p-4 text-sm font-light' +
                          (ci === 0 ? ' font-monodisp text-[11px] uppercase tracking-wider text-accent/80' : ' text-aqua/85')
                    }
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Etat de l'art local — chiffres verifies le 02/09/2026 */}
          <div className="mt-16">
            <div className="hud-label mb-6">ou en est le local · septembre 2026</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-accent/15">
              {[
                {
                  t: 'Le local a rattrape le cloud',
                  d: "Qwen 3.8 et Kimi K3 revendiquent des scores comparables aux meilleurs modeles proprietaires, poids ouverts a l'appui. Pour une mairie, le choix n'est plus entre souverain et performant.",
                },
                {
                  t: 'Mais un geant reste un geant',
                  d: "Ces modèles-là demandent un vrai serveur. Ce qui tient chez vous, ce sont leurs déclinaisons compactes — Qwen 3.8-27B, ou Flash-Next et ses 6 milliards de paramètres actifs par token. Déjà bien au-delà de ce qu'un agent métier réclame.",
                },
                {
                  t: 'La video a suivi',
                  d: 'Wan 3.0 en Apache 2.0, LTX-2.5 et son audio synchronisé natif, MiniMax H3 en poids ouverts. Une communication vidéo complète se produit désormais sur une seule machine, sans abonnement.',
                },
              ].map((c) => (
                <div key={c.t} className="bg-obsidian p-7 lg:p-8">
                  <h3 className="font-monodisp text-[13px] text-accent uppercase tracking-[0.18em] mb-4">
                    {c.t}
                  </h3>
                  <p className="text-[15px] text-aqua/70 font-light leading-relaxed">{c.d}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 font-monodisp text-[10px] text-ash tracking-[0.15em] uppercase leading-relaxed">
              Verifie le 02.09.2026 · Oui, une demonstration fait tourner 2,8 milliards de milliards de
              paramètres sur 8 Go de RAM — au prix de 10 à 30 secondes par token et de 1,7 To de SSD.
              C&apos;est une prouesse, pas encore un outil. Nous ne deployons que ce qui tient en production.
            </p>
          </div>
        </div>
      </section>


      {/* CTA final */}

      <section className="py-32 bg-obsidian">
        <div className="max-w-[1400px] mx-auto px-8 text-center">
          <div className="hud-label mb-8 inline-block">Vous hésitez ou avez une demande précise ? RDV decouverte gratuit</div>
          <h2 className="display-cyber-h2 mb-10">
            <span className="text-aqua">PAS SUR DE VOTRE </span>
            <span className="grad-volt">CHOIX</span>
            <span className="text-aqua"> ?</span>
          </h2>
          <p className="text-base text-aqua/70 mb-10 max-w-xl mx-auto font-light">
            30 minutes de cadrage gratuit pour déterminer la voie qui vous convient — Claude cloud ou souverain on-premise (OpenClaw, Hermes, Ollama) — selon vos données, contraintes et budget.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {/* data-sfx="forfait" (11/09) : meme son que le choix d'un forfait tarifs. */}
            <Link
              href="/tarifs#rdv"
              data-sfx="forfait"
              className="inline-flex items-center gap-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold px-10 py-5 hover:bg-aqua transition-colors clip-civ-sm"
            >
              RDV decouverte 30min
              <span className="font-monodisp">→</span>
            </Link>
            <Link
              href="/agents"
              data-sfx="forfait"
              className="inline-flex items-center gap-3 border border-accent/30 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-10 py-5 hover:border-accent hover:text-accent transition-colors clip-civ-sm"
            >
              {/* 20, pas 12 : /agents compte desormais Tintenfisch + 7 outils maison (11/09). */}
              Voir les 20 agents existants
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
