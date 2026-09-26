import type { MetadataRoute } from 'next';

// SEO/AEO 2026-07-09 : crawlers classiques ET moteurs de reponse IA bienvenus
// (un consultant IA a tout interet a etre cite par ChatGPT/Perplexity/Claude).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
    ],
    sitemap: 'https://tuveuxun.expert/sitemap.xml',
    host: 'https://tuveuxun.expert',
  };
}
