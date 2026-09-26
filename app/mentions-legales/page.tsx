import type { Metadata } from 'next';
import LegalPage, { LegalH2, LegalP } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    "Mentions légales de tuveuxun.expert : éditeur, hébergeur et informations légales du service d'intégration d'agents IA pour PME, entreprises et associations.",
  alternates: { canonical: '/mentions-legales' },
};

// ⚠️ Données à confirmer/compléter par Naim avant redéploiement. Les valeurs
// laissées « [À COMPLÉTER] » ne doivent pas être inventées.
export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      updated="22 septembre 2026"
      intro="Informations légales relatives au site tuveuxun.expert et à son éditeur, conformément à la loi n°2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN)."
    >
      <div>
        <LegalH2>Éditeur du site</LegalH2>
        <LegalP>
          Le site tuveuxun.expert est édité par la société <strong>TabascoCity</strong>, société par
          actions simplifiée unipersonnelle (SASU) au capital de 100 €, immatriculée au
          Registre du Commerce et des Sociétés de Versailles sous le numéro <strong>RCS B 980 463 798</strong>
          (SIREN 980 463 798).
        </LegalP>
        <LegalP>Siège social : 28 rue Saint-Dominique, Maison de la Chimie, 75007 Paris, France.</LegalP>
        <LegalP>Numéro de TVA intracommunautaire : FR72980463798.</LegalP>
        <LegalP>Contact : tabascocity@proton.me</LegalP>
      </div>

      <div>
        <LegalH2>Directeur de la publication</LegalH2>
        <LegalP>Naïm Mouloud, en qualité de président de la SASU Tabasco City.</LegalP>
      </div>

      <div>
        <LegalH2>Hébergement</LegalH2>
        <LegalP>
          Le site est hébergé sur un serveur privé virtuel fourni par <strong>Hostinger International Ltd</strong>,
          61 Lordou Vironos Street, 6023 Larnaca, Chypre. Le service backend
          (API du chatbot, capture de contacts) tourne sur la même infrastructure.
        </LegalP>
      </div>

      <div>
        <LegalH2>Propriété intellectuelle</LegalH2>
        <LegalP>
          L'ensemble des contenus du site (textes, visuels, code, illustrations, éléments graphiques et
          interactifs) est la propriété de l'éditeur ou de ses partenaires, sauf mention contraire. Toute
          reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable est
          interdite. Les outils et « skills » publiés en open source le sont sous leur licence propre
          (notamment MIT), consultable sur le dépôt GitHub associé.
        </LegalP>
      </div>

      <div>
        <LegalH2>Données personnelles</LegalH2>
        <LegalP>
          Le traitement des données collectées via le site (formulaires de contact, demande de devis,
          prise de rendez-vous) est décrit dans la <a href="/confidentialite" className="text-accent hover:text-aqua">politique de confidentialité</a>.
        </LegalP>
      </div>

      <div>
        <LegalH2>Responsabilité</LegalH2>
        <LegalP>
          L'éditeur s'efforce d'assurer l'exactitude des informations diffusées sur le site mais ne saurait
          être tenu responsable des erreurs, omissions ou d'une indisponibilité temporaire du service. Les
          liens vers des sites tiers n'engagent pas la responsabilité de l'éditeur quant à leur contenu.
        </LegalP>
      </div>
    </LegalPage>
  );
}
