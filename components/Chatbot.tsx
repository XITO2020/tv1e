'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'bot'; text: string };

// Backend FastAPI + Ollama Qwen2.5 3B (backend/main.py, port 8001).
// En prod : NEXT_PUBLIC_BOT_URL=https://api.tuveuxun.expert (var Vercel, inline au build).
const BOT_URL = process.env.NEXT_PUBLIC_BOT_URL || 'http://127.0.0.1:8001';

type BotStatus = 'checking' | 'online' | 'offline';

const SUGGESTED = [
  'Quels sont vos tarifs ?',
  'Combien de temps pour un agent ?',
  'Avec qui vais-je travailler ?',
  'Pourquoi je ne peux pas parler de tout avec ce bot ?',
  "C'est quoi un agent souverain ?",
  'Vous travaillez avec les mairies ?',
  'Puis-je former mon equipe ?',
  'Quelle stack vous maitrisez ?',
  'Vous publiez des skills sur GitHub ?',
  'Comment vous contacter ?',
];

const INITIAL_MSG: Message = {
  role: 'bot',
  text: "Bonjour. Je suis l'agent Tv1E, assistant de Naïm. Je réponds sur : prestations, tarifs, process, délais, données souveraines. Pour le reste, contactez Naïm directement.",
};

/* ============================================================
   GUIDE FAQ HORS-LIGNE — repli quand le backend Qwen est injoignable.
   Pattern matching sur mots-cles, contenu factuel (tarifs/delais reels).
   N'est JAMAIS presente comme un LLM : le badge d'etat affiche
   "hors ligne · mode FAQ" quand ces reponses sont utilisees.
   ============================================================ */
function offlineGuideResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.match(/\b(tarif|prix|cout|combien|cher|euros?|€)\b/)) {
    return "3 forfaits fermes : DIAGNOSTIC IA 690€ (1j), AGENT MÉTIER 1900€ (3j), AGENT SOUVERAIN SUR MESURE 2700€ (5j). Jamais d'abonnement : mise à jour proposée tous les 4 mois à 120€. Plus modules à la carte. Devis ferme sous 48h après RDV. Voir /tarifs pour le détail.";
  }
  if (q.match(/\bforfait\b/)) {
    return "3 forfaits + sur-mesure (TJM 900-1200€). Le best : Agent métier 1900€, agent déployé en 3 jours avec 1 skill pack et 30j de support inclus.";
  }
  if (q.match(/\b(delai|duree|temps|combien.*temps|quand|rapidite)\b/)) {
    return "Diagnostic IA : 1 jour · Agent métier : 3 jours · Agent souverain sur mesure : 5 jours. RDV découverte sous 48h. Devis sous 48h après cadrage.";
  }
  if (q.match(/\b(contact|rdv|rendez.?vous|joindre|reserver|appeler)\b/)) {
    return "RDV découverte 30 minutes gratuit. Passez par le formulaire de la page /tarifs. Vous pouvez aussi cliquer 'Écrire un mail' en bas de page tarifs.";
  }
  if (q.match(/\b(mairie|collectivite|administration|public|prefecture)\b/)) {
    return "Pour les mairies/collectivités : forfait AGENT SOUVERAIN SUR MESURE (2700€, 5 jours) avec LLM local on-premise (Qwen3, Mistral) via la voie adaptée (OpenClaw, Hermes ou Ollama), sans rien envoyer dehors. Données ne sortent pas du serveur, RGPD blindé.";
  }
  if (q.match(/\b(llm.*local|souverain|on.?premise|rgpd|donnees? sensibles?)\b/)) {
    return "Stack souveraine multi-voies : OpenClaw, Hermes ou Ollama + Qwen3 / Mistral, déployée sur votre serveur selon votre machine. Mémoire locale, aucune donnée envoyée dans le cloud. Idéal pour mairies, cabinets juridiques/santé, structures avec data sensibles.";
  }
  if (q.match(/\b(agent|automatisation|claude|gpt)\b/)) {
    return "Agents Claude + Python en production réelle (cron, monitoring). Cas d'usage : réponses mails auto, traitement documents, génération rapports, chatbots métier. ROI mesurable en 30 jours.";
  }
  if (q.match(/\b(stack|techno|techniques?|outils?|languages?)\b/)) {
    return "IA : OpenClaw, Hermes, Claude API, Ollama, Qwen3, Mistral, MCP, ComfyUI · Front : React/Next/Three.js · Back : Python/FastAPI/Django, Node/Express · Infra : Docker, AWS, on-premise.";
  }
  // Equipe — placer AVANT "formation" pour ne pas etre shadow par "equipe" du pattern formation
  if (q.match(/\b(avec qui|equipe|membre|collaborateur|Naïm|manon|eddy|alex|june|orland|opal|qishim)\b/)) {
    return "L'équipe tuveuxun.expert : Naïm (intervenant principal — architecte agentique, dev de ce site, fondateur QISHIM-CORTEX) · Eddy (manager organisationnel) · Manon (lead full-stack, solutions financements) · Alex (dev SaaS) · June (cybersécurité Kali Linux) · Orland Opal (auteur, mentor de Naïm depuis 2010) + QISHIM-CORTEX (12 cortex IA, 60 agents) en support. Vous pouvez demander une mission avec un spécialiste précis. Détail /a-propos.";
  }
  // Perimetre du bot — pourquoi je ne reponds pas a tout
  if (q.match(/\b(pourquoi.*pas.*tout|pas.*de.*tout|tout.*sujet|cadre.*bot|limite.*bot|hors sujet|peut pas parler|periph?metre)\b/)) {
    return "Je suis l'agent Tv1E, calibré uniquement sur les prestations, tarifs, processus et équipe de Naïm. C'est volontaire : un chatbot bien borné répond mieux et ne raconte pas n'importe quoi (zéro hallucination sur prix/délais). Pour toute autre question (philo IA, débat technique général, hors sujet métier), passez par le formulaire de la page /tarifs.";
  }
  // GitHub skills publics
  if (q.match(/\b(github|skills?.*(public|gratuit|libre)|telecharger|repo|open.?source)\b/)) {
    return "À partir de 22 skills custom Claude Code de Naïm publiés gratuitement sur GitHub (license MIT), suppléments sur devis. Vous pouvez les forker, les utiliser, contribuer. Le modèle éco est sur l'expertise humaine (consulting, formation, intégration), pas sur la vente de fichiers. Voir /skills pour le catalogue + lien GitHub.";
  }
  if (q.match(/\b(formation|former|apprendre|enseigne|cours|bootcamp)\b/)) {
    return "Formation IA équipe : 1 jour, jusqu'à 12 personnes, programme custom hands-on. 1200€/jour. 160 apprenants déjà formés en 2 ans (bootcamp Insersite). Voir /tarifs#formation.";
  }
  if (q.match(/\b(naim|qui.*es.*tu|qui.*est|profil|parcours|experience)\b/)) {
    return "Naïm, consultant IA independant depuis 2023. Fondateur de QISHIM-CORTEX. 18 ans tech, double profil tech & creatif (20 ans Photoshop). 160 apprenants formes. Voir /a-propos pour le detail.";
  }
  if (q.match(/\b(bonjour|salut|hello|hey|coucou)\b/)) {
    return "Bonjour ! Comment puis-je vous aider ? Tarifs, delais, prestations, RDV ?";
  }
  if (q.match(/\b(merci|thanks)\b/)) {
    return "Avec plaisir. Pour aller plus loin, je recommande un RDV decouverte gratuit 30 minutes via la page /tarifs.";
  }

  return "Je ne peux repondre que sur les prestations, tarifs, delais et process de Naïm. Pour le reste, Passez par le formulaire de la page /tarifs.";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [status, setStatus] = useState<BotStatus>('checking');
  // Modele reellement charge cote backend (remonte par /health) — jamais de nom en dur.
  const [model, setModel] = useState<string>('');
  // Capture de lead (qualification) : mini-formulaire inline -> POST /lead.
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendLead = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leadEmail)) return;
    const lastQuestions = messages
      .filter((m) => m.role === 'user')
      .slice(-3)
      .map((m) => m.text)
      .join(' | ');
    try {
      await fetch(`${BOT_URL}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: leadEmail, message: lastQuestions.slice(0, 2000), source: 'chatbot' }),
      });
      setLeadSent(true);
      setLeadOpen(false);
    } catch {
      // Backend injoignable : on renvoie vers le formulaire de la page tarifs.
      // Avant le 02/09 on ouvrait un mailto contenant l'adresse en dur, donc
      // exposee dans le bundle JS livre au navigateur.
      window.location.href = '/tarifs#rdv';
    }
  };

  // Ping le backend Qwen a l'ouverture -> badge d'etat HONNETE (fini le faux "online").
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    fetch(`${BOT_URL}/health`, { signal: controller.signal })
      .then(async (r) => {
        if (cancelled) return;
        if (!r.ok) { setStatus('offline'); return; }
        setStatus('online');
        try {
          const d = (await r.json()) as { model?: string };
          if (d?.model) setModel(d.model);
        } catch { /* health sans corps JSON : on garde le badge generique */ }
      })
      .catch(() => { if (!cancelled) setStatus('offline'); })
      .finally(() => clearTimeout(timer));
    return () => { cancelled = true; controller.abort(); };
  }, [open]);

  // Auto-scroll bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 120_000); // Qwen 3B sur CPU = patient
      // Historique court (6 derniers messages, message d'accueil exclu) pour
      // que le bot garde le fil — le backend le borne aussi cote serveur.
      const history = messages
        .filter((m) => m !== INITIAL_MSG)
        .slice(-6)
        .map((m) => ({
          role: m.role === 'bot' ? 'assistant' : 'user',
          content: m.text.slice(0, 800),
        }));
      const res = await fetch(`${BOT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text.slice(0, 500), history }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.status === 429) {
        setMessages((m) => [...m, { role: 'bot', text: "Beaucoup de questions d'un coup ! Patientez une petite minute et reposez-la." }]);
        return;
      }
      if (!res.ok) throw new Error(`bot_${res.status}`);
      const data = (await res.json()) as { answer?: string };
      if (!data.answer) throw new Error('bot_empty');
      setStatus('online');
      setMessages((m) => [...m, { role: 'bot', text: data.answer as string }]);
    } catch {
      // Backend injoignable -> reponse du guide FAQ local, badge passe en hors-ligne.
      setStatus('offline');
      setMessages((m) => [...m, { role: 'bot', text: offlineGuideResponse(text) }]);
    } finally {
      setTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* FAB — Floating Action Button bottom-right */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Fermer le chat' : 'Ouvrir le chat'}
        className="fixed bottom-6 right-6 z-[150] flex items-center gap-3 bg-accent hover:bg-aqua text-obsidian font-monodisp text-[11px] uppercase tracking-[0.22em] font-bold px-5 py-4 transition-all clip-civ-sm shadow-[0_8px_24px_rgba(90,212,182,0.4)]"
        style={{ display: open ? 'none' : 'inline-flex' }}
      >
        <span className="relative flex w-2 h-2">
          <span className="absolute inset-0 bg-obsidian animate-ping opacity-50" />
          <span className="relative inline-flex h-2 w-2 bg-obsidian" />
        </span>
        Agent Tv1E
        <span className="font-monodisp">→</span>
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[150] w-[calc(100%-32px)] sm:w-[400px] h-[600px] max-h-[calc(100vh-48px)] flex flex-col bg-obsidian border border-accent/40 clip-civ-md shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          {/* Corner brackets */}
          <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent" />
          <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t border-r border-accent" />
          <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-accent" />
          <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent" />

          {/* Header */}
          <header className="flex items-center justify-between border-b border-accent/20 px-4 py-3 bg-carbon/50 backdrop-blur">
            <div className="flex items-center gap-2.5">
              <span className="relative flex w-2 h-2">
                {status === 'online' && <span className="absolute inset-0 bg-accent animate-ping opacity-50" />}
                <span className={`relative inline-flex h-2 w-2 ${status === 'online' ? 'bg-accent' : status === 'offline' ? 'bg-red-400' : 'bg-aqua/40'}`} />
              </span>
              <div>
                <div className="font-monodisp text-[11px] tracking-[0.22em] uppercase text-aqua font-bold">
                  Agent Tv1E
                </div>
                <div className="font-monodisp text-[9px] tracking-[0.2em] uppercase text-accent/70">
                  {status === 'online' && `online · ${model ? model.split(':')[0] : 'llm'} · 100% local`}
                  {status === 'offline' && 'hors ligne · mode FAQ'}
                  {status === 'checking' && 'connexion au moteur…'}
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

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] bg-accent text-obsidian font-monodisp text-[12px] leading-relaxed px-3.5 py-2.5 clip-civ-sm font-medium'
                      : 'max-w-[85%] bg-carbon border border-accent/15 text-aqua font-monodisp text-[12px] leading-relaxed px-3.5 py-2.5 clip-civ-sm font-light'
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex flex-col items-start gap-1.5">
                <div className="bg-carbon border border-accent/15 text-aqua font-monodisp text-xs px-3.5 py-3 clip-civ-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                {/* La latence s'annonce, elle ne se subit pas : le visiteur qui
                    sait pourquoi il attend attend ; celui qui ne sait pas part. */}
                <p className="font-monodisp text-[9px] leading-relaxed text-accent/50 max-w-[85%]">
                  Modele local sur serveur economique — une reponse inedite demande une trentaine de secondes. Les questions courantes, elles, sont immediates.
                </p>
              </div>
            )}

            {/* Suggested questions — visible quand seul le message initial est present */}
            {messages.length === 1 && !typing && (
              <div className="pt-3">
                <div className="font-monodisp text-[9px] tracking-[0.25em] uppercase text-accent/60 mb-2">
                  Questions frequentes
                </div>
                <div className="flex flex-col gap-2">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="text-left bg-carbon border border-accent/20 hover:border-accent hover:bg-accent/5 text-aqua/85 hover:text-accent font-monodisp text-[11px] px-3 py-2 transition-colors clip-civ-sm"
                    >
                      → {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Capture de lead — proposee apres au moins 2 questions posees */}
          {!leadSent && messages.filter((m) => m.role === 'user').length >= 2 && (
            <div className="border-t border-accent/10 px-3 py-2 bg-carbon/30">
              {!leadOpen ? (
                <button
                  type="button"
                  onClick={() => setLeadOpen(true)}
                  className="w-full text-left font-monodisp text-[10px] tracking-[0.2em] uppercase text-accent/70 hover:text-accent transition-colors"
                >
                  → Être recontacté par Naïm(laisser mon email)
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="votre@email.fr"
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
          )}
          {leadSent && (
            <div className="border-t border-accent/10 px-3 py-2 bg-carbon/30 font-monodisp text-[10px] tracking-[0.15em] uppercase text-accent/70">
              ✓ Bien reçu — Naïmvous recontacte sous 48h.
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-accent/20 px-3 py-3 flex items-center gap-2 bg-carbon/40"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 bg-carbon border border-accent/20 text-aqua placeholder-aqua/40 px-3 py-2.5 font-monodisp text-[12px] focus:border-accent focus:outline-none clip-civ-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="bg-accent hover:bg-aqua disabled:opacity-30 disabled:cursor-not-allowed text-obsidian font-monodisp text-xs uppercase tracking-wider font-bold px-4 py-2.5 transition-colors clip-civ-sm"
            >
              →
            </button>
          </form>

          {/* Footer mini — honnete : c'est exactement la stack qu'on vend (souverainete) */}
          <div className="px-4 py-1.5 border-t border-accent/10 bg-carbon/60 font-monodisp text-[8px] tracking-[0.2em] uppercase text-accent/40 text-center">
            {model ? model.replace(/-instruct.*$/i, '').replace(':', ' ') : 'LLM'} via Ollama · 100% local · aucune donnée envoyée au cloud
          </div>
        </div>
      )}
    </>
  );
}
