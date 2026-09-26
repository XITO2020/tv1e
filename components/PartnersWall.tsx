/**
 * PartnersWall — "PME beneficiant de nos services", dernier composant de la
 * home avant le footer. Logos dans public/partners/, en flex-wrap statique —
 * PAS un carousel : une liste posee, qui se lit d'un coup, pas un defile.
 *
 * Chaque logo garde son propre fond (blanc, noir, creme selon la source) :
 * poses tels quels sur l'obsidian du site, un fond noir se serait fondu dans
 * la page et un fond blanc aurait explose au contraire — la plaque commune
 * donne a chaque logo la MEME surface de lecture, comme un mur de logos
 * "ils nous font confiance" classique.
 *
 * Chaque plaque est un lien externe vers le site du partenaire (11/09,
 * URLs donnees par Naim). Composant serveur : de simples <a> suffisent,
 * pas besoin de client component pour un lien qui ouvre un nouvel onglet.
 */

const PARTNERS = [
  { slug: 'dueria', name: 'Dueria', img: '/partners/dueria.png', url: 'https://dueria.fr' },
  { slug: 'raisup', name: 'Raisup', img: '/partners/raisup.png', url: 'https://www.raisup.fr' },
  { slug: 'fundherz', name: 'Fundherz', img: '/partners/fundherz.jpg', url: 'https://fundherz.fr' },
  { slug: 'tabasco-city', name: 'Tabasco City', img: '/partners/tbcity.png', url: 'https://tabasco.city' },
  { slug: 'shonen-industries', name: 'Shonen Industries', img: '/partners/shind.webp', url: 'https://shonen.industries' },
  { slug: 'insersite', name: 'Insersite', img: '/partners/insersite.webp', url: 'https://www.insersite.org' },
];

export default function PartnersWall() {
  return (
    <section className="py-24 border-t border-accent/15 bg-obsidian">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="hud-label mb-10 text-center inline-block">
          <span className="w-8 h-px bg-accent inline-block align-middle mr-3" />
          Ils nous font confiance
        </div>
        <h2 className="font-monodisp text-[11px] tracking-[0.22em] uppercase text-aqua/70 text-center mb-14">
          Sites et PME bénéficiant de nos services
        </h2>

        {/* Mobile : grille 2 par ligne (15/09, retour Naim). Desktop : mur flex inchange. */}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
          {PARTNERS.map((p) => (
            <a
              key={p.slug}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center h-20 w-full sm:h-24 sm:w-52 bg-black/95 hover:bg-emerald-950/45 border border-accent/15 hover:border-accent/50 clip-civ-sm px-4 py-3 sm:px-6 sm:py-4 transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.img}
                alt={p.name}
                className="max-h-full max-w-full object-contain grayscale-0 opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
