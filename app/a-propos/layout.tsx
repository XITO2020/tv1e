import type { Metadata } from 'next';

// page.tsx est un client component -> metadata portee par ce layout serveur.
export const metadata: Metadata = {
  title: "À propos — l'équipe et le parcours",
  description:
    "Naïm, consultant IA indépendant, fondateur de QISHIM-CORTEX. 18 ans de tech, 160 apprenants formés, et l'équipe tuveuxun.expert.",
};

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  return children;
}
