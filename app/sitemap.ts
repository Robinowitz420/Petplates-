import { MetadataRoute } from 'next';
import { guidesIndex } from '@/lib/guides/guidesIndex';

// Dynamic sitemap generation for Next.js
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://paws-and-plates.vercel.app';
  
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

  // Pet category pages
  const categories = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'].map((category) => ({
    url: `${baseUrl}/category/${category}`,
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

  return [...routes, ...categories, ...guides];
}

