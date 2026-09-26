'use client';

/**
 * CHAPITRE DE CLOTURE — "Ce que je livre. Concretement."
 *
 * Dernier mouvement de la sequence pinnee du Hero 2 : le faisceau-projecteur
 * acheve sa rotation, bascule vers le bas, et retombe ici.
 *
 * La video de fond n'est PAS lue en temps reel : elle est SCRUBBEE au scroll
 * (Naim 02/09 — "une seule longue qui agit de la maniere la plus esthetique
 * possible au scroll"). La molette devient la tete de lecture.
 *
 * Trois precautions, sinon un scrub est laid :
 *  1. LISSAGE — on interpole vers le temps cible au lieu d'y sauter, sinon
 *     chaque cran de molette produit un a-coup.
 *  2. SEUIL — on n'ecrit currentTime que si l'ecart est significatif ; sinon
 *     on sature le decodeur de seeks inutiles a chaque frame.
 *  3. GOP COURT — la video doit etre encodee avec des keyframes rapprochees
 *     (ffmpeg -g 5), sinon chaque seek doit remonter loin en arriere et l'image
 *     se fige. C'est fait au rendu, pas ici.
 */

import { useEffect, useRef } from 'react';

// Fondu de sortie : une fois la derniere frame atteinte, l'image s'efface
// TOTALEMENT sur les 60 dernieres frames (Naim 02/09 : 15 etait trop sec).
// Exprime en frames et
// non en pixels : le fondu reste cale sur le montage meme si la fenetre de
// scroll change.
const VIDEO_FPS = 16; // fps du montage (herite des sources Wan 2.2)
const FADE_FRAMES = 60;
const EASE = 0.14; // lissage du scrub (plus bas = plus doux, plus traînant)
const MIN_SEEK = 0.02; // s — en deca on n'ecrit pas currentTime

const CARDS = [
  {
    n: '01',
    t: 'Agents metiers',
    d: 'Reponses mails auto, traitement docs, generations de rapports, prospections humanisées de vos base de données. Branchés sur vos outils existants. ROI mesurable en 30 jours.',
    tag: 'PME · TPE',
  },
  {
    n: '02',
    t: 'Agent souverain',
    d: 'Voie souveraine adaptee (OpenClaw, Hermes ou Ollama) + LLM local on-premise (Qwen3, Mistral, Kimi). Aucune donnee cloud. RGPD blinde. Pour data sensibles. Campagnes de prospection pour évènements, sales, études, stratégies... Métriques complets et clairs.',
    tag: 'Mairies · Cabinets',
  },
  {
    n: '03',
    t: 'Chatbot adherent',
    d: 'FAQ multilingue 24/7 connectee a votre base docs. Liberez vos benevoles des taches repetitives. Auto-évolution par mise à jour suggérées.',
    tag: 'Associations',
  },
];

export default function UseCasesChapter({
  src,
  scrubFrom,
  scrubTo,
}: {
  src: string;
  /** Fractions du scroll de la section AgentWorld pendant lesquelles ce
   *  chapitre est a l'ecran. Le scrub DOIT etre calé dessus : mesurer la
   *  progression sur la section entiere (820vh) ne faisait defiler que ~2,4 s
   *  de video sur 15 — on croyait voir une image fixe. */
  scrubFrom: number;
  scrubTo: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    const bg = bgRef.current;
    if (!v || !bg) return;
    const section = bg.closest('section') ?? bg.parentElement;
    if (!section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let cur = 0; // tete de lecture lissee
    let visible = false;

    const step = () => {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progression DANS la section pinnee (0 = debut du pin, 1 = fin)
      const total = Math.max(1, section.clientHeight - vh);
      const pSec = Math.min(1, Math.max(0, -r.top / total));
      // Puis on la reduit a la seule fenetre ou ce chapitre est visible :
      // c'est cette plage-la qui doit couvrir toute la duree de la video.
      const span = Math.max(0.01, scrubTo - scrubFrom);
      const p = Math.min(1, Math.max(0, (pSec - scrubFrom) / span));

      const d = v.duration;
      if (d && isFinite(d) && v.readyState >= 2) {
        const target = p * d;
        cur += (target - cur) * EASE;
        if (Math.abs(cur - v.currentTime) > MIN_SEEK) {
          try {
            v.currentTime = cur;
          } catch {
            /* seek refuse pendant un buffering : on retentera a la frame suivante */
          }
        }
      }

      // Fondu final : pleine opacite jusqu'aux 15 dernieres frames, puis
      // extinction complete. La largeur du fondu est deduite de la duree
      // reelle du fichier, donc elle suit le montage automatiquement.
      const fadeSpan = d && isFinite(d) ? FADE_FRAMES / VIDEO_FPS / d : 0.0625;
      const fadeStart = 1 - fadeSpan;
      const settle = p <= fadeStart ? 1 : Math.max(0, 1 - (p - fadeStart) / fadeSpan);
      bg.style.setProperty('--settle', settle.toFixed(3));

      raf = visible ? requestAnimationFrame(step) : 0;
    };

    // On n'anime que lorsque la section est reellement a l'ecran.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visible = e.isIntersecting;
          if (visible && !raf && !reduced) raf = requestAnimationFrame(step);
          if (!visible && raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        }
      },
      { rootMargin: '120px 0px' },
    );
    io.observe(section);

    // prefers-reduced-motion : image fixe, pas de scrub
    if (reduced) {
      const onMeta = () => {
        try {
          v.currentTime = v.duration * 0.5;
        } catch {
          /* ignore */
        }
      };
      v.addEventListener('loadedmetadata', onMeta);
      return () => {
        v.removeEventListener('loadedmetadata', onMeta);
        io.disconnect();
      };
    }

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrubFrom, scrubTo]);

  // Mobile (15/09) : le conteneur epingle est en h-screen overflow-hidden, donc
  // tout ce qui depasse 100vh est coupe — la 3e carte perdait son bouton.
  // Cales en haut (sous la navbar), cartes compactees, et defilement interne
  // en filet de securite. Desktop : centre, inchange.
  return (
    <div data-close-wrap className="absolute inset-0 flex items-start md:items-center pointer-events-none">
      {/* Fond video — tete de lecture pilotee par la molette */}
      <div
        ref={bgRef}
        aria-hidden
        className="absolute inset-0 overflow-hidden"
        style={{ opacity: 'var(--settle, 1)' }}
      >
        {/* PLEINE LARGEUR au calibrage 4:3 : le bloc prend toute la largeur et
            sa hauteur suit le ratio, donc il deborde verticalement et se fait
            rogner en haut/bas par le parent. On garde ainsi l'echelle d'image
            validee, sans la bande noire des cotes. */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full aspect-[4/3]">
          <video
            ref={videoRef}
            data-close-video
            src={src}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        {/* Voile allege pour laisser passer ~60% de l'image.
            Attention : deux couches superposees ne s'additionnent PAS, elles
            se multiplient — transmission = (1-a) x (1-b). Ici (1-0.30) x
            (1-0.15) ~ 0.60. Le bord gauche reste plus dense : c'est la que
            vit la colonne de texte. */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 via-obsidian/28 to-obsidian/20" />
        <div className="absolute inset-0 bg-obsidian/15" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-5 md:px-8 pt-24 pb-8 md:py-0 max-h-full overflow-y-auto md:overflow-visible pointer-events-auto">
        <div className="hud-label mb-4 md:mb-8">SECTION_02 / use_cases</div>
        <h2 className="display-cyber-h2 text-aqua max-w-4xl mb-6 md:mb-10 lg:mb-16">
          CE QUE NOUS LIVRONS.<br />
          <span className="grad-volt">CONCRETEMENT.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-accent/15">
          {CARDS.map((card) => (
            <div
              key={card.n}
              className="chrome-hover bg-obsidian/85 backdrop-blur-sm p-4 md:p-6 lg:p-8 group hover:bg-carbon transition-colors relative overflow-hidden"
            >
              <div className="flex items-baseline justify-between mb-3 md:mb-6 lg:mb-10">
                <span className="font-monodisp text-[10px] text-accent tracking-widest">{card.n}</span>
                <span className="font-monodisp text-[10px] text-ash tracking-widest uppercase">{card.tag}</span>
              </div>
              <h3 className="display-cyber-h2 text-aqua mb-3" style={{ fontSize: 'clamp(20px, 2vw, 30px)' }}>
                {card.t}
              </h3>
              <p className="text-aqua/60 text-[12px] md:text-[13px] leading-relaxed font-light">{card.d}</p>
              <div className="mt-3 md:mt-6 font-monodisp text-[11px] text-accent group-hover:translate-x-2 transition-transform tracking-wider">
                → en savoir plus
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
