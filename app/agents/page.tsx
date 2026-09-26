import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Agents IA prêts à l'emploi",
  description:
    "Le catalogue d'agents IA métier de tuveuxun.expert : automatisation mails, documents, rapports, chatbots bornés.",
};

import Link from 'next/link';


const AGENTS = [
  // Tintenfisch en tete : le catalogue s'ouvre sur la pieuvre, image en grand.
  // Fiches ajoutees le 11/09/2026 depuis les README de chaque outil — rien d'invente.
  {
    slug: 'tintenfisch',
    name: 'Tintenfisch',
    tag: 'SaaS · Prospection',
    date: '08 / 2026',
    img: '/carousel/tintenfisch.webp',
    pitch: "Le monstre magnifique : une pieuvre de prospection pour tout projet ou événement dont chaque tentacule alimente sa propre base de prospects chauds.",
    description: [
      "Tintenfisch écume les sources publiques, enrichit chaque prospect, l'affine par LLM puis le score. Chaque tentacule alimente une base dédiée à une cible : cabinets, startups, business angels, utilisateurs, citoyens, membres de CE ou d'asso, fournisseurs ou commerçants pour événements.",
      "La boucle est complète : le mailer envoie un premier email de toute nature possible, les réponses sont classées par sentiment, un second mail est préparé — toujours en brouillon, toujours validé par un humain.",
      "Chaque prospect porte une couleur composee de son score et de ses signaux : quand l'agent re-score, la couleur bouge, et vous voyez la base glisser. Chaque mail renferme ce que vous souhaitez de non hackable: images, videos, mp3",
    ],
    features: [
      "Ecumage seed → enrichissement → affinage LLM → score, export CSV",
      "Une base par cible pour n'importe quel projet, avec sa palette de couleurs signature",
      "Second mail toujours en brouillon + validation humaine",
      "Verrou opt-out : un prospect desinscrit n'est plus jamais exporte ni contacte",
      "Feedback des réponses → poids re-calibrés",
    ],
    stack: ['Python', 'LLM local ou Claude', 'Bases par tentacule', 'Mailer'],
    price: 'Sur devis',
    cta: 'Demander un devis',
  },
  {
    slug: 'findor',
    name: 'Findor',
    tag: 'Agent · Prospection',
    date: '02 / 04 / 2026',
    img: '/carousel/findor.webp',
    pitch: 'Agent de prospection client déployé sur votre serveur.',
    description: [
      "Findor scrute en continu les sources publiques (LinkedIn, sites pro, registres, presse locale) pour identifier les prospects qui matchent votre profil ideal.",
      "Genere des fiches enrichies (nom, contact, contexte, accroche personnalisee) pretes a etre envoyees par votre commercial.",
      "Tourne en cron sur votre serveur — vous recevez les leads chaque matin dans votre boite mail ou CRM.",
    ],
    features: [
      'Scrape continu sources publiques (LinkedIn-friendly, registres pros, presse)',
      'Filtres métier personnalisables (secteur, taille, localisation, signal d\'achat)',
      'Fiche prospect enrichie avec accroche personnalisee generee',
      'Export CSV / push CRM (HubSpot, Pipedrive, Brevo)',
      'Déploiement on-premise ou VPS dédié',
    ],
    stack: ['Python', 'Claude API ou Qwen local', 'Cron', 'Postgres'],
    price: 'A partir de 1 900 € · setup + 30j support',
    cta: 'Demander un devis',
  },
  {
    slug: 'scrappowin',
    name: 'Scrappowin',
    tag: 'Tool · Scrapping',
    date: '25 / 04 / 2026',
    img: '/carousel/scrappowin.webp',
    pitch: 'Votre scrappeur d\'images intelligent.',
    description: [
      "Scrappowin parcourt les sources que vous lui designez (sites, banques d'images libres, archives) et collecte les visuels qui correspondent a votre brief.",
      "Tri automatique : qualite, format, droits d'usage, redondances. Sortie classee par theme dans un dossier propre.",
      "Ideal pour constituer rapidement des banques d'images pour communication, comm interne, archives patrimoine.",
    ],
    features: [
      'Scrape multi-sources avec respect robots.txt',
      'Filtre qualite (resolution, nettete, droits)',
      'Deduplication par hash perceptuel',
      'Classification automatique par theme/sujet',
      'Export structure (dossiers + manifest CSV)',
    ],
    stack: ['Python', 'Playwright', 'CLIP embeddings', 'Local storage'],
    price: 'A partir de 2 700 € · forfait outil + formation 2h',
    cta: 'Voir une demo',
  },
  {
    slug: 'studio-antiguo',
    name: 'Studio-antiguo',
    tag: 'Studio · Generation media',
    date: '03 / 2026',
    img: '/carousel/studio-antiguo.webp',
    pitch: 'Tout-en-un génération image et vidéo gratuite, 100% local.',
    description: [
      "Stack complète pour générer images et vidéos en local : ComfyUI + LTX Video + Wan 2.2 + nano-banana orchestrés dans une UI unifiée.",
      "Aucune API payante : tout tourne sur votre machine ou un VPS GPU. Confidentialite garantie.",
      "Conçu pour créer rapidement du contenu commercial : visuels réseaux sociaux, courts métrages produit, slideshows.",
      "Preuve concrete : a genere les 12 visuels pixel art annees 90 du carousel de ce site en moins de 5 minutes — chacun decline avec un brief specifique pour son agent (Findor, Scrappowin, MairieBot, etc.).",
    ],
    features: [
      'Generation txt2img · img2img · img2video',
      'Templates pre-configures : portrait, paysage, animation produit',
      'Wan 2.2 + LTX Video pour I2V cinematique',
      'Bibliothèque de prompts métier (resto, immo, asso, mairie)',
      'Export MP4 / GIF / PNG haute qualite',
      'Demo live : 12 images pixel art 90s generees en 5 min pour ce site',
    ],
    stack: ['ComfyUI', 'LTX Video', 'Wan 2.2', 'Python', 'Next.js'],
    price: 'Outil interne — accessible aux clients sous mission',
    cta: 'Demander acces beta',
  },
  {
    slug: 'openclaw',
    name: 'Agent souverain sur mesure',
    tag: 'Agent · souverain · auto-hébergé',
    date: '09 / 2026',
    img: '/carousel/openclaw.webp',
    pitch: "L'agent qui apprend chez vous, sans abonnement.",
    description: [
      "On choisit ensemble la voie souveraine adaptee a votre machine, votre budget et votre niveau d'implication : OpenClaw (plateforme d'agents accessible), Hermes (runtime auto-evolutif open source, MIT), ou un LLM local pur (Ollama + modele ouvert).",
      "Quelle que soit la voie, l'agent tourne sur VOTRE infrastructure : il garde sa memoire sur votre serveur, tourne en cron et repond par mail, Teams, WhatsApp ou SMS. Aucune donnee ne part dans le cloud.",
      "Livré avec deux skill packs métier déjà éprouvés. Cible : structures qui ne peuvent ou ne veulent pas envoyer leurs données dans le cloud (mairies, cabinets juridiques, santé, défense).",
    ],
    features: [
      'La voie souveraine adaptee : OpenClaw, Hermes ou Ollama local, selon votre machine',
      'Ollama + modele ouvert (Qwen3, Mistral) installe sur votre serveur',
      '2 skill packs métier + skills auto-créés à l\'usage',
      'Memoire locale inter-sessions, jamais cloud',
      'Cron intégré + gateway mail / Teams / WhatsApp / SMS / Signal',
      'Mise a jour signee proposee tous les 4 mois a 120 € · refuser ne degrade rien',
    ],
    stack: ['OpenClaw', 'Hermes', 'Ollama', 'Qwen3', 'MCP'],
    price: 'Agent souverain sur mesure : 2 700 € · 5 jours · 60j support',
    cta: 'Decouvrir le forfait souverain',
  },
  {
    slug: 'agentcron',
    name: 'AgentCron',
    tag: 'Agent · Orchestration',
    date: '02 / 2026',
    img: '/carousel/agentcron.webp',
    pitch: "Orchestrateur d'agents Claude en cron.",
    description: [
      "AgentCron lance vos agents Claude (ou Qwen local) à intervalles réguliers : tous les matins, toutes les heures, ou sur événement.",
      "Gere l'etat entre executions, retry automatique en cas d'echec, monitoring centralise.",
      "Idéal pour : veille, génération rapport hebdo, suivi prospects, modère des réseaux sociaux, traitement batch.",
    ],
    features: [
      'Scheduler cron avec retry exponentiel',
      'Memoire persistante entre executions (SQLite ou Postgres)',
      'Hooks : webhook, mail, Slack, Telegram',
      'Dashboard de suivi : runs, erreurs, durees',
      'Multi-agents en parallele',
    ],
    stack: ['Python', 'Claude API ou Qwen local', 'APScheduler', 'SQLite'],
    price: 'A partir de 1 900 € · setup pour 1 a 3 agents',
    cta: 'Configurer un agent',
  },
  {
    slug: 'mairiebot',
    name: 'MairieBot',
    tag: 'Bot · Citoyen',
    date: '03 / 2026',
    img: '/carousel/mairiebot.webp',
    pitch: 'Chatbot citoyen RGPD souverain pour mairies et collectivites.',
    description: [
      "MairieBot repond aux questions des citoyens 24/7 : horaires, demarches administratives, evenements, infos pratiques.",
      "Branche sur la base documentaire de votre mairie. Aucune donnee citoyen ne quitte votre serveur.",
      "Forme sur les processus administratifs francais : etat civil, urbanisme, scolaire, social.",
    ],
    features: [
      'LLM local Qwen sur votre serveur (RGPD blinde)',
      'RAG sur vos arretes, deliberations, FAQ',
      'Multilingue FR + EN + ES + AR',
      'Widget integrable au site mairie existant',
      'Stats anonymes : sujets demandes, satisfaction',
    ],
    stack: ['Qwen 2.5 local', 'FastAPI', 'FAISS', 'React widget'],
    price: 'Forfait dédié mairie : 2 700 € + setup serveur',
    cta: 'Demander une demo mairie',
  },
  {
    slug: 'reportium',
    name: 'Reportium',
    tag: 'Agent · Reporting',
    date: '04 / 2026',
    img: '/carousel/reportium.webp',
    pitch: 'Génération automatique de rapports métier.',
    description: [
      "Reportium ingère vos données (Excel, base de données, API), les analyse et génère un rapport propre PDF/Word/HTML chaque période.",
      "Templates personnalisables : rapport mensuel ventes, bilan annuel asso, suivi projet, KPI dashboards narratifs.",
      "Vous decrivez ce que vous voulez voir, Reportium le fabrique en repetant la recette chaque mois.",
    ],
    features: [
      'Connecteurs : Excel, CSV, Google Sheets, SQL, API REST',
      'Generation PDF / Word / HTML / email',
      'Graphes intégrés (matplotlib, plotly)',
      'Narration generee par LLM (commentaire, alertes)',
      'Schedule mensuel/hebdo/quotidien',
    ],
    stack: ['Python', 'Pandas', 'WeasyPrint', 'Claude API'],
    price: 'A partir de 1 900 € · setup + 1 template',
    cta: 'Voir un exemple de rapport',
  },
  {
    slug: 'docusweep',
    name: 'DocuSweep',
    tag: 'Tool · Classification docs',
    date: '03 / 2026',
    img: '/carousel/docusweep.webp',
    pitch: 'Traitement et classification de documents.',
    description: [
      "DocuSweep ingere des centaines/milliers de documents (PDF, Word, scans) et les classe automatiquement selon vos categories.",
      "Extrait les infos cles (dates, montants, parties contractantes), tag chaque document, range dans la bonne arborescence.",
      "Idéal pour digitaliser une archive : cabinets, études notariales, services administratifs.",
    ],
    features: [
      'OCR (Tesseract + correction LLM) sur scans',
      'Classification multi-niveaux selon vos taxonomies',
      'Extraction structuree (montants, dates, entites)',
      'Renommage / rangement automatique des fichiers',
      'Audit trail : journal de tout ce qui a ete classe',
    ],
    stack: ['Python', 'Tesseract', 'Claude API ou Qwen', 'Pandas'],
    price: 'A partir de 1 900 € + tarif degressif au volume',
    cta: 'Devis sur volume',
  },
  {
    slug: 'cortexlab',
    name: 'CortexLab',
    tag: 'Stack · Multi-agents',
    date: '12 / 2025',
    img: '/carousel/cortexlab.webp',
    pitch: 'Système multi-agents : 12 cortex spécialisés, 60 agents.',
    description: [
      "CortexLab est l'architecture R&D maison (alias QISHIM-CORTEX) : 12 cortex spécialisés (commercial, juridique, technique, rédactionnel, analytique...) avec 60 agents élaborés.",
      "Conçu avant Ruflo (nov 2024), sert de laboratoire pour eprouver les patterns d'orchestration d'agents.",
      "Les patterns validés ici sont bien sûr mis à jour et ensuite répliqués chez les clients sous forme d'agents simplifiés adaptés à leur métier.",
    ],
    features: [
      '12 cortex (Q.I.S.H.I.M. = Quantic Intelligence Structure Hypervisor Intuition Modelisation)',
      '60 agents spécialisés avec rôles définis',
      'MCP (Model Context Protocol) intégré',
      'Memoire SQLite + vector store partage',
      'Council pattern Karpathy (5 advisors)',
    ],
    stack: ['Claude API + MCP', 'Python', 'SQLite', 'Yaml configs'],
    price: 'Architecture privee — adaptations clients sur devis',
    cta: 'Voir une adaptation client',
  },
  {
    slug: 'hyperframes-studio',
    name: 'HyperFrames Studio',
    tag: 'Studio · Video',
    date: '04 / 2026',
    img: '/carousel/hyperframes-studio.webp',
    pitch: 'Post-production video HTML + GSAP rapide.',
    description: [
      "HyperFrames Studio compose des videos en pure HTML/CSS/GSAP — pas besoin d'After Effects ni Premiere.",
      "Templates pour : promo restaurant, lower-third TikTok, motion identity, slideshow produit, intro youtube.",
      "Rendu serveur en MP4 haute qualite. Ideal pour PME/asso qui veulent du contenu video rapide sans equipe motion.",
    ],
    features: [
      'Compositions HTML + GSAP + ScrollTrigger',
      'Templates pretes a l\'emploi (resto, mode, immo, asso)',
      'Audio reactive (beat detection, glow, pulse)',
      'Captions auto via Whisper',
      'Render serveur Puppeteer + ffmpeg',
    ],
    stack: ['HTML / CSS / GSAP', 'Puppeteer', 'ffmpeg', 'Node'],
    price: 'TJM 900 € · ou template + formation 2 500 €',
    cta: 'Voir des exemples',
  },
  {
    slug: 'tabasco-city',
    name: 'TabascoCity',
    tag: 'Site · Marketplace NFT',
    date: '05 / 2026',
    img: '/carousel/tabasco-city.webp',
    pitch: 'Marketplace NFT artistique — projet vitrine.',
    description: [
      "TabascoCity est notre marketplace NFT artistique vitrine. Curation d'œuvres digitales, drops manuels, communauté d'artistes.",
      "Stack : Next.js + Solana + Ethereum dual-chain, IPFS pour stockage, smart contracts ERC-721/SPL.",
      "Sert aussi de portfolio technique : ce que tuveuxun.expert peut fabriquer pour des marques qui veulent leur propre marketplace.",
    ],
    features: [
      'Marketplace dual-chain Solana + Ethereum',
      'Smart contracts custom (ERC-721, SPL)',
      'Stockage IPFS + Pinata',
      'Auth wallet Phantom + MetaMask',
      'Royalties auteurs configurees',
    ],
    stack: ['Next.js 14', 'Solana web3.js', 'ethers.js', 'IPFS'],
    price: 'Vitrine — clone marketplace sur devis (80 000 € starter)',
    cta: 'Lancer votre marketplace',
  },
  {
    slug: 'memorial',
    name: 'Memorial',
    tag: 'Stack · BDD patrimoine',
    date: '01 / 2026',
    img: '/carousel/memorial.webp',
    pitch: 'BDD locale de patrimoine documentaire.',
    description: [
      "Memorial est une base de données structurée pour archiver, indexer et rechercher dans un fonds documentaire (asso patrimoniale, archives familiales, fonds artistique).",
      "Inclut UI de consultation, recherche full-text + semantique, gestion droits acces, export.",
      "Souverain : tout reste sur votre serveur. Aucune dependance cloud.",
    ],
    features: [
      'Indexation full-text PostgreSQL',
      'Recherche semantique embeddings locaux',
      'OCR documents scannes',
      'UI de consultation publique ou restreinte',
      'Export catalogue PDF / CSV',
    ],
    stack: ['Postgres', 'pgvector', 'Next.js', 'Tesseract'],
    price: 'A partir de 1 900 € selon volume',
    cta: 'Devis pour votre fonds',
  },
  {
    slug: 'cortex-moderation',
    name: 'Cortex Moderation',
    tag: 'Service · Vision IA',
    date: '2026',
    img: '/carousel/cortex-moderation.webp',
    pitch: "L'oeil de moderation partage : une image entre, un verdict sort, rien ne quitte votre machine.",
    description: [
      "Un service unique de moderation par vision IA, partage entre plusieurs plateformes. Il recoit une image, l'analyse avec Qwen2.5-VL via Ollama, en local, et rend un verdict.",
      "Il bloque le gore, le sexuel, l'horreur et toute representation de mineur. Il distingue le fait-main de l'IA sans punir un vrai artiste dont le style ressemble a de l'IA.",
      "La politique — seuils et regle fait-main / IA — vit dans le code, pas dans le modele : auditable et ajustable. L'utilisateur classe IA peut contester.",
    ],
    features: [
      "Verdicts : bloque / fait-main / IA, avec les raisons",
      "Regle editoriale auditable dans la configuration, pas dans le modele",
      "Recours utilisateur quand l'image est classee IA",
      "Service a la demande sur votre machine, pas 24/7",
      "API : POST /moderate, /health",
    ],
    stack: ['Python', 'Ollama', 'Qwen2.5-VL 7B', 'start.bat'],
    price: 'Sur devis',
    cta: 'Demander un devis',
  },
  {
    slug: 'sound-cortex',
    name: 'Sound-Cortex',
    tag: 'Studio · Audio IA',
    date: '05 / 2026',
    img: '/carousel/sound-cortex.webp',
    pitch: "Studio d'ingenierie son IA : musique, doublage, audiobook, effets — pret pour le SaaS.",
    description: [
      "Sound-Cortex orchestre plusieurs moteurs audio pour produire de la musique, du doublage multi-personnages, de la narration longue et des effets sonores.",
      "Concu dual-mode : usage interne d'abord, puis SaaS public en apportant vos propres cles. Le code est multi-tenant des le premier jour.",
      "Moteur audio dans le navigateur, sidecar Python pour la synthese vocale locale.",
    ],
    features: [
      "Musique, doublage, audiobook, effets sonores",
      "Synthese vocale locale (XTTS-v2) en complement des API",
      "Multi-tenant, cles apportees par le client",
      "Editeur audio dans le navigateur",
    ],
    stack: ['Next.js 14', 'Tone.js · Wavesurfer', 'FastAPI', 'Prisma', 'XTTS-v2 local'],
    price: 'Sur devis',
    cta: 'Demander un devis',
  },
  {
    slug: 'voicebox',
    name: 'VoiceBox',
    tag: 'Tool · Voix',
    date: '08 / 2026',
    img: '/carousel/voicebox.webp',
    pitch: "Synthese vocale et clonage zero-shot, sept moteurs sous licence MIT, en local.",
    description: [
      "VoiceBox reunit sept moteurs de synthese et de clonage vocal sous licence MIT derriere une seule interface, installee sur votre machine.",
      "Aucune voix ne sort de chez vous : le clonage zero-shot se fait en local, sans compte ni cloud.",
    ],
    features: [
      "Sept moteurs TTS et clonage, licence MIT",
      "Clonage zero-shot a partir d'un court echantillon",
      "100 % local, aucune donnee envoyee",
      "Installation par double-clic",
    ],
    stack: ['Python', 'Moteurs MIT', 'Interface locale'],
    price: 'Sur devis',
    cta: 'Demander un devis',
  },
  {
    slug: 'hub-pilotage',
    name: 'Hub Pilotage IA',
    tag: 'Tool · Interface',
    date: '2026',
    img: '/carousel/hub-pilotage.webp',
    pitch: "Une interface unique qui pilote plusieurs IA depuis un seul endroit — locales et distantes.",
    description: [
      "Un menu deroulant en haut de chaque conversation : vous choisissez l'IA adaptee a la tache — economique, rapide, privee, cerveau lourd, code, vision.",
      "Modeles locaux via Ollama, sans internet ; modeles distants via un routeur unique (Claude, Mistral, DeepSeek…).",
      "Livrable installable chez vous : le kit Pilote IA, demarre en dix secondes par double-clic.",
    ],
    features: [
      "Un seul endroit pour toutes vos IA",
      "Modeles locaux Ollama, hors ligne",
      "Modèles distants par une seule clé",
      "start.bat / stop.bat, Ollama reste actif",
    ],
    stack: ['Open WebUI', 'Ollama', 'OpenRouter', 'Python'],
    price: 'Sur devis',
    cta: 'Demander un devis',
  },
  {
    slug: 'scraper-galerie',
    name: 'Scraper Galerie',
    tag: 'Tool · Collecte',
    date: '2026',
    img: '/carousel/scraper-galerie.webp',
    pitch: "Collecte d'images a grande echelle : une URL, un mode, et ca clique tout seul jusqu'a la fin.",
    description: [
      "Outil local avec interface graphique : vous collez une URL, choisissez un mode, et le navigateur pilote parcourt la galerie jusqu'a son terme.",
      "Trois modes : image principale, video principale, ou article entier (titre, prix, description, image). Un fichier de metadonnees s'ecrit au fil de l'eau.",
      "Rien dans le cloud : Python et un navigateur pilote sur votre poste.",
    ],
    features: [
      "Modes image / video / article entier",
      "Arret automatique en fin de galerie",
      "metadata.csv ecrit au fil de l'eau",
      "Installation par double-clic, Windows / macOS / Linux",
    ],
    stack: ['Python', 'Playwright', 'tkinter', 'yt-dlp'],
    price: 'Sur devis',
    cta: 'Demander un devis',
  },
  {
    slug: 'istqb-trainer',
    name: 'ISTQB Trainer',
    tag: 'App · Formation',
    date: '2026',
    img: '/carousel/istqb-trainer.webp',
    pitch: "Entrainement aux tests psychotechniques d'admission : series, logique, correction expliquee.",
    description: [
      "Une page locale, sans serveur ni installation, pour preparer les tests d'admission des ecoles de qualite logicielle : suites, analogies, deduction, intrus, problemes logico-numeriques.",
      "Test blanc de trente questions avec chrono par question et correction en fin d'epreuve, ou entrainement filtre par categorie et difficulte.",
      "Un second module couvre les connaissances ISTQB CTFL v4.0 : quatre cents questions, examens blancs, sprint chrono.",
    ],
    features: [
      "180 questions psychotechniques originales, six categories",
      "Test blanc chronometre, revision complete des erreurs",
      "Module ISTQB CTFL : 400 questions, dix jeux fixes",
      "Zero dependance : HTML, CSS, JS",
    ],
    stack: ['HTML', 'CSS', 'JavaScript'],
    price: 'Sur devis',
    cta: 'Demander un devis',
  },
  {
    slug: 'serie-forge',
    name: 'Serie-Forge Converter',
    tag: 'Pipeline · Video',
    date: '2026',
    img: '/carousel/serie-forge.webp',
    pitch: "Un scenario lisible par un humain devient un scenario machine valide, pret a produire.",
    description: [
      "Vous ecrivez vos scenes dans un format naturel — titre, duree, voix, prompt, dialogue. Le convertisseur produit le scenario machine attendu par le studio, sans jamais toucher le YAML a la main.",
      "Chaque scene est associee a son image de reference ; en cas d'ambiguite, il ne devine pas, il signale.",
      "Le resultat est valide par le vrai analyseur du studio : si c'est invalide, ca echoue bruyamment, avant la production.",
    ],
    features: [
      "Scenario lisible → scenario machine valide",
      "Association scenes ↔ images de reference",
      "Validation par le parser du studio",
      "Option : archive audio groupee et copie des images",
    ],
    stack: ['Python', 'pyyaml', 'ffmpeg (optionnel)'],
    price: 'Sur devis',
    cta: 'Demander un devis',
  },
];

export default function AgentsPage() {
  return (
    <main className="bg-obsidian min-h-screen">
      {/* HERO */}
      <section className="relative pt-40 pb-24 border-b border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-accent" />
            46 deployes · 13 a venir en 2027
          </div>
          <h1 className="display-cyber-h1 text-aqua mb-8">
            NOS <span className="grad-volt">AGENTS</span>.<br />
            <span className="grad-volt-mint">DEPLOYES.</span>
          </h1>
          <p className="text-base lg:text-lg text-aqua/70 max-w-2xl font-light leading-relaxed">
            46 outils, agents et plateformes deployes ces 6 derniers mois, et 13 cartes
            d'avant-garde a venir en 2027. Chaque section detaille les capacites, la stack,
            le tarif et comment commander.
          </p>

          {/* Nouveautes du mois : page dediee (edition de cartes, 15/09/2026) */}
          <Link
            href="/monthly-agents"
            className="inline-flex items-center gap-3 mt-10 border border-accent/40 text-accent font-monodisp text-[11px] uppercase tracking-[0.22em] px-6 py-3 hover:bg-accent hover:text-obsidian transition-colors clip-civ-sm"
          >
            Les nouveautes de septembre 2026 : 23 agents
            <span className="font-monodisp">→</span>
          </Link>

          {/* Ancres rapides */}
          <div className="flex flex-wrap gap-2 mt-12">
            {AGENTS.map((a) => (
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

      {/* AGENTS SECTIONS */}
      {AGENTS.map((a, idx) => (
        <section
          key={a.slug}
          id={a.slug}
          className="relative py-24 lg:py-32 border-b border-accent/10 scroll-mt-24"
        >
          <div className="max-w-[1400px] mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              {/* Image left */}
              <div className="md:col-span-5 max-w-[340px] md:max-w-none mx-auto w-full">
                <div className="relative aspect-[2/3] overflow-hidden clip-civ-md border border-accent/20">
                  <img
                    src={a.img}
                    alt={a.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex items-baseline justify-between z-10">
                    <span className="font-monodisp text-[10px] text-accent tracking-[0.25em] uppercase bg-obsidian/60 backdrop-blur px-2 py-1">
                      {String(idx + 1).padStart(2, '0')} / {AGENTS.length}
                    </span>
                    <span className="font-monodisp text-[10px] text-aqua/85 tracking-[0.2em] uppercase bg-obsidian/60 backdrop-blur px-2 py-1 border border-accent/30">
                      {a.tag}
                    </span>
                  </div>
                  <span aria-hidden className="absolute top-2 left-2 w-3 h-3 border-t border-l border-accent z-10" />
                  <span aria-hidden className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-accent z-10" />
                </div>
              </div>

              {/* Content right */}
              <div className="md:col-span-7">
                <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent/60 mb-4">
                  → {a.date}
                </div>
                <h2 className="display-cyber-h2 text-aqua mb-4">{a.name.toUpperCase()}</h2>
                <p className="font-monodisp italic text-lg lg:text-xl text-accent mb-10">
                  {a.pitch}
                </p>

                {/* Description paragraphs */}
                <div className="space-y-4 mb-10">
                  {a.description.map((p, i) => (
                    <p key={i} className="text-base text-aqua/80 font-light leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>

                {/* Features */}
                <div className="mb-10">
                  <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4 pb-2 border-b border-accent/20">
                    Capacites
                  </div>
                  <ul className="space-y-2">
                    {a.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-4 py-1.5 text-aqua/85">
                        <span className="font-monodisp text-[10px] text-accent mt-1.5 w-5 shrink-0">
                          0{i + 1}
                        </span>
                        <span className="text-sm leading-relaxed flex-1 font-light">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stack + Price grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div>
                    <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
                      Stack
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {a.stack.map((s) => (
                        <span
                          key={s}
                          className="font-monodisp text-[10px] uppercase tracking-wider px-2 py-1 border border-accent/25 text-aqua/75"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
                      Tarif
                    </div>
                    <div className="font-monodisp text-sm text-aqua leading-relaxed">
                      {a.price}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`mailto:tabascocity@proton.me?subject=Demande%20${encodeURIComponent(a.name)}`}
                    className="inline-flex items-center gap-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold px-8 py-4 hover:bg-aqua transition-colors clip-civ-sm"
                  >
                    {a.cta}
                    <span className="font-monodisp">→</span>
                  </a>
                  <Link
                    href="/tarifs"
                    className="inline-flex items-center gap-3 border border-accent/30 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-8 py-4 hover:border-accent hover:text-accent transition-colors clip-civ-sm"
                  >
                    Voir tarifs lies
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA final */}
      <section className="py-32 bg-obsidian">
        <div className="max-w-[1400px] mx-auto px-8 text-center">
          <div className="hud-label mb-8 inline-block">end_catalogue / build_yours</div>
          <h2 className="display-cyber-h2 mb-10">
            <span className="text-aqua">UN AGENT </span>
            <span className="grad-volt">SUR MESURE</span>
            <span className="text-aqua"> ?</span>
          </h2>
          <p className="text-base text-aqua/70 mb-10 max-w-xl mx-auto font-light">
            Votre besoin ne rentre dans aucune case ? On en parle, et nous vous proposons une architecture custom sous 48h.
          </p>
          <Link
            href="/tarifs"
            className="inline-flex items-center gap-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold px-10 py-5 hover:bg-aqua transition-colors clip-civ-sm"
          >
            Demander un devis sur mesure
            <span className="font-monodisp">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
