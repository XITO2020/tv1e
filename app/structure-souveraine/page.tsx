import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Structure souveraine — LLM local on-premise',
  description:
    'LLM local (Ollama, Llama 3, Qwen) déployé sur votre serveur : aucune donnée dans le cloud, RGPD, idéal mairies et données sensibles.',
};

import Link from 'next/link';

export default function StructureSouverainePage() {
  return (
    <main className="bg-obsidian min-h-screen">
      {/* HERO */}
      <section className="relative pt-40 pb-24 border-b border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-accent" />
            Agent souverain sur mesure · 2 700 €
          </div>
          <h1 className="display-cyber-h1 mb-8">
            <span className="text-aqua">VOS DONNÉES</span><br />
            <span className="grad-volt">NE QUITTENT JAMAIS</span><br />
            <span className="grad-volt-mint">VOTRE SERVEUR.</span>
          </h1>
          <p className="text-base lg:text-lg text-aqua/75 max-w-3xl font-light leading-relaxed">
            Une stack souveraine <span className="text-aqua">déployée sur votre infrastructure</span> : selon votre machine,
            votre budget et votre implication, on installe OpenClaw, Hermes ou un LLM local pur (Ollama + modèle ouvert) —
            un agent qui garde sa mémoire chez vous. Aucune dépendance cloud. RGPD blindé.
            Compatible mairies, cabinets juridiques, santé, défense. Cette page détaille comment je vous installe,
            vous forme, et évalue votre hardware.
          </p>
        </div>
      </section>

      {/* SECTION 01 — INSTALLATION 3 OS */}
      <section className="py-32 border-b border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-16">
            <div className="col-span-12 lg:col-span-3">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                01 / Installation
              </div>
            </div>
            <div className="col-span-12 lg:col-span-9">
              <h2 className="display-cyber-h2 text-aqua mb-6">
                INSTALLE SUR <span className="grad-mint">LINUX, MAC, WINDOWS</span>.
              </h2>
              <p className="text-base text-aqua/70 font-light leading-relaxed max-w-3xl">
                Je déploie la voie choisie (OpenClaw, Hermes ou Ollama) sur les 3 OS principaux, en une journée.
                Les installeurs sont natifs sur Linux, macOS et Windows (PowerShell, plus besoin de WSL2).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-accent/15">
            {[
              {
                os: 'Linux',
                tag: 'Ubuntu / Debian / Arch',
                steps: [
                  'Audit distro + version kernel + GPU',
                  'Install Ollama + agent souverain (OpenClaw ou Hermes)',
                  'Pull modèle : Qwen3 30B-A3B ou Mistral (contexte 64k)',
                  'Services systemd : Ollama + agent au boot',
                  'Reverse proxy Nginx + Let\'s Encrypt',
                  'Hardening UFW + fail2ban · skill packs + gateway',
                ],
                duration: '3-5h',
              },
              {
                os: 'macOS',
                tag: 'M1/M2/M3 · Intel',
                steps: [
                  'Détection Apple Silicon / Intel',
                  'Install Ollama (DMG) + agent souverain (OpenClaw ou Hermes)',
                  'Optimisation Metal pour M1+',
                  'LaunchAgent auto-start au boot',
                  'Tunnel HTTPS via Tailscale ou Cloudflare',
                  'Test charge selon RAM · skill packs + gateway',
                ],
                duration: '3-4h',
              },
              {
                os: 'Windows',
                tag: 'natif · PowerShell',
                steps: [
                  'Audit GPU NVIDIA + RAM + disque',
                  'Install Ollama Windows + agent souverain (installeur natif, 60 s)',
                  'Contexte 64k : OLLAMA_CONTEXT_LENGTH au niveau service',
                  'Modèle Qwen3 30B-A3B ou Mistral selon VRAM',
                  'Tâche planifiée Windows : démarrage au boot',
                  'Skill packs + gateway (mail, Teams, WhatsApp, SMS)',
                ],
                duration: '3-4h',
              },
            ].map((card) => (
              <div key={card.os} className="bg-obsidian p-8 lg:p-10">
                <div className="flex items-baseline justify-between mb-8">
                  <h3 className="font-display text-3xl text-aqua uppercase tracking-tight">{card.os}</h3>
                  <span className="font-monodisp text-[10px] text-accent/70 tracking-widest uppercase">
                    {card.duration}
                  </span>
                </div>
                <div className="font-monodisp text-[10px] text-accent/60 tracking-wider uppercase mb-6">
                  {card.tag}
                </div>
                <ul className="space-y-2">
                  {card.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 py-1.5 border-t border-accent/15 text-aqua/80">
                      <span className="font-monodisp text-[10px] text-accent mt-1 w-5 shrink-0">
                        0{i + 1}
                      </span>
                      <span className="text-sm leading-relaxed font-light">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 02 — L'agent souverain : ce qu'il apprend seul (12/09/2026) */}
      <section className="py-32 border-b border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-16">
            <div className="col-span-12 lg:col-span-3">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                02 / L'agent
              </div>
            </div>
            <div className="col-span-12 lg:col-span-9">
              <h2 className="display-cyber-h2 text-aqua mb-6">
                UN AGENT QUI <span className="grad-mint">APPREND SEUL</span>.<br />
                CHEZ VOUS. SANS ABONNEMENT.
              </h2>
              <p className="text-base text-aqua/70 font-light leading-relaxed max-w-3xl">
                Selon votre machine, on installe OpenClaw (plateforme d'agents accessible) ou Hermes (runtime open source,
                licence MIT, Nous Research). Dans les deux cas, l'agent ne se contente pas de répondre : il crée ses
                propres compétences à l'usage, garde sa mémoire sur votre serveur et tourne en tâche planifiée. Je
                l'installe avec Ollama et un modèle ouvert, je le livre avec des skill packs métier déjà éprouvés, et il
                continue d'évoluer sans moi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-accent/15">
            {[
              {
                t: 'Skills auto-créés',
                d: "L'agent transforme ce qu'il a réussi en compétence réutilisable (format ouvert SKILL.md). Vous livrez les vôtres, il fabrique les suivantes.",
              },
              {
                t: 'Mémoire locale',
                d: "Il se souvient d'une session à l'autre, de vos documents, de vos habitudes. Tout reste dans votre base, jamais dans un cloud.",
              },
              {
                t: 'Cron + messageries',
                d: "Rapports du lundi, relances, veille : planifiés en interne et livrés par mail, Teams, WhatsApp, SMS ou Signal, au choix.",
              },
              {
                t: 'Évolution à 120 €',
                d: "Tous les 4 mois, une mise à jour signée vous est proposée (nouveaux packs, nouveau modèle). Vous refusez ? Rien ne se dégrade.",
              },
            ].map((c) => (
              <div key={c.t} className="bg-obsidian p-7 lg:p-8">
                <h3 className="font-monodisp text-[13px] text-accent uppercase tracking-[0.18em] mb-4">{c.t}</h3>
                <p className="text-[15px] text-aqua/70 font-light leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 font-monodisp text-[10px] text-aqua/50 tracking-wider uppercase">
            * Usage agentique avec outils : contexte 64 000 tokens et modèle à appel d'outils (Qwen3 30B-A3B recommandé). Vérifié le 12.09.2026.
          </p>
        </div>
      </section>

      {/* SECTION 03 — LLM GRATUITS / API KEYS */}
      <section className="py-32 border-b border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-16">
            <div className="col-span-12 lg:col-span-3">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                03 / Modeles
              </div>
            </div>
            <div className="col-span-12 lg:col-span-9">
              <h2 className="display-cyber-h2 text-aqua mb-6">
                LLM GRATUITS <span className="grad-mint">OU VOS API KEYS</span>.<br />
                VOUS CHOISISSEZ.
              </h2>
              <p className="text-base text-aqua/70 font-light leading-relaxed max-w-3xl">
                Vous decidez du compromis perf / cout / privacy. Je peux deployer 100% local gratuit, hybride,
                ou full API. Et vous accompagner pour migrer entre les options selon votre maturite.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-carbon/40 border border-accent/25 p-8 lg:p-10 clip-civ-md">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                Option A · 100% Local Gratuit
              </div>
              <h3 className="font-display text-3xl text-aqua mb-4 uppercase tracking-tight">
                LLM open-source <span className="text-accent">offerts</span>
              </h3>
              <p className="text-sm text-aqua/65 mb-8 font-light leading-relaxed">
                Modèles libres / open-source pré-installés selon votre hardware et besoin métier.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'Qwen 2.5 7B / 14B / 72B (Alibaba) — meilleur généraliste',
                  'Llama 3.1 8B / 70B (Meta) — robuste, francophone OK',
                  'Mistral 7B / Mixtral 8x7B (Mistral AI · FR) — top en français',
                  'Phi-3 Mini 3.8B (Microsoft) — ultra-léger pour petite RAM',
                  'Code Qwen / Code Llama pour génération code',
                  'Whisper (OpenAI open-source) pour transcription audio',
                ].map((m, i) => (
                  <li key={i} className="flex items-start gap-3 py-1.5 border-t border-accent/15 text-aqua/85">
                    <span className="font-monodisp text-[10px] text-accent mt-1 w-5 shrink-0">→</span>
                    <span className="text-sm font-light">{m}</span>
                  </li>
                ))}
              </ul>
              <div className="font-monodisp text-[11px] uppercase tracking-[0.2em] text-accent">
                Coût : 0 € / mois · Données jamais sortantes
              </div>
            </div>

            <div className="bg-carbon/40 border border-accent/25 p-8 lg:p-10 clip-civ-md">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                Option B · API Keys
              </div>
              <h3 className="font-display text-3xl text-aqua mb-4 uppercase tracking-tight">
                Vos clés <span className="text-accent">API premium</span>
              </h3>
              <p className="text-sm text-aqua/65 mb-8 font-light leading-relaxed">
                Si vous voulez la perf maximale, je branche vos clés API directement dans la stack.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'Anthropic Claude (Sonnet / Opus) — meilleur LLM 2026',
                  'OpenAI GPT-4o / GPT-5 — référent généraliste',
                  'Mistral Large API (souverain européen)',
                  'Google Gemini 2.5 Pro / Flash',
                  'Cohere Command R+ (RAG spécialiste)',
                  'Hybride : routage selon type de requête (coût-perf optimisé)',
                ].map((m, i) => (
                  <li key={i} className="flex items-start gap-3 py-1.5 border-t border-accent/15 text-aqua/85">
                    <span className="font-monodisp text-[10px] text-accent mt-1 w-5 shrink-0">→</span>
                    <span className="text-sm font-light">{m}</span>
                  </li>
                ))}
              </ul>
              <div className="font-monodisp text-[11px] uppercase tracking-[0.2em] text-accent">
                Coût : pay-per-token · Vos clés, votre facturation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 04 — FORMATION */}
      <section className="py-32 border-b border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-16">
            <div className="col-span-12 lg:col-span-3">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                04 / Formation
              </div>
            </div>
            <div className="col-span-12 lg:col-span-9">
              <h2 className="display-cyber-h2 text-aqua mb-6">
                JE FORME VOTRE ÉQUIPE À <span className="grad-mint">TOUT ÇA</span>.
              </h2>
              <p className="text-base text-aqua/70 font-light leading-relaxed max-w-3xl">
                Après l'installation, je forme votre équipe technique à opérer la stack en autonomie.
                Curriculum découpé en 3 modules.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                n: '01',
                title: 'Module Opération (1 jour)',
                duration: '6h hands-on',
                items: [
                  'Architecture agent souverain + Ollama : comprendre les briques',
                  'CLI Ollama et agent (OpenClaw / Hermes) : modèles, skills, mémoire, cron',
                  'Lecture des logs, monitoring CPU/RAM/GPU',
                  'Basculer entre modèles selon le besoin métier',
                  'Restart / debug en autonomie',
                ],
              },
              {
                n: '02',
                title: 'Module Prompting (1 jour)',
                duration: '6h théorie + pratique',
                items: [
                  'Anatomie d\'un bon system prompt',
                  'RAG : indexer vos documents internes',
                  'Comparer perf des modèles sur vos cas d\'usage',
                  'Écrire un skill pack (SKILL.md) et le faire apprendre à l\'agent',
                  'Limites & risques : hallucinations, jailbreak',
                ],
              },
              {
                n: '03',
                title: 'Module Maintenance (1/2 jour)',
                duration: '3h checklist',
                items: [
                  'Mises à jour modèles + sécurité OS',
                  'Sauvegardes : configs, embeddings, FAQ',
                  'Procédure de restauration après crash',
                  'Quand m\'appeler en renfort (escalade)',
                  'Documentation interne fournie',
                ],
              },
            ].map((mod) => (
              <article key={mod.n} className="grid grid-cols-12 gap-8 py-8 border-t border-accent/15">
                <div className="col-span-12 lg:col-span-3">
                  <div className="font-monodisp text-xs text-accent tracking-widest mb-1">MODULE {mod.n}</div>
                  <div className="font-monodisp text-[10px] text-aqua/50 tracking-wider uppercase">{mod.duration}</div>
                </div>
                <div className="col-span-12 lg:col-span-9">
                  <h3 className="font-display text-2xl text-aqua mb-4 uppercase tracking-tight">{mod.title}</h3>
                  <ul className="space-y-1.5">
                    {mod.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 py-1 text-aqua/80">
                        <span className="font-monodisp text-[10px] text-accent mt-1 w-5 shrink-0">→</span>
                        <span className="text-sm font-light">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 p-6 bg-accent/5 border border-accent/30 clip-civ-sm">
            <div className="font-monodisp text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
              Tarif formation 2.5 jours
            </div>
            <div className="font-display text-3xl text-aqua">2 990 € HT</div>
            <p className="text-sm text-aqua/65 mt-2 font-light">
              Module indépendant. Le forfait Agent souverain sur mesure 2 700 € inclut 2 h de prise en main ; ces 2,5 jours
              s\'ajoutent quand l\'équipe doit opérer la stack sans moi.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 05 — EVALUATION HARDWARE */}
      <section className="py-32 border-b border-accent/15">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-16">
            <div className="col-span-12 lg:col-span-3">
              <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-accent mb-4">
                05 / Hardware
              </div>
            </div>
            <div className="col-span-12 lg:col-span-9">
              <h2 className="display-cyber-h2 text-aqua mb-6">
                AUDIT <span className="grad-mint">PUISSANCE</span>.<br />
                ON CALCULE CE QUE VOUS POUVEZ FAIRE TOURNER.
              </h2>
              <p className="text-base text-aqua/70 font-light leading-relaxed max-w-3xl">
                Avant tout deploiement, j'audite votre serveur ou je vous aide a choisir le bon. Voici la grille
                d'evaluation que j'utilise.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-px bg-accent/15">
            {[
              ['Configuration', 'Modèle recommandé', 'Vitesse', 'Usage adapté'],
              ['8 GB RAM · CPU only', 'Phi-3 Mini 3.8B', '~5 tok/s', 'POC, démo, FAQ simple'],
              ['16 GB RAM · CPU only', 'Qwen 2.5 7B / Mistral 7B', '~3 tok/s', 'Petite asso, FAQ enrichie'],
              ['16 GB + GPU 8GB VRAM', 'Qwen 2.5 7B GPU', '~25 tok/s', 'Mairie petite, cabinet'],
              ['32 GB + RTX 3080/4080', 'Qwen3 30B-A3B (agent, outils)', '~40 tok/s', 'PME · mairie · usage prod, agent complet'],
              ['64 GB + RTX 4090 / A6000', 'Qwen3 30B-A3B / Llama 70B Q4', '~30 tok/s', 'Grande structure, multi-utilisateurs'],
              ['VPS Hostinger KVM2 (16 GB)', 'Qwen 2.5 7B', '~3 tok/s', 'MVP, démo client, low-traffic'],
              ['Serveur dédié + GPU H100', 'Llama 70B / Qwen 72B full', '~80 tok/s', 'Industriel, multi-tenant'],
            ].map((row, idx) => (
              <div key={idx} className="contents">
                {row.map((cell, ci) => (
                  <div
                    key={ci}
                    className={
                      idx === 0
                        ? 'col-span-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.2em] font-bold p-4'
                        : 'col-span-3 bg-obsidian p-4 text-sm font-light' +
                          (ci === 0 ? ' font-monodisp text-[11px] uppercase tracking-wider text-accent/80' : ' text-aqua/85')
                    }
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <p className="mt-8 font-monodisp text-[10px] text-aqua/50 tracking-wider uppercase">
            * Vitesses indicatives en quantization Q4_K_M · varient selon contexte, longueur prompt et OS · un agent avec outils exige 64k de contexte et un modèle à appel d\'outils : en dessous de 16 Go de VRAM, on livre un chatbot, pas un agent
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-32 bg-obsidian">
        <div className="max-w-[1400px] mx-auto px-8 text-center">
          <div className="hud-label mb-8 inline-block">agent souverain sur mesure · 2 700 € · 5 jours</div>
          <h2 className="display-cyber-h2 mb-10">
            <span className="text-aqua">PRÊT POUR </span>
            <span className="grad-volt">L\'INDÉPENDANCE</span>
            <span className="text-aqua"> ?</span>
          </h2>
          <p className="text-base text-aqua/70 mb-10 max-w-xl mx-auto font-light">
            On audite votre infrastructure, on installe la voie souveraine adaptée et le modèle, je forme votre équipe.
            Résultat : un agent qui apprend chez vous, sur votre serveur, sans dépendance cloud ni abonnement.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/tarifs#forfaits"
              className="inline-flex items-center gap-3 bg-accent text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold px-10 py-5 hover:bg-aqua transition-colors"
              style={{ borderRadius: '2px' }}
            >
              Réserver le forfait souverain
              <span className="font-monodisp">→</span>
            </Link>
            <a
              href="mailto:tabascocity@proton.me?subject=Audit%20infrastructure%20souveraine"
              className="inline-flex items-center gap-3 border border-accent/30 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-10 py-5 hover:border-accent hover:text-accent transition-colors"
              style={{ borderRadius: '2px' }}
            >
              Audit hardware gratuit (15 min)
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
