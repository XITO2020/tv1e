import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skills Claude Code open-source',
  description:
    'À partir de 22 skills custom Claude Code publiés gratuitement sur GitHub (MIT), suppléments sur devis : design, frontend, automatisation.',
};

import Link from 'next/link';

const SKILLS = [
  // Categorie : design & frontend
  {
    cat: 'Design & Frontend',
    items: [
      { name: 'restore-design', tag: 'design', desc: 'Garde-fou anti-ecrasement de fichiers UI existants. Force a lire avant d\'editer, presente plan diff, refuse les versions simplifiees recreees de memoire.' },
      { name: 'taste-skill', tag: 'design', desc: 'Senior UI/UX engineer. Architecture interfaces digitales, regles metric-based, hardware acceleration CSS, design engineering equilibre.' },
      { name: 'layout-architect', tag: 'frontend', desc: 'Structuration pages, composants, navigation. Layouts responsives, hierarchie composants, routing, accessibilite landmarks.' },
      { name: 'gsap-animator', tag: 'animation', desc: 'GSAP avance : ScrollTrigger, timelines, morphing SVG, text splitting, parallax, pin sections, scrub. Cohabitation Framer Motion.' },
    ],
  },
  // Categorie : video & motion
  {
    cat: 'Video & Motion',
    items: [
      { name: 'hyperframes-studio', tag: 'video', desc: 'Post-prod video HTML+GSAP rapide. Branding restaurants, TikTok packaging, lower-thirds, transitions catalog. Decide HyperFrames vs Remotion.' },
      { name: 'remotion-studio', tag: 'video', desc: 'Generation video via Remotion 4.x. Promos sites, trailers jeux, clips sociaux. Integre ComfyUI + ffmpeg post-processing.' },
      { name: 'motion-cortex', tag: 'video', desc: 'Generateur video IA local. Image-to-video LTX-Video + Wan 2.2 sur ComfyUI. Specialise contenus pub TikTok/Instagram avec injection personnages.' },
      { name: 'studio-ai', tag: 'video', desc: 'Orchestrateur unifie Remotion + HyperFrames. UI pour template + clips + customisation, MP4 export en 1 clic.' },
    ],
  },
  // Categorie : image generation
  {
    cat: 'Generation image',
    items: [
      { name: 'comfyui-pilot', tag: 'image', desc: 'Pilote ComfyUI via MCP + Pinokio. txt2img, img2img, blend, upscale. Cross-projet : NFT artwork, manga panels, sprites, thumbnails.' },
      { name: 'nano-banana', tag: 'image', desc: 'Provider Gemini Flash/Pro Image Preview intégré. txt2img, img2img, édition image existante, multi-résolution 512-4K.' },
      { name: 'pinokio-manager', tag: 'image', desc: 'Guide pour installer et gerer les IAs gratuites via Pinokio (one-click installer). Zero API key, zero abonnement, tout en local.' },
      { name: 'sprite-factory', tag: 'image', desc: 'Pipeline génération sprites 2D : 37 fighters, 7 phases fatigue, 4 tilts, style Garou+KOF+MvC2. ComfyUI 100% local et gratuit.' },
      { name: 'qishim-image-blend', tag: 'image', desc: 'Fusion d\'images creative : 2 a 10 images source + prompt texte precis via ComfyUI local. Genere workflows JSON pretes a l\'emploi.' },
    ],
  },
  // Categorie : strategie & decision
  {
    cat: 'Strategie & decision',
    items: [
      { name: 'llm-council', tag: 'strategy', desc: 'Pressure-test une decision avec 5 conseillers IA aux styles opposes (Contrarian, First Principles, Expansionist, Outsider, Executor). Peer review + Chairman synthese.' },
      { name: 'grill-me', tag: 'strategy', desc: 'Interview sans relache jusqu\'a comprehension partagee. Chaque branche de l\'arbre de decisions, dependance par dependance. Avant tout gros engagement.' },
      { name: 'cortex-auditor', tag: 'analysis', desc: 'Grille audit standardisee pour etudier chaque cortex QISHIM un par un. Score completude agents, maturite, actions a mener.' },
      { name: 'qishim-multiproject', tag: 'orchestration', desc: 'Orchestrateur cross-projet 5 projets QISHIM. Choix priorisation, impacts cross-projets, stacks, fichiers critiques.' },
    ],
  },
  // Categorie : code & infra
  {
    cat: 'Code & Infra',
    items: [
      { name: 'code-review-tabascocity', tag: 'review', desc: 'Code review spécialisé écosystème TabascoCity/Qishim : Express+Prisma, Solidity, Next.js, intégrations cross-sites. Détecte risques sécurité JWT, blockchain, payments, NFT mint.' },
      { name: 'scalability-multisite', tag: 'archi', desc: 'Cross-site architecture : shared DB, unified auth, deployment orchestration, API gateway, shared component libraries.' },
      { name: 'sibilization-3d-pipeline', tag: 'pipeline', desc: 'Pipeline 3D batiments + unites Sibilization. MCP Blender + Sketchfab + Hyper3D Rodin + Hunyuan3D + PolyHaven. Glb low-poly stylises.' },
    ],
  },
  // Categorie : utility
  {
    cat: 'Utility & meta',
    items: [
      { name: 'autoapprove', tag: 'meta', desc: 'Mode "tout autorise pour la tache". Autorise les actions necessaires sans confirmation a chaque etape. Operations dangereuses restent bloquees par deny-list.' },
      { name: 'caveman', tag: 'meta', desc: 'Compression de tokens pour economiser sur outputs Claude et Ollama. Adapte du repo JuliusBrussee/caveman (MIT) pour les 5 projets Qishim.' },
      { name: 'skill-harvester', tag: 'meta', desc: 'Pioche et adapte des skills communautaires depuis awesome-claude-skills et SkillsMP. Mapping cortex-skills et format d\'adaptation.' },
    ],
  },
];

export default function SkillsPage() {
  return (
    <main className="bg-obsidian min-h-screen">
      {/* HERO */}
      <section className="relative pt-40 pb-24 border-b border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-accent" />
            Catalogue · à partir de 22 skills Claude Code
          </div>
          <h1 className="display-cyber-h1 mb-8">
            <span className="text-aqua">NOS </span>
            <span className="grad-volt">CREATIONS</span><br />
            <span className="grad-volt-mint">DE SKILLS.</span>
          </h1>
          <p className="text-base lg:text-lg text-aqua/75 max-w-3xl font-light leading-relaxed">
            À partir de 22 skills custom Claude Code développés pour l'écosystème tuveuxun.expert &amp; QISHIM-CORTEX, suppléments sur devis.
            Chaque skill encapsule un savoir-faire spécifique : design, vidéo, image, stratégie, code, infra.
            Disponibles pour vos missions ou export GitHub si pertinent.
          </p>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-accent/30 p-4">
              <div className="font-display text-3xl text-aqua">22</div>
              <div className="font-monodisp text-[10px] uppercase tracking-widest text-accent/70 mt-1">Skills custom</div>
            </div>
            <div className="border border-accent/30 p-4">
              <div className="font-display text-3xl text-aqua">6</div>
              <div className="font-monodisp text-[10px] uppercase tracking-widest text-accent/70 mt-1">Categories</div>
            </div>
            <div className="border border-accent/30 p-4">
              <div className="font-display text-3xl text-aqua">100%</div>
              <div className="font-monodisp text-[10px] uppercase tracking-widest text-accent/70 mt-1">Production-ready</div>
            </div>
            <div className="border border-accent/30 p-4">
              <div className="font-display text-3xl text-aqua">FR</div>
              <div className="font-monodisp text-[10px] uppercase tracking-widest text-accent/70 mt-1">Documentation</div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPLOYMENT OPTIONS */}
      <section className="py-20 border-b border-accent/15 bg-carbon/30">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-obsidian border border-accent/25 p-8 clip-civ-md">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                Option A · Deploiement chez vous
              </div>
              <h3 className="font-display text-2xl text-aqua mb-4 uppercase tracking-tight">
                Skills installes sur votre Claude Code
              </h3>
              <p className="text-sm text-aqua/70 font-light leading-relaxed">
                J'installe les skills pertinents directement dans le `.claude/skills/` de votre projet.
                Activation immediate via `/nom-du-skill`. Documentation FR fournie.
              </p>
            </div>
            <div className="bg-obsidian border border-accent/25 p-8 clip-civ-md">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                Option B · Repo GitHub
              </div>
              <h3 className="font-display text-2xl text-aqua mb-4 uppercase tracking-tight">
                Publication open-source selective
              </h3>
              <p className="text-sm text-aqua/70 font-light leading-relaxed">
                Pour les skills qui s'y pretent (utility, meta), publication sur un repo GitHub public que vous
                pouvez forker, contribuer ou simplement utiliser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {SKILLS.map((cat) => (
        <section key={cat.cat} className="py-24 border-b border-accent/10">
          <div className="max-w-[1400px] mx-auto px-8">
            <div className="grid grid-cols-12 gap-8 mb-12">
              <div className="col-span-12 lg:col-span-3">
                <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
                  Categorie
                </div>
                <h2 className="display-cyber-h2 text-aqua">{cat.cat.toUpperCase()}</h2>
                <div className="font-monodisp text-[10px] text-accent/60 mt-3 tracking-widest">
                  {cat.items.length.toString().padStart(2, '0')} skill{cat.items.length > 1 ? 's' : ''}
                </div>
              </div>
              <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.items.map((s) => (
                  <article
                    key={s.name}
                    className="group bg-carbon/40 border border-accent/15 hover:border-accent/50 hover:bg-carbon/70 p-5 transition-all clip-civ-sm"
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="font-monodisp text-sm text-aqua font-medium">/{s.name}</h3>
                      <span className="font-monodisp text-[9px] text-accent/70 tracking-widest uppercase">
                        {s.tag}
                      </span>
                    </div>
                    <p className="text-sm text-aqua/65 font-light leading-relaxed">{s.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-32 bg-obsidian">
        <div className="max-w-[1400px] mx-auto px-8 text-center">
          <div className="hud-label mb-8 inline-block">deploiement custom · sur devis</div>
          <h2 className="display-cyber-h2 mb-10">
            <span className="text-aqua">UN SKILL </span>
            <span className="grad-volt">SUR MESURE</span>
            <span className="text-aqua"> ?</span>
          </h2>
          <p className="text-base text-aqua/70 mb-10 max-w-xl mx-auto font-light">
            Vous avez un workflow récurrent ? Je vous fabrique le skill dédié qui le capture.
            Documentation, tests, deploiement Claude Code ou GitHub.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:tabascocity@proton.me?subject=Skill%20custom%20Claude%20Code"
              className="inline-flex items-center gap-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold px-10 py-5 hover:bg-aqua transition-colors"
              style={{ borderRadius: '2px' }}
            >
              Demander un skill custom
              <span className="font-monodisp">→</span>
            </a>
            <Link
              href="/tarifs#forfaits"
              className="inline-flex items-center gap-3 border border-accent/30 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-10 py-5 hover:border-accent hover:text-accent transition-colors"
              style={{ borderRadius: '2px' }}
            >
              Voir les forfaits
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
