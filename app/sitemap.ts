import { MetadataRoute } from 'next';
import { guidesIndex } from '@/lib/guides/guidesIndex';
import { getSiteUrl } from '@/lib/siteUrl';

// Dynamic sitemap generation for Next.js
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  
  // Static pages
  const routes = [
    '',
    '/about',
    '/faq',
    '/privacy',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Species hub pages
  const speciesHubs = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'].map((species) => ({
    url: `${baseUrl}/species/${species}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const guides = guidesIndex.map((g) => ({
    url: `${baseUrl}${g.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...speciesHubs, ...guides];
}

