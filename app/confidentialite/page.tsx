import type { Metadata } from 'next';
import LegalPage, { LegalH2, LegalP } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    "Politique de confidentialité et RGPD de tuveuxun.expert : quelles données sont collectées, pourquoi, combien de temps, et comment exercer vos droits.",
  alternates: { canonical: '/confidentialite' },
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updated="22 septembre 2026"
      intro="Cette politique explique quelles données personnelles sont collectées via tuveuxun.expert, dans quel but, combien de temps elles sont conservées et comment exercer vos droits, conformément au Règlement Général sur la Protection des Données (RGPD)."
    >
      <div>
        <LegalH2>Responsable du traitement</LegalH2>
        <LegalP>
          Le responsable du traitement est la SASU Tabasco City, éditrice du site (voir les
          {' '}<a href="/mentions-legales" className="text-accent hover:text-aqua">mentions légales</a>).
          Contact : tabascocity@proton.me
        </LegalP>
      </div>

      <div>
        <LegalH2>Données collectées et finalités</LegalH2>
        <LegalP>
          Le site ne collecte que les données que vous fournissez volontairement pour être recontacté :
        </LegalP>
        <ul className="mt-3 space-y-2 text-sm text-aqua/75 font-light leading-relaxed list-disc pl-5">
          <li><strong>Formulaire de contact / demande de devis / prise de rendez-vous</strong> : adresse e-mail, et le cas échéant nom, structure et message. Finalité : répondre à votre demande et établir un devis.</li>
          <li><strong>Assistant en ligne (FAQ / agent Tv1E)</strong> : si vous laissez une adresse e-mail pour être recontacté, elle est enregistrée à cette seule fin.</li>
          <li><strong>Paiement en ligne</strong> : lorsqu'un paiement est proposé, il est traité par le prestataire Stripe. Les données de carte bancaire ne transitent jamais par nos serveurs et sont gérées directement par Stripe.</li>
        </ul>
        <LegalP>
          Aucune donnée n'est collectée à des fins publicitaires ni revendue. Le site n'utilise pas de
          traceur publicitaire tiers.
        </LegalP>
      </div>

      <div>
        <LegalH2>Base légale</LegalH2>
        <LegalP>
          Le traitement repose sur votre consentement (envoi volontaire d'une demande) et sur l'intérêt
          légitime de l'éditeur à répondre aux sollicitations commerciales, ainsi que sur l'exécution de
          mesures précontractuelles (établissement d'un devis).
        </LegalP>
      </div>

      <div>
        <LegalH2>Durée de conservation</LegalH2>
        <LegalP>
          Les demandes de contact sont conservées le temps nécessaire au traitement de la relation, puis
          archivées ou supprimées au plus tard [À COMPLÉTER — ex. 3 ans] après le dernier contact. Les
          données liées à une prestation facturée sont conservées selon les obligations légales et
          comptables en vigueur.
        </LegalP>
      </div>

      <div>
        <LegalH2>Destinataires</LegalH2>
        <LegalP>
          Les données sont destinées au seul éditeur. Elles sont hébergées au sein de l'Union européenne
          ou d'un pays offrant un niveau de protection adéquat (infrastructure Hostinger). Le prestataire
          de paiement Stripe agit en tant que sous-traitant pour les seules transactions.
        </LegalP>
      </div>

      <div>
        <LegalH2>Cookies</LegalH2>
        <LegalP>
          Le site n'utilise pas de cookie publicitaire ni de solution de suivi tiers. Seuls des éléments
          techniques strictement nécessaires au fonctionnement peuvent être utilisés. Aucun consentement
          cookie n'est donc requis pour un usage publicitaire.
        </LegalP>
      </div>

      <div>
        <LegalH2>Vos droits</LegalH2>
        <LegalP>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de
          limitation, d'opposition et de portabilité de vos données. Pour les exercer, écrivez à
          tabascocity@proton.me. Vous pouvez également introduire une réclamation auprès de la CNIL
          (www.cnil.fr).
        </LegalP>
      </div>
    </LegalPage>
  );
}
