import type { Metadata } from 'next';
import LegalPage, { LegalH2, LegalP } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description:
    "CGU de tuveuxun.expert : règles d'accès et d'utilisation du site vitrine et de son assistant IA d'aide à l'intégration d'agents pour PME et associations.",
  alternates: { canonical: '/cgu' },
};

export default function CguPage() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      updated="22 septembre 2026"
      intro="Les présentes conditions encadrent l'accès et l'utilisation du site tuveuxun.expert et de son assistant en ligne."
    >
      <div>
        <LegalH2>1. Objet et acceptation</LegalH2>
        <LegalP>
          Le site tuveuxun.expert présente les prestations d'intégration d'agents IA et de développement
          de l'éditeur. En naviguant sur le site, l'utilisateur accepte les présentes conditions ainsi
          que la <a href="/confidentialite" className="text-accent hover:text-aqua">politique de confidentialité</a>.
        </LegalP>
      </div>

      <div>
        <LegalH2>2. Accès au service</LegalH2>
        <LegalP>
          Le site est accessible gratuitement. L'éditeur s'efforce d'en assurer la disponibilité mais peut
          l'interrompre pour maintenance ou pour toute raison technique, sans que sa responsabilité puisse
          être engagée.
        </LegalP>
      </div>

      <div>
        <LegalH2>3. Assistant en ligne (agent Tv1E)</LegalH2>
        <LegalP>
          Le site propose un assistant et une FAQ destinés à renseigner sur les prestations, tarifs et
          délais. Ses réponses sont fournies à titre indicatif et n'ont pas de valeur contractuelle : seul
          un devis signé engage l'éditeur. L'utilisateur s'abstient de tout usage détourné, abusif ou
          automatisé de l'assistant.
        </LegalP>
      </div>

      <div>
        <LegalH2>4. Propriété intellectuelle</LegalH2>
        <LegalP>
          Les contenus du site sont protégés. Toute reproduction non autorisée est interdite (voir les
          {' '}<a href="/mentions-legales" className="text-accent hover:text-aqua">mentions légales</a>).
          Les outils publiés en open source demeurent régis par leur licence propre.
        </LegalP>
      </div>

      <div>
        <LegalH2>5. Liens externes</LegalH2>
        <LegalP>
          Le site peut contenir des liens vers des ressources tierces (dépôts de code, sites partenaires).
          L'éditeur n'exerce aucun contrôle sur ces ressources et décline toute responsabilité quant à
          leur contenu.
        </LegalP>
      </div>

      <div>
        <LegalH2>6. Modification des conditions</LegalH2>
        <LegalP>
          L'éditeur peut faire évoluer les présentes conditions à tout moment. La version applicable est
          celle publiée sur le site au moment de la consultation.
        </LegalP>
      </div>
    </LegalPage>
  );
}
