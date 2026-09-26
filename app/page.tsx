import Link from 'next/link';
import dynamic from 'next/dynamic';
import MegaStudioBlock from '@/components/MegaStudioBlock';
import HeroOptionsPanel from '@/components/HeroOptionsPanel';
import PartnersWall from '@/components/PartnersWall';

const CyberTunnel = dynamic(() => import('@/components/CyberTunnel'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-obsidian" />,
});

// Hero 2 — "Le Monde des Agents" : section pinnee, camera 3D pilotee au scroll
// + couche video Blender scrubee (public/video/intro.mp4, optionnelle).
const AgentWorld = dynamic(() => import('@/components/AgentWorld'), {
  ssr: false,
  loading: () => <div className="h-screen bg-obsidian" />,
});

// Compteur anime a l'entree dans le viewport (le 0037 de la section finale).
const Counter = dynamic(() => import('@/components/Counter'), {
  ssr: false,
  loading: () => <span className="tabular-nums">0000</span>,
});

type Product = { slug: string; n: string; name: string; desc: string; date: string; tag: string; img: string; featured?: boolean; href?: string };
// 20 outils reels du depot (images dans public/carousel/). Les huit derniers
// viennent de l'inventaire du 02/09 (README de chaque projet) ; leur date n'est
// pas connue au mois pres, on ecrit l'annee, pas une supposition.
const PRODUCTS: Product[] = [
  { slug: 'tintenfisch', n: '00', name: 'Tintenfisch', desc: "Le monstre magnifique : une pieuvre de prospection dont chaque tentacule alimente sa propre base de prospects chauds, et referme la boucle sur les réponses.", date: '2026', tag: 'SaaS', img: '/carousel/tintenfisch.webp', href: '/marketplace#agents-maison', featured: true },
  { slug: 'findor', n: '01', name: 'Findor', desc: 'Agent de prospection client sur votre serveur', date: '02 / 04 / 2026', tag: 'Agent', img: '/carousel/findor.webp' },
  { slug: 'scrappowin', n: '02', name: 'Scrappowin', desc: "Votre scrappeur d'images intelligent", date: '25 / 04 / 2026', tag: 'Tool', img: '/carousel/scrappowin.webp' },
  { slug: 'studio-antiguo', n: '03', name: 'Studio-antiguo', desc: 'Tout-en-un génération image et vidéo gratuite', date: '03 / 2026', tag: 'Studio', img: '/carousel/studio-antiguo.webp' },
  { slug: 'openclaw', n: '04', name: 'Agent souverain sur mesure', desc: "OpenClaw, Hermes ou LLM local selon votre machine", date: '09 / 2026', tag: 'Agent', img: '/carousel/openclaw.webp' },
  { slug: 'agentcron', n: '05', name: 'AgentCron', desc: "Orchestrateur d'agents Claude en cron", date: '02 / 2026', tag: 'Agent', img: '/carousel/agentcron.webp' },
  { slug: 'mairiebot', n: '06', name: 'MairieBot', desc: 'Chatbot citoyen RGPD souverain', date: '03 / 2026', tag: 'Bot', img: '/carousel/mairiebot.webp' },
  { slug: 'reportium', n: '07', name: 'Reportium', desc: 'Génération automatique de rapports métier', date: '04 / 2026', tag: 'Agent', img: '/carousel/reportium.webp' },
  { slug: 'docusweep', n: '08', name: 'DocuSweep', desc: 'Traitement et classification de documents', date: '03 / 2026', tag: 'Tool', img: '/carousel/docusweep.webp' },
  { slug: 'cortexlab', n: '09', name: 'CortexLab', desc: 'Système multi-agents 12 cortex 60 agents', date: '12 / 2025', tag: 'Stack', img: '/carousel/cortexlab.webp' },
  { slug: 'hyperframes-studio', n: '10', name: 'HyperFrames Studio', desc: 'Post-prod vidéo HTML+GSAP rapide', date: '04 / 2026', tag: 'Studio', img: '/carousel/hyperframes-studio.webp' },
  { slug: 'tabasco-city', n: '11', name: 'TabascoCity', desc: 'Marketplace NFT artistique', date: '05 / 2026', tag: 'Site', img: '/carousel/tabasco-city.webp' },
  { slug: 'memorial', n: '12', name: 'Memorial', desc: 'BDD locale de patrimoine documentaire', date: '01 / 2026', tag: 'Stack', img: '/carousel/memorial.webp' },
  { slug: 'cortex-moderation', n: '13', name: 'Cortex Moderation', desc: 'Modération par vision IA, partagée entre plateformes. NSFW auto, IA détectée signalée, recours utilisateur.', date: '2026', tag: 'Service', img: '/carousel/cortex-moderation.webp', href: '/marketplace#agents-maison' },
  { slug: 'sound-cortex', n: '14', name: 'Sound-Cortex', desc: "Studio d'ingénierie son IA : musique, doublage, audiobook, effets.", date: '2026', tag: 'Studio', img: '/carousel/sound-cortex.webp', href: '/marketplace#agents-maison' },
  { slug: 'voicebox', n: '15', name: 'VoiceBox', desc: 'Synthèse vocale et clonage zero-shot, 7 moteurs MIT, en local.', date: '2026', tag: 'Tool', img: '/carousel/voicebox.webp', href: '/marketplace#agents-maison' },
  { slug: 'hub-pilotage', n: '16', name: 'Hub Pilotage IA', desc: 'Une interface pour piloter plusieurs IA, locales et distantes.', date: '2026', tag: 'Tool', img: '/carousel/hub-pilotage.webp', href: '/marketplace#agents-maison' },
  { slug: 'scraper-galerie', n: '17', name: 'Scraper Galerie', desc: "Collecte d'images à grande échelle, interface locale, rien dans le cloud.", date: '2026', tag: 'Tool', img: '/carousel/scraper-galerie.webp', href: '/marketplace#agents-maison' },
  { slug: 'istqb-trainer', n: '18', name: 'ISTQB Trainer', desc: 'Entraînement aux tests psychotechniques : séries, logique, correction expliquée.', date: '2026', tag: 'App', img: '/carousel/istqb-trainer.webp', href: '/marketplace#agents-maison' },
  { slug: 'serie-forge', n: '19', name: 'Serie-Forge Converter', desc: 'Un scénario lisible par un humain devient un scénario machine valide.', date: '2026', tag: 'Pipeline', img: '/carousel/serie-forge.webp', href: '/marketplace#agents-maison' },
];

export default function Home() {
  return (
    <>
      {/* HERO — B Cyberterminal Tron Refined */}
      <section className="relative h-screen min-h-[760px] overflow-hidden scanlines">
        <div className="absolute inset-0 canvas-fade">
          <CyberTunnel />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/40 to-transparent pointer-events-none z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-transparent to-obsidian/30 pointer-events-none z-[2]" />

        <div className="relative z-10 h-full max-w-[1400px] mx-auto px-8 flex items-center">
          <div className="max-w-3xl">
            <div className="hud-label mb-10">
              
            </div>

            <h1 className="display-cyber-h1 text-aqua mb-10">
              L'IA<br />
              <span className="grad-volt">CALIBREE</span><br />
              <span className="grad-volt-mint">POUR PRODUIRE.</span>
            </h1>

            <div className="flex items-baseline gap-6 mb-10 font-monodisp text-[10px] uppercase tracking-[0.22em] text-ash">
              <span><span className="text-accent">→</span> 12 cortex conçus en écosystème en 2024</span>
              <span><span className="text-accent">→</span> 60 agents élaborés en nov 2024 avant Ruflo</span>
              <span><span className="text-accent">→</span> Structure déclarée depuis 2023</span>
              <span className="hidden md:inline"><span className="text-accent">→</span> Équipe pluridisciplinaire expérimentée</span>
            </div>

            <p className="text-base lg:text-lg text-aqua/75 max-w-xl mb-12 leading-relaxed font-light">
              Consultant IA indépendant. Agents Claude et souverains (OpenClaw, Hermes, LLM local), locaux et indépendants, déjà skillés, chatbots métier
              pour <span className="text-aqua font-medium">PME, mairies, associations</span>. <br/>
              Mise en place sans jargon. Sans abonnement piège.<br/> Livrables clé en main avec démystification totale et formations.
            </p>

            <div className="flex flex-wrap gap-3 items-end">
              {/* Violet/rose abandonne le 11/09 ("ne vont pas, on saute, on
                  revient aux origines") : bouton restaure a sa place et sa
                  couleur d'origine. Seul le vrai bug reste corrige — l'ancien
                  `top:-12px, position:relative` le decalait de Tarifs et
                  cassait l'alignement de la rangee ; retire, rien d'autre. */}
              <a
                href="mailto:tabascocity@proton.me?subject=RDV%20decouverte"
                className="chrome-hover-light inline-flex items-center gap-3 text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-medium px-6 py-4 hover:brightness-110 transition-all"
                style={{
                  background: 'linear-gradient(110deg, #D4FF00 0%, #49DE8A 50%, #1a5e63 100%)',
                  borderRadius: '2px',
                }}
              >
                Init RDV → 30min
              </a>
            </div>
          </div>
        </div>

        {/* HUD menu options — extrait en composant client le 11/09 pour
            porter le son de survol (meme sfx que le choix d'un forfait). */}
        <HeroOptionsPanel />
      </section>

      {/* HERO 2 — Le Monde des Agents (scroll-driven 3D + video Blender) */}
      <AgentWorld />

      {/* Use cases : deplace dans la sequence pinnee du Hero 2
          (components/UseCasesChapter.tsx) — il en est le chapitre de cloture. */}

      {/* CTA */}
      <section className="relative bg-obsidian border-t border-accent/15 overflow-hidden pb-[15px]" style={{ minHeight: '490px' }}>
        {/* Carousel publicites — defile en arriere-plan, top 25px, sous le texte (z-0) */}
        <div className="absolute left-0 right-0 z-0 marquee-pause overflow-hidden" style={{ top: '25px' }}>
          <div className="flex gap-5 animate-marquee w-fit">
              {[...PRODUCTS, ...PRODUCTS].map((p, i) => (
                <a
                  key={`${p.slug}-${i}`}
                  href={p.href ?? `/agents#${p.slug}`}
                  className={`group relative shrink-0 h-[360px] lg:h-[450px] border border-accent/15 hover:border-accent/60 transition-all duration-500 overflow-hidden clip-civ-md ${p.featured ? 'w-[380px] lg:w-[520px] opacity-70 hover:opacity-100' : 'w-[240px] lg:w-[300px] opacity-40 hover:opacity-90'}`}
                >
                  {/* Image pixel art generee via studio-ai/ComfyUI.
                      PAS de loading="lazy" : dans un marquee anime de ~10 000px
                      de large, le navigateur croit les images hors-ecran et ne
                      les charge jamais (surtout sur mobile) -> naturalWidth 0. */}
                  <img
                    src={p.img}
                    alt={p.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Overlay obsidian — opacity defaut, eclairci au hover */}
                  <div className="absolute inset-0 bg-obsidian/40 group-hover:bg-obsidian/15 transition-colors" />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />

                  {/* HUD top */}
                  <div className="absolute top-3 left-3 right-3 flex items-baseline justify-between z-10">
                    <span className="font-monodisp text-[9px] text-accent tracking-[0.25em] uppercase">
                      {String((i % PRODUCTS.length) + 1).padStart(2, '0')} / {PRODUCTS.length}
                    </span>
                    <span className="font-monodisp text-[9px] text-aqua/70 tracking-[0.2em] uppercase border border-accent/30 bg-obsidian/40 backdrop-blur px-2 py-0.5">
                      {p.tag}
                    </span>
                  </div>

                  {/* Content bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-left">
                    <div className="font-monodisp text-[9px] text-accent tracking-[0.22em] uppercase mb-1.5">
                      → {p.date}
                    </div>
                    <h4 className={`font-monodisp text-aqua tracking-wide font-medium mb-1.5 truncate ${p.featured ? 'text-2xl' : 'text-base'}`}>
                      {p.name}
                    </h4>
                    <p className="font-monodisp text-[10px] text-aqua/65 leading-snug whitespace-normal line-clamp-2">
                      {p.desc}
                    </p>
                  </div>

                  {/* Corner brackets */}
                  <span aria-hidden className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-accent/60 z-10" />
                  <span aria-hidden className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-accent/60 z-10" />
                </a>
              ))}
          </div>
        </div>

        {/* Contenu superpose en z-20 — par-dessus le carousel, sans wrapper */}
        <div className="relative z-20 max-w-[1400px] mx-auto px-8 text-center pt-32">
          <div className="hud-label mb-6 inline-block">Follow_Us / ready_to_engage</div>
          <h2 className="display-cyber-h2 mb-4">
            <span className="text-aqua">PRET A </span>
            <span className="grad-volt">AVANCER</span>
            <span className="text-aqua"> ?</span>
          </h2>
          <p className="font-monodisp text-[11px] tracking-[0.2em] uppercase text-aqua/70 mb-10">
            <span className="text-accent">→</span> <Counter to={46} /> outils et agents déployés · 13 à venir en 2027
          </p>
          <Link
            href="/tarifs"
            className="chrome-hover-light inline-flex items-center gap-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] text-black font-medium px-10 py-5 hover:bg-aqua transition-[background-color,filter] duration-300 clip-civ-sm hover:[filter:drop-shadow(0_10px_26px_rgba(45,212,191,0.55))]"
          >
            <span className="w-1 h-1 bg-obsidian" />
            <span>Découvrir les forfaits</span>
            <span>/&gt;</span>
          </Link>
        </div>
      </section>

      {/* MEGASTUDIO — sous le carousel d'agents */}
      <MegaStudioBlock />

      {/* Dernier composant avant le footer : mur de logos, statique (pas de
          carousel), public/partners/. */}
      <PartnersWall />
    </>
  );
}
