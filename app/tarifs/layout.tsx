import type { Metadata } from 'next';

// page.tsx est un client component ('use client') qui ne peut pas exporter de
// metadata -> ce layout serveur imbrique porte le titre/description de la page.
export const metadata: Metadata = {
  title: 'Tarifs — forfaits IA fermes (690€ / 1900€ / 2700€)',
  description:
    'Diagnostic IA 690€ (1 jour) · Agent métier 1900€ (3 jours, 30j de support) · Agent souverain sur mesure + LLM local 2700€ (5 jours, 60j de support). Sans abonnement : mise à jour 120€ tous les 4 mois. Devis ferme sous 48h.',
};

export default function TarifsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
