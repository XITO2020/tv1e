import type { Metadata } from 'next';
import { Saira, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// Deux entrees cote a cote en bas a droite : l'agent Tv1E (modele local, lent
// sur le VPS economique — la latence est annoncee, pas subie) et son clone FAQ,
// 100 % ecrit, instantane. Les questions courantes n'allument jamais le modele :
// le backend les sert depuis backend/faq-kb.json.
import Chatbot from '@/components/Chatbot';
import FaqPanel from '@/components/FaqPanel';
// Couche son des pages secondaires (public/bgm/) : survols, ouvertures.
// La home a son propre son unique, pose directement dans AgentWorld.tsx.
// Armee au premier geste (n'importe ou, y compris sur la home) — regle des
// navigateurs, expliquee dans lib/sfx.ts. Le bouton SON ne s'affiche pas
// sur la home, qui reste nue.
import SoundLayer from '@/components/SoundLayer';
import SfxArmer from '@/components/SfxArmer';

const saira = Saira({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-saira',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-mono-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'tuveuxun.expert — Consultant IA pour PME, mairies & associations',
    template: '%s — tuveuxun.expert', // chaque page a enfin son propre titre
  },
  description: "Installateur d'agents IA et de sites pour PME, entreprises, mairies et associations : agents métier, automatisation, LLM souverain RGPD, formation. Forfaits fermes, devis 48 h.",
  keywords: [
    'installateur agents IA', 'agent IA PME', 'automatisation métier', 'LLM souverain',
    'chatbot RGPD', 'consultant IA associations', 'agent IA mairie', 'IA on-premise',
    "intégration Claude Ollama Mistral", 'développement site PME',
  ],
  robots: { index: true, follow: true },
  metadataBase: new URL('https://tuveuxun.expert'),
  openGraph: {
    title: "tuveuxun.expert — Installateur d'agents IA pour PME & associations",
    description: "Intégration d'agents IA, automatisation métier et LLM souverain on-premise pour structures non-techniques.",
    type: 'website',
    locale: 'fr_FR',
    url: 'https://tuveuxun.expert',
    siteName: 'tuveuxun.expert',
  },
  twitter: {
    card: 'summary',
    title: 'tuveuxun.expert — Consultant IA',
    description: "Agents IA, automatisation métier, LLM souverain pour PME, mairies et associations.",
  },
};

// AEO/SEO : entité ProfessionalService + offres chiffrées + FAQPage (JSON-LD
// citable par les moteurs de réponse IA et les moteurs de recherche). Objectif :
// être identifié comme installateur d'agents IA et de sites pour PME, entreprises
// et associations. Enrichi le 22/09/2026.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['ProfessionalService', 'Organization'],
      '@id': 'https://tuveuxun.expert/#org',
      name: 'tuveuxun.expert',
      alternateName: 'tuveuxun expert',
      slogan: "L'IA calibrée pour produire.",
      url: 'https://tuveuxun.expert',
      email: 'tabascocity@proton.me',
      priceRange: '€€',
      description:
        "Installateur d'agents IA et de sites/plateformes pour PME, entreprises, mairies, collectivités et associations. Intégration d'agents métier (Claude, Ollama, Mistral), automatisation, LLM souverain on-premise conforme RGPD, formation. Forfaits fermes, sans abonnement.",
      serviceType: [
        "Intégration d'agents IA",
        'Automatisation métier',
        'LLM souverain on-premise',
        'Développement de sites et plateformes web',
        'Chatbot RGPD',
        'Formation IA',
      ],
      knowsAbout: [
        'agents IA', 'agent souverain', 'automatisation métier', 'Claude', 'Ollama', 'Qwen3',
        'Mistral', 'OpenClaw', 'Hermes', 'MCP', 'RGPD', 'LLM local', 'chatbot', 'prospection',
        'Next.js', 'FastAPI',
      ],
      areaServed: { '@type': 'Country', name: 'France' },
      audience: {
        '@type': 'BusinessAudience',
        name: 'PME, TPE, entreprises, mairies, collectivités et associations',
      },
      sameAs: ['https://github.com/XITO2020', 'https://github.com/tabascocity'],
      makesOffer: [
        { '@type': 'Offer', name: 'Diagnostic IA', price: '690', priceCurrency: 'EUR', description: "Diagnostic IA en 1 jour avec démo d'un agent souverain sur vos données" },
        { '@type': 'Offer', name: 'Agent métier', price: '1900', priceCurrency: 'EUR', description: 'Agent IA métier déployé en 3 jours, 30 jours de support' },
        { '@type': 'Offer', name: 'Agent souverain sur mesure', price: '2700', priceCurrency: 'EUR', description: 'Agent souverain (OpenClaw, Hermes ou LLM local) on-premise en 5 jours, données sur site, RGPD' },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://tuveuxun.expert/#website',
      name: 'tuveuxun.expert',
      url: 'https://tuveuxun.expert',
      publisher: { '@id': 'https://tuveuxun.expert/#org' },
      inLanguage: 'fr',
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://tuveuxun.expert/#faq',
      mainEntity: [
        { '@type': 'Question', name: "Que fait tuveuxun.expert ?", acceptedAnswer: { '@type': 'Answer', text: "tuveuxun.expert installe des agents IA et des sites/plateformes pour les PME, entreprises, mairies, collectivités et associations : agents métier, automatisation, LLM souverain on-premise conforme RGPD, chatbots et formation." } },
        { '@type': 'Question', name: "Pour qui travaillez-vous ?", acceptedAnswer: { '@type': 'Answer', text: "Pour les PME, TPE, mairies, collectivités et associations qui veulent que l'IA produise vite, sans équipe technique interne." } },
        { '@type': 'Question', name: "Combien coûte une première mission ?", acceptedAnswer: { '@type': 'Answer', text: "Trois forfaits fermes en HT : Diagnostic IA 690 € (1 jour), Agent métier 1 900 € (3 jours), Agent souverain sur mesure 2 700 € (5 jours). Le prix annoncé est le prix facturé, sans abonnement." } },
        { '@type': 'Question', name: "Proposez-vous une IA souveraine sans cloud ?", acceptedAnswer: { '@type': 'Answer', text: "Oui. L'agent souverain tourne sur votre serveur (OpenClaw, Hermes ou un LLM local avec Ollama et Qwen3/Mistral) : vos données ne quittent jamais votre infrastructure. Configuration prévue pour mairies, cabinets juridiques et secteur médical." } },
        { '@type': 'Question', name: "Y a-t-il un abonnement ?", acceptedAnswer: { '@type': 'Answer', text: "Jamais. Vous payez une prestation, elle vous appartient. Une mise à jour est proposée tous les 4 mois à 120 €, facultative : la refuser ne dégrade rien." } },
        { '@type': 'Question', name: "Quels sont les délais de livraison ?", acceptedAnswer: { '@type': 'Answer', text: "Diagnostic IA 1 jour, agent métier 3 jours, agent souverain sur mesure 5 jours. Rendez-vous de découverte et devis ferme sous 48 h." } },
        { '@type': 'Question', name: "Installez-vous des agents IA sur mesure pour une entreprise ?", acceptedAnswer: { '@type': 'Answer', text: "Oui : intégration d'agents IA métier (traitement de documents, réponses e-mail, génération de rapports, prospection) branchés sur vos outils existants, avec un ROI mesurable en 30 jours." } },
        { '@type': 'Question', name: "Formez-vous les équipes à l'IA ?", acceptedAnswer: { '@type': 'Answer', text: "Oui : bootcamp d'une journée jusqu'à 12 personnes (1 200 €/jour), atelier dirigeants (900 €) et coaching mensuel. 160 apprenants formés en deux ans." } },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${saira.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@200;300;400;500;600;700&family=Geist+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <div className="grain" aria-hidden />
        <Header />
        <main>{children}</main>
        <Footer />
        <Chatbot />
        <FaqPanel />
        <SoundLayer />
        <SfxArmer />
      </body>
    </html>
  );
}
