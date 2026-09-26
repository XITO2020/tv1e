/**
 * Moteur sonore partage — un seul AudioContext pour tout le site, y compris
 * la home (qui n'a qu'UN son : le depart de la traversee 3D, une fois).
 *
 * Deplace hors de SoundLayer.tsx le 11/09/2026 : le premier jet ne vivait
 * que sur les pages secondaires, la home n'avait donc aucun acces au moteur
 * quand Naim a demande un son unique sur son propre defile en profondeur.
 *
 * Regle des navigateurs, non contournable : aucun son avant un geste de
 * l'utilisateur (clic, touche, toucher) — scroll et survol ne comptent pas,
 * comme pour une video. `armGlobally()` pose donc un ecouteur au niveau de
 * `window`, sur TOUTE page, des le montage de <SfxArmer/> dans le layout
 * racine ; le premier geste n'importe ou arme le moteur pour tout le site.
 */

const DIR = '/bgm/';
const FILES = {
  nav: 'hover-button-aside+navbar.mp3',
  // 11/09 (retour Naim) : ce fichier ne joue plus sur le footer — retire de
  // la, repris sur les CTA "reserver" du tarifs (cf. SoundLayer/tarifs). La
  // cle garde son nom d'origine pour ne pas toucher tout le reste du moteur.
  footer: 'footer-links.mp3',
  forfait: 'hover-select-forfait.mp3',
  link: 'some-links+fermeture-menu-agents.mp3',
  catalogue: 'catalogue-hover.mp3',
  menuOpen: 'deroulement-menu-agents.mp3',
  menuClose: 'some-links+fermeture-menu-agents.mp3',
  botOpen: 'open+notif-tv1e.mp3',
  botClose: 'fermeture-tv1e+faq.mp3',
  scroll: 'scroll-animations1&2.mp3',
  launch: 'newpage-launch.mp3',
  // Un swoosh par tour (11/09) : le seul son qui reste au niveau des cards
  // du marketplace, un par pas de scroll entre deux cards.
  swooshTower1: 'swoosh-tour1.mp3',
  swooshTower2: 'swoosh-tour2.mp3',
  swooshTower3: 'swoosh-tour3.mp3',
} as const;
export type Sfx = keyof typeof FILES;

// Niveaux : les blips de survol restent des blips ; les sons "scroll"/"swoosh"
// uniques ou rythmiques sont plus presents, ce sont des evenements rares.
const GAIN: Record<Sfx, number> = {
  nav: 0.32, footer: 0.28, forfait: 0.34, link: 0.16, catalogue: 0.16,
  menuOpen: 0.4, menuClose: 0.28, botOpen: 0.45, botClose: 0.32, scroll: 0.4, launch: 0.38,
  swooshTower1: 0.3, swooshTower2: 0.3, swooshTower3: 0.3,
};
const MAX_SEC: Partial<Record<Sfx, number>> = { botClose: 2.2, footer: 1.6, launch: 3 };

const STORAGE = 'tve-sound';

class Engine {
  ctx: AudioContext;
  master: GainNode;
  private buffers = new Map<Sfx, AudioBuffer>();
  private pending = new Map<Sfx, Promise<AudioBuffer | null>>();
  private loops = new Map<Sfx, { src: AudioBufferSourceNode; g: GainNode }>();

  constructor() {
    // webkitAudioContext : Safari iOS < 14.5 n'a pas AudioContext non prefixe.
    const AC: typeof AudioContext =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
  }

  /**
   * Deblocage iOS/Android : resume() seul ne suffit pas — il faut DEMARRER un
   * buffer (meme silencieux) DANS le geste utilisateur pour vraiment debloquer
   * l'audio. Appele par arm() au premier touch/clic. (14/09/2026, son muet sur
   * mobile.)
   */
  unlock() {
    try {
      void this.ctx.resume();
      const b = this.ctx.createBuffer(1, 1, 22050);
      const s = this.ctx.createBufferSource();
      s.buffer = b;
      s.connect(this.ctx.destination);
      s.start(0);
    } catch {
      /* ignore */
    }
  }

  load(k: Sfx): Promise<AudioBuffer | null> {
    const hit = this.buffers.get(k);
    if (hit) return Promise.resolve(hit);
    const inflight = this.pending.get(k);
    if (inflight) return inflight;
    const p = fetch(encodeURI(DIR + FILES[k]))
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((ab) => this.ctx.decodeAudioData(ab))
      .then((b) => {
        this.buffers.set(k, b);
        return b;
      })
      .catch(() => null); // fichier absent ou illisible : silence, jamais d'erreur visible
    this.pending.set(k, p);
    return p;
  }

  preload(keys: Sfx[]) {
    keys.forEach((k) => void this.load(k));
  }

  play(k: Sfx, rate = 1, gain = 1) {
    const b = this.buffers.get(k);
    if (!b) {
      void this.load(k).then((ok) => ok && this.play(k, rate, gain));
      return;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = b;
    src.playbackRate.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = GAIN[k] * gain;
    src.connect(g).connect(this.master);
    const now = this.ctx.currentTime;
    src.start(now);
    const max = MAX_SEC[k];
    if (max && b.duration > max) {
      g.gain.setTargetAtTime(0, now + max, 0.22);
      src.stop(now + max + 1.2);
    }
  }

  loopStart(k: Sfx) {
    if (this.loops.has(k)) return;
    const b = this.buffers.get(k);
    if (!b) {
      void this.load(k).then((ok) => ok && this.loopStart(k));
      return;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = b;
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    src.connect(g).connect(this.master);
    src.start();
    g.gain.setTargetAtTime(GAIN[k], this.ctx.currentTime, 0.12);
    this.loops.set(k, { src, g });
  }

  loopStop(k: Sfx) {
    const l = this.loops.get(k);
    if (!l) return;
    this.loops.delete(k);
    const now = this.ctx.currentTime;
    l.g.gain.setTargetAtTime(0, now, 0.18);
    l.src.stop(now + 0.9);
  }

  setMuted(m: boolean) {
    this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.05);
  }
}

let engine: Engine | null = null;
let armed = false;
let muted = false;
const listeners = new Set<() => void>();

function readPref(): boolean {
  try {
    return localStorage.getItem(STORAGE) === 'off';
  } catch {
    return false;
  }
}
function writePref(off: boolean) {
  try {
    localStorage.setItem(STORAGE, off ? 'off' : 'on');
  } catch {
    /* ignore */
  }
}

function notify() {
  listeners.forEach((l) => l());
}

/** S'abonner aux changements d'etat (armed / muted) — pour le bouton SON. */
export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function isArmed(): boolean {
  return armed;
}
export function isMuted(): boolean {
  return muted;
}

function arm() {
  if (armed) return;
  try {
    muted = readPref();
    engine = new Engine();
    engine.unlock(); // resume + buffer silencieux dans le geste (deblocage mobile)
    engine.setMuted(muted);
    engine.preload(Object.keys(FILES) as Sfx[]);
    armed = true;
    notify();
  } catch {
    /* Web Audio absent : pas de son, pas d'erreur */
  }
}

/**
 * A appeler UNE FOIS, tot, cote client (layout racine) : pose l'ecouteur de
 * premier geste sur toute page, y compris la home. Idempotent.
 */
export function armGlobally() {
  if (typeof window === 'undefined' || (window as unknown as { __sfxArmerInstalled?: boolean }).__sfxArmerInstalled) return;
  (window as unknown as { __sfxArmerInstalled?: boolean }).__sfxArmerInstalled = true;
  const opts = { capture: true, passive: true } as AddEventListenerOptions;
  const onGesture = () => {
    arm();
    if (armed) {
      window.removeEventListener('pointerdown', onGesture, opts);
      window.removeEventListener('keydown', onGesture, opts);
      window.removeEventListener('touchend', onGesture, opts);
    }
  };
  window.addEventListener('pointerdown', onGesture, opts);
  window.addEventListener('keydown', onGesture, opts);
  window.addEventListener('touchend', onGesture, opts);
}

export function setMuted(m: boolean) {
  muted = m;
  writePref(m);
  engine?.setMuted(m);
  notify();
}

export function play(k: Sfx, rate = 1, gain = 1) {
  if (!armed || muted) return;
  engine?.play(k, rate, gain);
}
export function loopStart(k: Sfx) {
  if (!armed || muted) return;
  engine?.loopStart(k);
}
export function loopStop(k: Sfx) {
  engine?.loopStop(k);
}

export { FILES };
