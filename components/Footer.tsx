import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-accent/15 bg-obsidian relative z-10">
      <div className="max-w-[1320px] mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 bg-accent animate-ping opacity-50" />
                <span className="relative inline-flex h-2 w-2 bg-accent" />
              </span>
              <span className="font-monodisp text-[11px] font-medium text-aqua tracking-[0.18em] uppercase">
                tuveuxun<span className="text-accent">.expert</span>
              </span>
            </div>
            <p className="display-h3 text-aqua/85 leading-tight max-w-md">
              Consultant IA pour structures qui veulent <span className="grad-fusion font-medium">avancer et produire</span> du résultat sans se faire submerger ni dépasser.
            </p>
          </div>

          <div className="md:col-span-2">
            <h5 className="eyebrow mb-6">Site</h5>
            <ul className="space-y-3">
              <li><Link href="/" className="text-aqua/70 hover:text-accent text-sm font-light">Index</Link></li>
              <li><Link href="/tarifs" className="text-aqua/70 hover:text-accent text-sm font-light">Tarifs</Link></li>
              <li><Link href="/marketplace" className="text-aqua/70 hover:text-accent text-sm font-light">Marketplace</Link></li>
              <li><Link href="/a-propos" className="text-aqua/70 hover:text-accent text-sm font-light">A propos</Link></li>
              <li><Link href="/agents" className="text-aqua/40 hover:text-accent text-sm font-light italic">Catalogue 12 agents</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h5 className="eyebrow mb-6">Contact</h5>
            <ul className="space-y-3">
              <li><a href="mailto:tabascocity@proton.me?subject=demande%20tv1e" className="text-aqua/70 hover:text-accent text-sm font-light">Nous écrire</a></li>
              <li><a href="mailto:tabascocity@proton.me?subject=demande%20tv1e%20-%20devis" className="text-aqua/70 hover:text-accent text-sm font-light">Demander un devis</a></li>
              <li><a href="https://github.com/XITO2020" target="_blank" rel="noopener" className="text-aqua/70 hover:text-accent text-sm font-light">GitHub</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h5 className="eyebrow mb-6">Cadre</h5>
            <p className="text-aqua/55 text-sm font-light leading-relaxed">
              Structure française déclarée<br />
              Facturation professionnelle<br />
              Devis fermes sous 48 h<br />
              Mobilité IDF + remote<br />
              RCS B980463798
            </p>
          </div>
        </div>

        {/* Barre légale — présente sur toutes les pages, tous les modes. */}
        <div className="border-t border-accent/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-monodisp text-[10px] tracking-[0.2em] uppercase text-aqua/40">
            © 2026 tuveuxun.expert · RCS B980463798
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-monodisp text-[10px] tracking-[0.2em] uppercase text-aqua/45">
            <Link href="/mentions-legales" className="hover:text-accent transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-accent transition-colors">Confidentialité</Link>
            <Link href="/cgv" className="hover:text-accent transition-colors">CGV</Link>
            <Link href="/cgu" className="hover:text-accent transition-colors">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
