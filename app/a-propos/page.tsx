'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const LiquidChrome = dynamic(() => import('@/components/LiquidChrome'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-obsidian" />,
});

const stack = {
  ia: ['Claude API', 'Claude Code', 'OpenClaw', 'Hermes Agent', 'Ollama', 'Qwen3', 'Mistral', 'Llama 3', 'MCP', 'ComfyUI', 'Hunyuan'],
  frontend: ['React', 'Next.js', 'Three.js', 'R3F', 'Prisma', 'Tailwind', 'Vue', 'Sass'],
  backend: ['Python', 'FastAPI', 'Django', 'Node', 'Express', 'PostgreSQL', 'MongoDB', 'PHP','Symfony','Docker', 'AWS', 'Linux', 'HTTP3','GRPC','Quic','HLS','VPS','WSL'],
  art: ['Photoshop · 20 ans', 'Illustrator · +50 creas', 'Premiere · 7 ans', 'After Effects · +20 compos', 'Blender 3D', 'Audition'],
};

const experiences = [
  {
    period: '2024 — 2026',
    title: 'Consultant IA & Architecte Agentique',
    org: 'Consultant IA indépendant',
    sections: [
      {
        label: 'Prestations IA (cas d\'usage types)',
        items: [
          "Agents IA d'automatisation pour PME : traitement docs, génération contenus, réponses clients",
          "Chatbots Claude/Mistral pour associations & collectivités (FAQ citoyens, accompagnement adhérents)",
          "Pipelines IA générative pour communication : visuels réseaux sociaux, supports print, vidéo",
          "Audit & cartographie de processus automatisables — recommandations ROI immédiat",
        ],
      },
      {
        label: 'Pratique technique avancée',
        items: [
          "Agents Claude + Python en production (Hostinger, cron, monitoring) — cas d'usage métier réels",
          "Agents souverains auto-hébergés en production (OpenClaw, Ollama, Qwen3) : skills, mémoire locale, cron, gateway messageries — 100 % on-premise",
          "Skills Claude Code maison (à partir de 22 publiés, suppléments sur devis), portables au format ouvert agentskills.io : les agents sont livrés déjà skillés",
          "Stack LLM locale opérationnelle : Ollama, Qwen3, Mistral, Llama 3 — contexte 64k, appel d'outils",
          "Intégration MCP (Model Context Protocol), pipelines ComfyUI local, automatisation créative",
          "Architecte QISHIM-CORTEX : 12 cortex, 60 agents — laboratoire R&D permanent",
        ],
      },
    ],
  },
  {
    period: '2021 — 2023',
    title: 'Formateur Bootcamp Dev Web & Numérique',
    org: 'Insersite (Yvelines)',
    meta: '160 apprenants formés · 3 cohortes bootcamp · 2 ans temps plein',
    sections: [
      {
        label: 'Conception & animation pédagogique',
        items: [
          "Conception complète de curricula bootcamp (du syllabus aux projets fil rouge)",
          "Animation cours en présentiel et à distance, suivi individuel, évaluation continue",
          "Adaptation pédagogique à publics hétérogènes (reconversion, demandeurs d'emploi)",
        ],
      },
      {
        label: 'Stack enseignée',
        items: [
          "HTML, CSS, JavaScript, PHP, MySQL, MongoDB, NPM",
          "React, Node, Tailwind, Bootstrap, Three.js, Symfony",
          "VSCode, PHPMyAdmin, XAMPP, Leonardo, Dall-E 3, Blender · introduction IA générative",
        ],
      },
      {
        label: 'Événementiel & rayonnement',
        items: [
          "Conférence Web3 (cryptomonnaie, propriété culturelle, EdTech) — +100 personnes",
          "Plateaux techniques métiers du numérique — +200 participants en 2 ans",
          "Tournois e-sport jusqu'à 70 participants : conception, mise en place, management",
        ],
      },
    ],
  },
  {
    period: '2007 — 2020',
    title: 'Parcours pluridisciplinaire international',
    org: 'France · Espagne · Malaisie',
    meta: 'Tech, commercial, création, helpdesk multilingue',
    sections: [
      {
        label: 'Trajectoires',
        items: [
          "Site BD personnelle mulunumu.com (création 2007)",
          "Helpdesk multilingue (ES/EN/FR) — Sitel, Barcelona (2008-2011)",
          "Commercial — Orangina (2011-2013)",
          "Démarchage concepteur-scénariste TV — Astro 1 & 2, Kuala Lumpur (2013)",
          "Graphiste freelance, illustrateur, paysagiste — Éditions Atramenta, Coyote Production, Equalis (2011-2020)",
        ],
      },
    ],
  },
];

const realisations = [
  { t: 'QISHIM-CORTEX', d: 'Système analytique multi-agents (12 cortex, 60 agents, MCP)', tag: 'Architecture' },
  { t: 'Agents Claude+Python en prod', d: 'Hostinger, cron, monitoring — automatisations métier réelles', tag: 'Production' },
  { t: 'Stack souveraine multi-voies', d: 'OpenClaw, Hermes, Ollama + Qwen3 / Mistral / Kimi — agents auto-hébergés, souveraineté des données', tag: 'Infra' },
  { t: '160 apprenants formés', d: 'Bootcamp Insersite — capacité à vulgariser l\'IA', tag: 'Pédagogie' },
  { t: 'Livre publié', d: 'Saga fantastique "Guerres Sources et Maudits"', tag: 'Édition' },
  { t: 'Structure française déclarée', d: 'Facturation professionnelle · devis fermes sous 48 h', tag: 'Statut' },
];

type TeamMember = {
  name: string; role: string; title: string; desc: string; strength: string;
  skills: string[]; type: string; grad: string; initials: string;
  photo?: string; cv?: string; site?: string; sasu?: string; badge?: string;
  website?: string; links?: { label: string; url: string }[]; githubs?: string[];
  manifest?: string; fondateur?: string;
};

/**
 * TeamPhoto — petite vignette top-left (11/09 : "les photos sont trop
 * grandes", elles occupaient un bandeau de 280px). Meme secours que
 * AgentThumb (marketplace/page.tsx) mais cote CLIENT : cette page est
 * 'use client' (IntersectionObserver des reveals), pas d'acces a fs — donc
 * on tente la vraie photo et on bascule sur le gradient + initiales au
 * premier onError, pour Siham/Christina dont la photo n'est pas encore
 * deposee dans public/team/.
 */
// BUG CORRIGE 12/09/2026 : le nom de fichier etait devine ("<slug>.png" fixe) au lieu
// d'etre fourni par la donnee. `naim.webp` (deppose le 12/09, format allege) tombait donc
// sur un onError silencieux -> fallback degrade+initiales affiche a la place de la vraie
// photo. En plus, "Naïm" (tréma) donnait un slug "naïm" qui n'a jamais correspondu a aucun
// fichier, meme en .png. Desormais chaque membre declare son `photo` (chemin complet, avec
// la bonne extension) ; TeamPhoto ne devine plus rien.
function TeamPhoto({ photo, name, grad, initials, isAi }: { photo?: string; name: string; grad: string; initials: string; isAi: boolean }) {
  const [failed, setFailed] = useState(false);
  const showFallback = isAi || !photo || failed;
  return (
    <div className="relative w-16 h-16 shrink-0 overflow-hidden border border-accent/30 clip-civ-sm">
      {showFallback ? (
        <>
          <div className="absolute inset-0" style={{ background: grad }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-lg text-white/90 font-medium">{initials}</span>
          </div>
        </>
      ) : (
        <>
          <img
            src={photo}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-500 group-hover:scale-110"
            onError={() => setFailed(true)}
          />
          {/* Filtre leger au survol de la card : le degrade signature du membre
              (le meme que sous les photos absentes) tinte la photo N&B. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500"
            style={{ background: grad, mixBlendMode: 'overlay' }}
          />
        </>
      )}
    </div>
  );
}

/**
 * CvDropdown — le CV "en menu deroulant dans sa card" (11/09), au lieu d'un
 * simple lien de telechargement statique. Meme technique que SmoothDetails
 * (marketplace) — grid-template-rows 0fr -> 1fr, pas de <details> qui ouvre
 * d'un coup — mais redimensionnee pour une carte, pas une section pleine page.
 */
function CvDropdown({ cvUrl, summary }: { cvUrl: string; summary: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-accent/15 pt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between font-monodisp text-[10px] uppercase tracking-[0.2em] text-accent hover:text-aqua transition-colors"
      >
        <span>CV · derouler</span>
        <span aria-hidden className="transition-transform duration-300" style={{ transform: open ? 'rotate(90deg)' : 'none' }}>
          →
        </span>
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <div className="min-h-0 overflow-hidden">
          <ul className="space-y-1.5 mt-3 mb-3">
            {summary.map((s) => (
              <li key={s} className="text-[12px] text-aqua/70 font-light leading-snug flex gap-2">
                <span className="text-accent/60 shrink-0">→</span>
                {s}
              </li>
            ))}
          </ul>
          <a
            href={cvUrl}
            download
            className="block text-center font-monodisp text-[10px] uppercase tracking-[0.2em] py-2.5 border border-accent/40 text-aqua hover:bg-accent hover:text-obsidian transition-colors clip-civ-sm"
          >
            ↓ Telecharger le CV.PDF
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ParcoursPage() {
  // CV complet de Naïm: accordeon pleine largeur sous la grille equipe,
  // pilote depuis sa card (12/09). `settled` relache l'overflow une fois
  // l'ouverture finie, sinon les periodes `sticky` des experiences ne collent plus.
  const [cvOpen, setCvOpen] = useState(false);
  const [cvSettled, setCvSettled] = useState(false);
  const toggleCv = () => {
    const next = !cvOpen;
    setCvOpen(next);
    if (!next) setCvSettled(false);
    // Memes sons que l'accordeon des agents (SmoothDetails) : deroulement a
    // l'ouverture, clic sec a la fermeture — les boutons sont en data-sfx="none"
    // pour ne pas cumuler avec le clic generique de SoundLayer.
    window.dispatchEvent(new CustomEvent('tve:sfx', { detail: { name: next ? 'menuOpen' : 'menuClose' } }));
    // Ouverture : le haut du CV a l'ecran. Fermeture : retour sur la card de
    // Naïm(viser l'accordeon replie ne marche pas : trop peu de contenu
    // dessous, le navigateur bute sur la fin de page et laisse voir le CTA).
    window.setTimeout(() => {
      const target = next
        ? document.getElementById('cv-Naïm')
        : document.querySelector('button[aria-controls="cv-Naïm"]')?.closest('article');
      target?.scrollIntoView({ behavior: 'smooth', block: next ? 'start' : 'end' });
    }, 60);
  };

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
      // threshold 0 : declenche des que le bloc entre a l'ecran, meme si c'est un
      // grand conteneur (grille des 11 membres en grid-cols-1 sur mobile : 12 %
      // n'etaient jamais visibles d'un coup -> cards restaient invisibles). Un
      // rootMargin positif revele juste avant l'entree, pour la fluidite.
    }, { threshold: 0, rootMargin: '0px 0px 80px 0px' });
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* HERO — Liquid Chrome Sovereign */}
      <section className="relative h-screen min-h-[760px] overflow-hidden">
        <div className="absolute inset-0">
          <LiquidChrome />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/70 to-transparent pointer-events-none z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-obsidian/30 pointer-events-none z-[2]" />

        <div className="relative z-10 h-full max-w-[1400px] mx-auto px-8 flex items-center">
          <div className="max-w-3xl">
            <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-10 flex items-center gap-3">
              <span className="w-8 h-px bg-accent" />
              A propos
            </div>

            <h1 className="display-sov-h1 text-aqua mb-10">
              <span className="accent grad-fusion">Architectes</span> agentiques<br />
              <span className="text-aqua/70">& consultants IA.</span>
            </h1>

            <p className="text-base lg:text-lg text-aqua/70 max-w-2xl mb-10 font-light leading-relaxed">
              Union de savoir-faire · <span className="text-aqua">9 humains pluridisciplinaires + 12 cortex IA de 60 agents</span> bien avant Ruflow et même les Claude skills. Force de frappe hybride pour PME, mairies, associations.
              <span className="text-aqua"> 240 apprenants formés </span>· 20 ans de direction artistique · 10 ans de programmation 
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:tabascocity@proton.me?subject=Demande%20CV%20PDF"
                className="inline-flex items-center gap-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-medium px-6 py-4 hover:bg-aqua transition-colors clip-civ-sm"
              >
                Recevoir le CV PDF
                <span>→</span>
              </a>
              <a
                href="/tarifs"
                className="inline-flex items-center gap-3 border border-accent/30 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-6 py-4 hover:border-accent hover:text-accent transition-colors clip-civ-sm"
              >
                Voir les tarifs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION EQUIPE — 9 membres (Siham + Christina ajoutees le 11/09) */}
      <section className="py-32 bg-obsidian border-t border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-16 reveal">
            <div className="col-span-12 lg:col-span-3">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                01 / Equipe
              </div>
            </div>
            <div className="col-span-12 lg:col-span-9">
              <h2 className="display-sov-h2 text-aqua mb-6">
                10 entités <span className="grad-mint">pluridisciplinaires</span>.<br />
                9 humains indépendants · 1 cortex multi-agents.
              </h2>
            </div>
          </div>

          {/* 7 cards equipe */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 reveal-stagger">
            {([
              {
                name: 'MANON',
                role: 'Lead Full-Stack',
                title: 'Solutions financements & plateformes',
                desc: 'Architecture des plateformes web et mobile. Expertise en montage financier et solutions de financement pour PME et collectivités. Une grande expérience en tant que Lead développeuse fullstack, porteuse de projets et direction d\'entreprises. Ici, Cofondatrice de TV1E.',
                strength:'FINANCE',
                skills: ['Full-stack', 'Solutions financement', 'Plateformes', 'Stratégie produit'],
                type: 'human',
                cv: '/cv/manon.pdf',
                photo: '/team/manon.webp',
                site: '#',
                sasu: 'SASU + site dédié',
                grad: 'linear-gradient(135deg, #1A1F26 0%, #39FF14 100%)',
                initials: 'MD',
              },
              {
                name: 'YANNICK',
                role: 'Formateur & chef de projet commercial',
                title: 'Vulgarisateur d\'agents IA auprès des entreprises',
                desc: 'Forme les équipes aux agents IA et pilote le déploiement commercial en entreprise. Traduit les cas d\'usage métier en feuille de route claire, anime ateliers et montées en compétence, et fait le lien entre les besoins terrain des PME, mairies et associations et l\'équipe dev-IA. Rend l\'IA agentique concrète et adoptable, sans jargon — un dirigeant doit repartir en sachant exactement ce que l\'agent fait pour lui.',
                strength:'SALESFORCE',
                skills: ['Formation', 'Gestion de projet', 'Vulgarisation IA', 'Déploiement entreprise'],
                type: 'human',
                cv: '/cv/yannick.pdf',
                photo: '/team/yannick.webp',
                grad: 'linear-gradient(135deg, #2A1F4A 0%, #5AD4B6 100%)',
                initials: 'YK',
              },
              {
                name: 'EDDY',
                role: 'Agent organisationnel',
                title: 'Consultant managing équipe · IA inter-teams',
                desc: 'Coordonne les missions, structure les workflows, optimise les outils IA partagés entre les équipes clients. Pilote la chef d\'orchestre opérationnel. Formateur de plus de 240 élèves aux métiers du numérique avec des qualités transverses dans les médias: gestion de podcast, ingénierie sonore numérique, test d\'ia après études de benchmarks',
                strength:'MANAGEMENT',
                skills: ['Management', 'Workflows', 'IA inter-teams', 'Project mgmt'],
                type: 'human',
                cv: '/cv/eddy.pdf',
                photo: '/team/eddy.webp',
                site: '#',
                sasu: 'SASU + site dédié',
                grad: 'linear-gradient(135deg, #0F3D40 0%, #CCFF00 100%)',
                initials: 'ED',
              }, 
              {
                name: 'MATHIEU',
                role: 'Direction et Programmation',
                title: 'Consultant Python et IA · Supervision RH ',
                desc: 'Apporte des solutions novatrices de par son expérience internationale et sa veille technologique. Propose des orientations d\'auto-maintenance des agents. Définit les solutions et équipes optimales pour chaque mission. Supervision, audit et amélioration des produits.',
                strength:'STRATÉGIE D\'INNOVATION',
                skills: ['Python', 'Research & development', 'IA inter-teams', 'Veille polyglotte'],
                type: 'human',
                cv: '/cv/mat.pdf',
                photo: '/team/matelo.webp',
                site: '#',
                sasu: 'Aucune',
                grad: 'linear-gradient(135deg, #1f1f56 0%, #285e94 100%)',
                initials: 'ML',
              }, 
              {
                name: 'ALEX',
                role: 'Growth Marketer',
                title: 'Strategy Marketing Digital & Video IA',
                desc: 'Pilote des stratégies d\'acquisition et de croissance, puis produit lui-même les créations fonctionnant via un pipeline en constante évolution. Concepteur d\'applications web et mobile. Possède sa propre application en production et une SASU dédiée. Apporte sa vision stratégique et son expertise growth.',
                strength:'MARKETING',
                skills: ['App development', 'SaaS', 'Mobile', 'Scaling', 'Stratégie digitale, marketing réseaux'],
                type: 'human',
                cv: '/cv/alex.pdf',
                photo: '/team/alex.png',
                site: '#',
                sasu: 'SASU + app dédiée',
                grad: 'linear-gradient(135deg, #14141A 0%, #00FFE5 100%)',
                initials: 'AX',
              },
              {
                name: 'SIHAM',
                role: 'Relation clients & commerciale',
                title: 'Intermédiaire équipe dev-IA · mairies, PME, associations',
                desc: "Premier contact avec les mairies, PME et associations : elle cadre le besoin, définit la durée de gestation et de déploiement selon l'échelle d'actions développée en interne, traduit les étapes du projet sans jargon pour l'équipe dev-IA, et suit la mission jusqu'à la livraison. Role clef lors d'événement tech, elle présente nos nouveautés en conférence et enrichit notre portefeuille de solutions B2B.",
                strength:'PUBLIC RELATION',
                skills: ['Prospection clients humains', 'Evénementiel', 'Conférences', 'B2B', 'Cadrage besoin'],
                type: 'human',
                cv: '/cv/siham.pdf',
                photo: undefined, // pas encore deposee (11/09)
                grad: 'linear-gradient(135deg, #a90879 0%, #f553ac 100%)',
                initials: 'SI',
              },
              {
                name: 'CHRISTINA',
                role: 'Relation clients & commerciale',
                title: 'Intermédiaire équipe dev-IA · mairies, PME, associations',
                desc: "Accompagnement des entreprises, coordinatrice de projet, liant entre la demande et la team dev, gestion du planning consultants, cadrage du besoin, vulgarisation auprès du client, suivi jusqu'à la livraison. Elle couvre le volume de demandes sans jamais faire attendre une mairie, une PME ou une association. Spécialisée en solutions commerciales, management d'équipes et motivation sales.",
                strength:'CUSTOMER SERVICES',
                skills: ['Relation client', 'Vulgarisation', 'Cadrage besoin', 'Suivi de mission', 'juridique et recouvrement'],
                type: 'human',
                cv: '/cv/christina.pdf',
                photo: undefined, // pas encore deposee (11/09)
                grad: 'linear-gradient(135deg, #199381 0%, #6fecb8 100%)',
                initials: 'CH',
              },
              {
                name: 'ORLAND',
                role: 'Ancien développeur Php et C. Auteur · Mentor · Spécialiste algorithmes IA et passionné de sciences, langues et programmation',
                title: 'Saga "Guerres Sources et Maudits" · mentor de Naïm depuis 2010, de June depuis 2017',
                desc: 'Concepteur et lead retraité déléguant les audits et la programmation au cortex Qishim, il est aujourd\'hui davantage reconnu comme l\'auteur de la saga fantastique "Guerres Sources et Maudits" (Volume 1 : 1080 pages, ebook Cultura). Teaser vidéo original publié en 2017 — bien antérieur à l\'IA générative grand public. June illustre, pagine et recorrige ses volumes à l\'aide d\'IA en tenant compte des codes mathématiques secrets disposés dans le texte par Orland. Mentor de Naïm depuis 16 ans, de June depuis 8 ans.',
                strength:'PROGRAMMATION',
                skills: ['Narration', 'Worldbuilding', 'Codes mathématiques', 'Mentorat', 'Conceptualisation'],
                type: 'human',
                website: 'https://www.junepacifica.wixsite.com',
                photo: '/team/orland-opal.png',
                links: [
                  { label: 'Teaser YouTube · 2017', url: 'https://www.youtube.com/watch?v=rw9QA9Y6QC0' },
                  { label: 'Ebook Volume 1 · Cultura', url: 'https://www.cultura.com/p-trois-jours-guerres-sources-et-maudits-volume-1-4514962.html' },
                ],
                grad: 'linear-gradient(135deg, #4A2A1F 0%, #FF7A45 100%)',
                initials: 'OO',
              },
              {
                name: 'QISHIM',
                role: '12 Cortex IA · 60 agents',
                title: 'Quantic Intelligence Structure with Hypervisor Intuition for Modelisation',
                desc: 'Système multi-agents conçu avant Ruflo (nov 2024). 12 cortex spécialisés, 60 agents élaborés, hypervisor intuition pour modélisation stratégique. Architecte : Naïm. \n Qishim auto-évolue; améliore ses cortex dans des orientations précises basé sur l\'innovation, l\'avancée et la protection du patrimoine numérique. Ne se surcharge pas de milliers d\'agents mais améliore sans cesse ceux dont il dispose couvrant chacun de vastes champs.',
                strength:'AUTO-EVOLUTION',
                skills: ['12 cortex', '60 agents', 'MCP', 'Multi-LLM', 'auto-apprenant'],
                type: 'ai',
                manifest: '/qishim-manifest.pdf',
                grad: 'linear-gradient(135deg, #0A2E33 0%, #00FFE5 100%)',
                initials: 'QI',
                fondateur: 'Naïm',
              },
              {
                name: 'JUNE',
                role: 'Cybersécurité & pilote agents',
                title: 'Experte Kali Linux',
                desc: 'Développeuse senior orientée sécurité. Pilote des agents IA depuis Kali Linux pour les missions sensibles : pentesting, hardening, audit infrastructure. \n Youtubeuse expérimentale aux dizaines de comptes. \n Créative et autodidacte, maîtrise la suite Adobe et aujourd\'hui la couple à des skills ia pour ses réalisations motion-design de toute beauté. Hobby: fouiller les dernières architectures Linux et découvrir de nouveaux outils. ',
                strength:'CYBERSEC',
                skills: ['Kali Linux', 'Pentesting', 'Agents IA', 'Hardening'],
                type: 'human',
                cv: '/cv/june.pdf',
                photo: '/team/june.png',
                grad: 'linear-gradient(135deg, #0F3D40 0%, #5AD4B6 100%)',
                initials: 'JU',
              },
              {
                name: 'Naïm',
                role: 'Architecte agentique · Full-stack',
                title: 'Intervenant principal · Dev de ce site · Fondateur QISHIM-CORTEX',
                desc: 'Développeur de tuveuxun.expert. Fondateur de QISHIM-CORTEX (12 cortex IA, 60 agents). Développeur sites & plateformes, créateur d\'agents IA, formateur et consultant. Propose des systèmes de cryptomonnaies novateurs et des services WEB 3.0 éthique. 18 ans tech, 20 ans sur suite Adobe complète, 160 apprenants formés. Formé par Orland Opal depuis 2010.',
                strength:'DEV OPS',
                skills: ['Agents IA', 'Full-stack', 'QISHIM-CORTEX', 'Formation', 'Direction artistique', 'Conception'],
                type: 'human',
                site: 'https://tabasco.city',
                photo: '/team/naim.webp',
                githubs: ['github.com/XITO2020', 'github.com/tabascocity'],
                grad: 'linear-gradient(135deg, #1a5e63 0%, #5AD4B6 100%)',
                initials: 'N',
              },
            ] as TeamMember[]).map((m) => (
              <article
                key={m.name}
                className="group relative bg-obsidian border border-accent/25 hover:border-accent transition-all duration-500 clip-civ-md flex flex-col overflow-hidden p-6"
              >
                <span aria-hidden className="absolute top-2 left-2 w-3 h-3 border-t border-l border-accent z-10" />
                <span aria-hidden className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-accent z-10" />

                {/* Badges — HUMAN/AI + Lead, au-dessus de la photo (11/09 :
                    la photo n'occupe plus tout le haut de la carte). */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-monodisp text-[9px] tracking-[0.25em] uppercase bg-carbon px-2 py-0.5 text-aqua/70 border border-accent/20">
                    {m.type === 'ai' ? 'AI · CORTEX' : 'HUMAN · INDEP'}
                  </span>
                  {m.badge && (
                    <span className="font-monodisp text-[9px] tracking-[0.25em] uppercase bg-accent text-obsidian px-2 py-0.5 font-bold">
                      ★ {m.badge}
                    </span>
                  )}
                </div>

                {/* Photo (petite, en haut a gauche) + titre/nom/domaine a cote — 11/09. */}
                <div className="flex items-start gap-4 mb-4">
                  <TeamPhoto photo={m.photo} name={m.name} grad={m.grad} initials={m.initials} isAi={m.type === 'ai'} />
                  <div className="min-w-0 flex-1">
                    <div className="font-monodisp text-[9px] tracking-[0.2em] uppercase text-accent mb-1">
                      {m.role}
                    </div>
                    <h3 className="font-display text-xl text-aqua font-medium tracking-tight leading-tight">
                      {m.name}
                    </h3>
                    <div className="font-monodisp text-[9px] text-aqua/60 italic leading-snug mt-0.5">
                      {m.title}
                    </div>
                  </div>
                </div>

                {/* Specific strength — valeur a la taille/police du nom, dans la
                    couleur signature du membre (la couleur vive de son degrade,
                    celle visible sous la photo). */}
                <div className="mb-4 flex items-baseline gap-2 flex-wrap">
                  <span className="font-monodisp text-[9px] tracking-[0.22em] uppercase text-aqua/45">Specific strength :</span>
                  <span
                    className="font-display text-xl font-medium tracking-tight leading-tight"
                    style={{ color: m.grad.match(/#[0-9a-fA-F]{6}/g)?.[1] ?? '#5AD4B6' }}
                  >
                    {m.strength}
                  </span>
                </div>

                <p className="text-sm text-aqua/75 font-light leading-relaxed mb-5 flex-1 whitespace-pre-line">
                  {m.desc}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {m.skills.map((s) => (
                    <span
                      key={s}
                      className="font-monodisp text-[9px] uppercase tracking-wider px-2 py-1 border border-accent/25 text-aqua/75"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Meta : SASU / website / etc */}
                {m.sasu && (
                  <div className="font-monodisp text-[9px] uppercase tracking-[0.2em] text-accent/70 mb-3 pb-3 border-b border-accent/15">
                    → {m.sasu}
                  </div>
                )}
                {m.website && (
                  <a
                    href={m.website}
                    target="_blank"
                    rel="noopener"
                    className="font-monodisp text-[9px] uppercase tracking-[0.2em] text-accent hover:text-aqua mb-3 pb-3 border-b border-accent/15 transition-colors block"
                  >
                    → {m.website.replace('https://', '')}
                  </a>
                )}
                {m.links && m.links.length > 0 && (
                  <div className="mb-3 pb-3 border-b border-accent/15 space-y-1.5">
                    {m.links.map((lnk) => (
                      <a
                        key={lnk.url}
                        href={lnk.url}
                        target="_blank"
                        rel="noopener"
                        className="font-monodisp text-[9px] uppercase tracking-[0.2em] text-accent hover:text-aqua transition-colors block"
                      >
                        → {lnk.label}
                      </a>
                    ))}
                  </div>
                )}
                {m.githubs && m.githubs.length > 0 && (
                  <div className="mb-3 pb-3 border-b border-accent/15 space-y-1">
                    {m.githubs.map((g) => (
                      <a
                        key={g}
                        href={`https://${g}`}
                        target="_blank"
                        rel="noopener"
                        className="font-monodisp text-[9px] uppercase tracking-[0.2em] text-accent hover:text-aqua transition-colors block"
                      >
                        → {g}
                      </a>
                    ))}
                  </div>
                )}
                {m.manifest && (
                  <a
                    href={m.manifest}
                    download
                    className="block text-center font-monodisp text-[10px] uppercase tracking-[0.2em] py-2.5 mb-3 border border-accent/40 text-aqua hover:bg-accent hover:text-obsidian transition-colors clip-civ-sm"
                  >
                    ↓ MANIFEST
                  </a>
                )}
                {m.site && m.site !== '#' && (
                  <a
                    href={m.site}
                    target="_blank"
                    rel="noopener"
                    className="block text-center font-monodisp text-[10px] uppercase tracking-[0.2em] py-2.5 mb-3 border border-accent/40 text-aqua hover:bg-accent hover:text-obsidian transition-colors clip-civ-sm"
                  >
                    ↗ SITE
                  </a>
                )}

                {m.name === 'Naïm' ? (
                  <div className="border-t border-accent/15 pt-3">
                    <button
                      type="button"
                      onClick={toggleCv}
                      aria-expanded={cvOpen}
                      aria-controls="cv-Naïm"
                      data-sfx="none"
                      className="w-full flex items-center justify-between font-monodisp text-[10px] uppercase tracking-[0.2em] text-accent hover:text-aqua transition-colors"
                    >
                      <span>{cvOpen ? 'CV complet · replier' : 'CV complet · derouler'}</span>
                      <span aria-hidden className="transition-transform duration-300" style={{ transform: cvOpen ? 'rotate(90deg)' : 'none' }}>
                        →
                      </span>
                    </button>
                  </div>
                ) : (
                  m.cv && <CvDropdown cvUrl={m.cv} summary={m.skills} />
                )}
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* CV detaille de Naïm— accordeon pleine largeur, ferme par defaut,
          ouvert depuis le bouton de sa card (12/09 : "card declinable avec
          accordeon tres fourni"). Meme technique grid-rows que CvDropdown.
          Les sections Identite -> Langues ci-dessous sont inchangees, juste
          enveloppees ; le CTA final reste hors accordeon, toujours visible. */}
      <div
        id="cv-Naïm"
        className="scroll-mt-24"
        style={{ display: 'grid', gridTemplateRows: cvOpen ? '1fr' : '0fr', transition: 'grid-template-rows 0.7s cubic-bezier(0.16,1,0.3,1)' }}
        onTransitionEnd={(e) => { if (e.target === e.currentTarget && cvOpen) setCvSettled(true); }}
      >
        <div className="min-h-0" style={{ overflow: cvOpen && cvSettled ? 'visible' : 'hidden' }}>
          <div className="max-w-[1400px] mx-auto px-8 pt-16 border-t-2 border-dashed border-accent/30 text-center">
            <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent/60 mb-4">
              Naïm · CV complet
            </div>
            <h3 className="display-sov-h2 text-aqua">
              CV détaillé · <span className="grad-fusion">Naïm v3.4.3</span>
            </h3>
            <p className="text-base text-aqua/60 mt-4 max-w-2xl mx-auto font-light">
              Intervenant principal — parcours complet, stack, expériences, réalisations.
            </p>
          </div>

      {/* IDENTITE / PROFIL */}
      <section className="py-32 bg-obsidian border-t border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 reveal">
            <div className="col-span-12 lg:col-span-3">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                02 / Identite
              </div>
            </div>
            <div className="col-span-12 lg:col-span-9">
              <p className="display-sov-h2 text-aqua/85 leading-tight">
                <span className="text-aqua">Consultant IA indépendant.</span> Spécialiste de l'intégration agentique pour <span className="text-accent">structures non-techniques</span>.
                Capacité rare à traduire un besoin métier en automatisation IA livrable clé en main.
              </p>
            </div>
          </div>

          <div className="mt-24 reveal-stagger">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-6 lg:col-span-4 border-t border-accent/20 pt-4">
                <div className="font-monodisp text-[10px] tracking-[0.25em] uppercase text-aqua/40 mb-1">Mobilité</div>
                <div className="text-aqua font-light text-base lg:text-lg">Île-de-France + remote France</div>
              </div>
              <div className="col-span-6 lg:col-span-4 border-t border-accent/20 pt-4">
                <div className="font-monodisp text-[10px] tracking-[0.25em] uppercase text-aqua/40 mb-1">Réponse</div>
                <div className="text-aqua font-light text-base lg:text-lg">Devis ferme sous 48 h</div>
              </div>
              <div className="col-span-12 lg:col-span-4 border-t border-accent/20 pt-4">
                <div className="font-monodisp text-[10px] tracking-[0.25em] uppercase text-aqua/40 mb-1">GitHub</div>
                <a href="https://github.com/XITO2020" target="_blank" rel="noopener" className="text-aqua font-light text-base lg:text-lg hover:text-accent transition-colors">XITO2020 · qishim-cortex</a>
              </div>
            </div>
            <div className="mt-12 flex flex-wrap gap-3">
              <a
                href="mailto:tabascocity@proton.me?subject=demande%20tv1e"
                className="inline-flex items-center gap-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-medium px-6 py-4 hover:bg-aqua transition-colors clip-civ-sm"
              >
                Nous contacter <span aria-hidden>→</span>
              </a>
              <a
                href="mailto:tabascocity@proton.me?subject=demande%20tv1e%20-%20devis"
                className="inline-flex items-center gap-3 border border-accent/30 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-6 py-4 hover:border-accent hover:text-accent transition-colors clip-civ-sm"
              >
                Demander un devis <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STACK */}
      <section className="py-32 bg-obsidian border-t border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-20 reveal">
            <div className="col-span-12 lg:col-span-3">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                02 / Stack
              </div>
            </div>
            <div className="col-span-12 lg:col-span-9">
              <h2 className="display-sov-h2 text-aqua">
                Outils <span className="grad-mint">maitrises</span>.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-12 reveal-stagger">
            {Object.entries(stack).map(([key, items]) => (
              <div key={key} className="col-span-12 lg:col-span-6">
                <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-6">
                  {key === 'ia' ? 'IA / Agents / LLM' : key === 'frontend' ? 'Frontend / Full-stack' : key === 'backend' ? 'Backend / Infra' : 'Direction Artistique'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="font-monodisp text-[11px] uppercase tracking-wide px-3 py-2 border border-accent/25 text-aqua/85 hover:border-accent hover:text-accent transition-colors clip-civ-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="py-32 bg-obsidian border-t border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-20 reveal">
            <div className="col-span-12 lg:col-span-3">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                03 / Experiences
              </div>
            </div>
            <div className="col-span-12 lg:col-span-9">
              <h2 className="display-sov-h2 text-aqua">
                Trajectoire <span className="grad-fusion">non-lineaire</span>.<br />
                Polyvalence assumee.
              </h2>
            </div>
          </div>

          <div className="space-y-32">
            {experiences.map((exp, i) => (
              <article key={i} className="grid grid-cols-12 gap-8 reveal">
                <div className="col-span-12 lg:col-span-3">
                  <div className="font-monodisp text-xs text-accent tracking-widest sticky top-32">
                    {exp.period}
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-9">
                  <h3 className="display-sov-h2 text-aqua mb-2" style={{ fontSize: 'clamp(22px, 3vw, 40px)' }}>
                    {exp.title}
                  </h3>
                  <div className="font-light text-aqua/55 mb-2">{exp.org}</div>
                  {exp.meta && (
                    <div className="font-monodisp text-xs text-accent tracking-wide mb-10 uppercase">{exp.meta}</div>
                  )}

                  <div className="space-y-12 mt-12">
                    {exp.sections.map((sec) => (
                      <div key={sec.label}>
                        <div className="font-monodisp text-[10px] uppercase tracking-[0.25em] text-accent mb-4 pb-2 border-b border-accent/20">
                          {sec.label}
                        </div>
                        <ul className="space-y-2">
                          {sec.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-4 py-2 text-aqua/80">
                              <span className="font-monodisp text-[10px] text-aqua/40 mt-1.5 w-5 shrink-0">
                                0{idx + 1}
                              </span>
                              <span className="text-base font-light leading-relaxed flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* REALISATIONS */}
      <section className="py-32 bg-obsidian border-t border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-20 reveal">
            <div className="col-span-12 lg:col-span-3">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                04 / Realisations
              </div>
            </div>
            <div className="col-span-12 lg:col-span-9">
              <h2 className="display-sov-h2 text-aqua">
                Preuves <span className="grad-mint">concretes</span>.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-px bg-accent/15 reveal-stagger">
            {realisations.map((r, i) => (
              <div
                key={i}
                className="col-span-12 md:col-span-6 lg:col-span-4 bg-obsidian p-8 hover:bg-carbon transition-colors"
              >
                <div className="font-monodisp text-[10px] uppercase tracking-[0.25em] text-accent mb-6">
                  {r.tag}
                </div>
                <h3 className="text-aqua text-xl font-light mb-3 leading-tight">{r.t}</h3>
                <p className="text-aqua/55 text-sm font-light leading-relaxed">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDUCATION + LANGUES */}
      <section className="py-32 bg-obsidian border-t border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-6 reveal">
            <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-8">
              05 / Education
            </div>
            <div className="space-y-12">
              <div className="border-t border-accent/20 pt-6">
                <div className="font-monodisp text-xs text-accent mb-1">2006 — 2007</div>
                <div className="text-xl text-aqua font-light mb-1">CSS (Secours Aerien) DGAC</div>
                <div className="text-aqua/55 font-light">Europe Air / Air France · Paris</div>
              </div>
              <div className="border-t border-accent/20 pt-6">
                <div className="font-monodisp text-xs text-accent mb-1">2003 — 2005</div>
                <div className="text-xl text-aqua font-light mb-1">Cursus universitaire LEA</div>
                <div className="text-aqua/55 font-light">FR / ES / EN / JP — Universitat Pompeu Fabra · Barcelone</div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 reveal">
            <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-8">
              06 / Langues
            </div>
            <div className="space-y-4">
              {[
                { l: 'Francais', s: '9/10', n: 'Natif' },
                { l: 'English', s: '7/10', n: 'Professionnel' },
                { l: 'Español', s: '7/10', n: 'Professionnel — 5 ans Barcelone' },
                { l: 'Notions', s: '·', n: 'русский · 日本語 · العربية' },
              ].map((l) => (
                <div key={l.l} className="grid grid-cols-12 gap-4 py-4 border-t border-accent/20 items-baseline">
                  <div className="col-span-4 text-aqua font-light text-lg">{l.l}</div>
                  <div className="col-span-2 font-monodisp text-accent">{l.s}</div>
                  <div className="col-span-6 text-aqua/55 text-sm font-light text-right">{l.n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

          <div className="max-w-[1400px] mx-auto px-8 pb-24 text-center">
            <button
              type="button"
              onClick={toggleCv}
              data-sfx="none"
              className="inline-flex items-center gap-3 border border-accent/30 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-8 py-4 hover:border-accent hover:text-accent transition-colors clip-civ-sm"
            >
              ↑ Replier le CV
            </button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="py-32 bg-obsidian border-t border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8 text-center">
          <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-10">
            Disponible · Depuis Octobre 2026
          </div>
          <h2 className="display-sov-h1 mb-12">
            <span className="text-aqua">Une mission </span>
            <span className="accent grad-fusion">en tete</span>
            <span className="text-aqua"> ?</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:tabascocity@proton.me?subject=Mission%20IA"
              className="inline-flex items-center gap-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-medium px-10 py-5 hover:bg-aqua transition-colors clip-civ-sm"
            >
              Ecrire un message
              <span>→</span>
            </a>
            <a
              href="/tarifs"
              className="inline-flex items-center gap-3 border border-accent/30 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-10 py-5 hover:border-accent hover:text-accent transition-colors clip-civ-sm"
            >
              Voir les tarifs
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
