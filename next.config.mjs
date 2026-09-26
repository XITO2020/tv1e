/** @type {import('next').NextConfig} */
const nextConfig = {
  // STATIC_EXPORT=1 npm run build -> dossier out/ servi par nginx sur le KVM2 (12/09/2026).
  // distDir separe (.next-export) : le build de deploiement n'ecrase PAS le .next
  // qu'un `next dev` en cours utilise -> on peut builder pendant que le dev tourne
  // (regle gravee : jamais casser le dev server, incident 12/09).
  // Sans la variable, comportement inchange (next dev sur .next).
  ...(process.env.STATIC_EXPORT ? { output: 'export', distDir: '.next-export' } : {}),
  reactStrictMode: true,
  transpilePackages: ['three'],
};

export default nextConfig;
