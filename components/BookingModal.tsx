'use client';

/**
 * BookingModal — formulaire interne pour "Reserver un creneau" (RDV) et
 * "Reserver une journee de formation", a la place des mailto qui ouvraient
 * le client mail externe (11/09, retour Naim : "il manque ces formulaires").
 *
 * Meme design que le modal "Ecrire un mail" deja present sur cette page
 * (memes chanfreins, memes couleurs surf/aqua/obsidian, memes coins) — pas
 * un nouveau style, la continuite EST le point. Les sons passent par
 * SoundLayer (routage generique deja actif partout), pas de cablage special.
 *
 * Soumission : POST /lead, le meme endpoint deja utilise par le chat et la
 * FAQ (backend/main.py) — les reponses structurees sont mises en forme dans
 * le champ `message`, aucun changement de schema backend necessaire. Si le
 * backend est injoignable, secours en mailto pre-rempli (meme filet que
 * "Ecrire un mail" juste au-dessus dans ce fichier), jamais un formulaire
 * qui echoue en silence.
 */

import { useState } from 'react';

const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL || 'http://127.0.0.1:8001';

export type BookingKind = 'rdv' | 'formation';

const STRUCTURES = ['Mairie / collectivité', 'PME / TPE', 'Association', 'Cabinet juridique ou santé', 'Autre'];
const FORMATS = [
  'Bootcamp équipe — 1 jour, jusqu\'à 12 pers. · 1 200 €',
  'Atelier dirigeants — demi-journée · 900 €',
  'Coaching mensuel — 1 jour/mois · 1 200 €/jour',
];

const COPY: Record<BookingKind, { eyebrow: string; title: string; subtitle: string; source: string; subject: string }> = {
  rdv: {
    eyebrow: 'rdv_decouverte · 30 minutes · gratuit',
    title: 'Réserver un créneau',
    subtitle: "Quelques questions pour arriver préparé à l'appel — Naïm vous recontacte sous 48h.",
    source: 'tarifs-rdv',
    subject: 'RDV découverte',
  },
  formation: {
    eyebrow: 'demande_formation',
    title: 'Réserver une journée de formation',
    subtitle: 'Le format et les dates se calent ensemble — Naïm revient vers vous sous 48h.',
    source: 'tarifs-formation',
    subject: 'Demande de formation IA équipe',
  },
};

type FormState = {
  nom: string;
  email: string;
  structure: string;
  besoin: string;
  disponibilites: string;
  effectif: string;
  format: string;
  dates: string;
};

const EMPTY: FormState = { nom: '', email: '', structure: '', besoin: '', disponibilites: '', effectif: '', format: '', dates: '' };

function buildMessage(kind: BookingKind, f: FormState): string {
  if (kind === 'rdv') {
    return [
      `Structure : ${f.structure || 'non precisee'}`,
      `Besoin : ${f.besoin}`,
      f.disponibilites && `Disponibilites : ${f.disponibilites}`,
    ]
      .filter(Boolean)
      .join('\n');
  }
  return [
    `Structure : ${f.structure}`,
    f.effectif && `Effectif a former : ${f.effectif}`,
    `Format souhaite : ${f.format || 'a discuter'}`,
    f.dates && `Dates envisagees : ${f.dates}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export default function BookingModal({ kind, open, onClose }: { kind: BookingKind; open: boolean; onClose: () => void }) {
  const [f, setF] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const c = COPY[kind];

  if (!open) return null;

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const close = () => {
    onClose();
    // Petite pause avant de reinitialiser : evite de voir le formulaire se
    // vider avant que le fondu de fermeture ne soit termine.
    window.setTimeout(() => {
      setF(EMPTY);
      setStatus('idle');
    }, 200);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const message = buildMessage(kind, f);
    try {
      const res = await fetch(`${BOT_URL}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: f.email, name: f.nom, message: message.slice(0, 2000), source: c.source }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
    } catch {
      // Backend injoignable : secours en mailto pre-rempli, meme filet que
      // "Ecrire un mail" — jamais de formulaire qui echoue en silence.
      const subject = encodeURIComponent(`${c.subject} — ${f.nom || 'sans nom'}`);
      const body = encodeURIComponent(`De : ${f.nom} <${f.email}>\n\n${message}\n\n--\nEnvoye depuis tuveuxun.expert`);
      window.location.href = `mailto:tabascocity@proton.me?subject=${subject}&body=${body}`;
      setStatus('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-obsidian/80 backdrop-blur-md p-4"
      onClick={close}
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
          onClick={close}
          aria-label="Fermer"
          data-sfx="footer"
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-surf hover:text-aqua font-monodisp text-sm"
        >
          ×
        </button>

        <div className="font-monodisp text-[10px] tracking-[0.3em] uppercase text-surf mb-4">{c.eyebrow}</div>
        <h3 className="font-display text-3xl text-aqua mb-3 uppercase tracking-tight">{c.title}</h3>

        {status === 'sent' ? (
          <div className="py-6">
            <p className="font-monodisp text-sm text-surf leading-relaxed">
              ✓ Bien reçu — Naïm vous recontacte sous 48h.
            </p>
            <button
              type="button"
              onClick={close}
              data-sfx="footer"
              className="mt-6 border border-surf/40 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-6 py-3 hover:bg-carbon transition-colors clip-civ-sm"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="font-monodisp text-[11px] text-aqua/60 leading-relaxed mb-2">{c.subtitle}</p>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text" required placeholder="Votre nom" value={f.nom} onChange={set('nom')}
                className="bg-carbon border border-surf/25 text-aqua placeholder-aqua/40 px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm"
              />
              <input
                type="email" required placeholder="Email" value={f.email} onChange={set('email')}
                className="bg-carbon border border-surf/25 text-aqua placeholder-aqua/40 px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm"
              />
            </div>

            {kind === 'rdv' ? (
              <>
                <select
                  required value={f.structure} onChange={set('structure')}
                  className="w-full bg-carbon border border-surf/25 text-aqua px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm"
                >
                  <option value="" disabled>Votre structure</option>
                  {STRUCTURES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <textarea
                  required rows={3} placeholder="Votre besoin en quelques mots" value={f.besoin} onChange={set('besoin')}
                  className="w-full bg-carbon border border-surf/25 text-aqua placeholder-aqua/40 px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm resize-none"
                />
                <input
                  type="text" placeholder="Disponibilites (ex : mardi ou jeudi apres-midi)" value={f.disponibilites} onChange={set('disponibilites')}
                  className="w-full bg-carbon border border-surf/25 text-aqua placeholder-aqua/40 px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm"
                />
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text" required placeholder="Structure / organisation" value={f.structure} onChange={set('structure')}
                    className="bg-carbon border border-surf/25 text-aqua placeholder-aqua/40 px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm"
                  />
                  <input
                    type="text" placeholder="Nombre de personnes" value={f.effectif} onChange={set('effectif')}
                    className="bg-carbon border border-surf/25 text-aqua placeholder-aqua/40 px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm"
                  />
                </div>
                <select
                  required value={f.format} onChange={set('format')}
                  className="w-full bg-carbon border border-surf/25 text-aqua px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm"
                >
                  <option value="" disabled>Format souhaite</option>
                  {FORMATS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="text" placeholder="Dates envisagees" value={f.dates} onChange={set('dates')}
                  className="w-full bg-carbon border border-surf/25 text-aqua placeholder-aqua/40 px-4 py-3 font-monodisp text-sm focus:border-surf focus:outline-none clip-civ-sm"
                />
              </>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button" onClick={close} data-sfx="footer"
                className="border border-surf/40 text-aqua font-monodisp text-[11px] uppercase tracking-[0.22em] px-6 py-3 hover:bg-carbon transition-colors clip-civ-sm"
              >
                Annuler
              </button>
              <button
                type="submit" disabled={status === 'sending'} data-sfx="footer"
                className="bg-surf text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold px-6 py-3 hover:bg-aqua disabled:opacity-50 transition-colors clip-civ-sm"
              >
                {status === 'sending' ? 'Envoi…' : 'Envoyer →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
