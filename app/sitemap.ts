import type { MetadataRoute } from 'next';

const BASE = 'https://tuveuxun.expert';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/tarifs`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/agents`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/monthly-agents`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/skills`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/marketplace`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/structure-souveraine`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/a-propos`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/mentions-legales`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/confidentialite`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/cgv`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/cgu`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
