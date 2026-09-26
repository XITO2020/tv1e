import type { Metadata } from 'next';
import LegalPage, { LegalH2, LegalP } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description:
    "CGV de tuveuxun.expert : forfaits d'intégration d'agents IA, devis, acompte, livraison, support et paiement pour PME, entreprises et associations.",
  alternates: { canonical: '/cgv' },
};

export default function CgvPage() {
  return (
    <LegalPage
      title="Conditions générales de vente"
      updated="22 septembre 2026"
      intro="Les présentes conditions régissent la vente des prestations d'intégration d'agents IA, d'automatisation et de développement proposées par la SASU Tabasco City via tuveuxun.expert."
    >
      <div>
        <LegalH2>1. Objet</LegalH2>
        <LegalP>
          Les prestations comprennent notamment le diagnostic IA, la mise en place d'agents métier,
          l'installation d'agents souverains on-premise, les modules à la carte, la formation et le
          développement de plateformes web. Le détail et les tarifs figurent sur la page
          {' '}<a href="/tarifs" className="text-accent hover:text-aqua">Tarifs</a> et dans le devis.
        </LegalP>
      </div>

      <div>
        <LegalH2>2. Prix et devis</LegalH2>
        <LegalP>
          Les prix sont indiqués en euros et hors taxes (HT). Le prix annoncé pour un forfait est le prix
          facturé, sauf demande hors périmètre. Toute prestation fait l'objet d'un devis ferme, transmis
          généralement sous 48 heures après le rendez-vous de cadrage, et valable [À COMPLÉTER — ex. 30
          jours]. Le devis signé vaut acceptation des présentes CGV.
        </LegalP>
      </div>

      <div>
        <LegalH2>3. Commande, acompte et paiement</LegalH2>
        <LegalP>
          La prestation démarre à réception d'un acompte de 30 %, le solde étant dû à la livraison.
          Paiement par virement bancaire (facture professionnelle) ou, lorsqu'il est proposé, par carte
          via Stripe. Aucun prélèvement récurrent ni abonnement n'est imposé. Une éventuelle mise à jour
          de l'agent est proposée périodiquement à l'acte et reste facultative : la refuser ne dégrade
          pas la prestation livrée.
        </LegalP>
      </div>

      <div>
        <LegalH2>4. Délais et livraison</LegalH2>
        <LegalP>
          Les délais indicatifs figurent sur la page Tarifs et dans le devis. Un cycle de retours est
          inclus sur chaque livrable. Le périmètre fixé au cadrage est celui qui est livré ; toute
          évolution hors périmètre fait l'objet d'un devis complémentaire.
        </LegalP>
      </div>

      <div>
        <LegalH2>5. Droit de rétractation</LegalH2>
        <LegalP>
          Les prestations s'adressant à des professionnels et personnes morales (PME, entreprises,
          collectivités, associations) dans le cadre de leur activité, le droit de rétractation de 14
          jours prévu pour les consommateurs ne s'applique pas, sauf disposition contraire mentionnée au
          devis. [À COMPLÉTER selon le cas des micro-structures.]
        </LegalP>
      </div>

      <div>
        <LegalH2>6. Propriété et souveraineté des livrables</LegalH2>
        <LegalP>
          Sauf mention contraire, les livrables (agents, skills métier, configurations) appartiennent au
          client après paiement intégral et, pour les solutions souveraines, tournent sur son propre
          serveur, ses données ne quittant pas son infrastructure. Les briques open source restent
          soumises à leur licence d'origine.
        </LegalP>
      </div>

      <div>
        <LegalH2>7. Garanties et responsabilité</LegalH2>
        <LegalP>
          La prestation est fournie avec le support indiqué au forfait (par exemple 30 ou 60 jours). La
          responsabilité de l'éditeur est limitée au montant de la prestation concernée et ne couvre pas
          les dommages indirects. Le client demeure responsable de l'usage qu'il fait des agents livrés.
        </LegalP>
      </div>

      <div>
        <LegalH2>8. Droit applicable et litiges</LegalH2>
        <LegalP>
          Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera
          recherchée avant toute action ; à défaut, les tribunaux compétents seront ceux du ressort du
          siège social de l'éditeur.
        </LegalP>
      </div>
    </LegalPage>
  );
}
