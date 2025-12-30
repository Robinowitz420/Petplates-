import { MetadataRoute } from 'next';
import { guidesIndex } from '@/lib/guides/guidesIndex';

// Dynamic sitemap generation for Next.js
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://petplatesmealplatform-ldvstwjsy-plateandpaw.vercel.app';
  
  // Static pages
  const routes = [
    '',
    '/about',
    '/contact',
    '/faq',
    '/privacy',
    '/subscribe',
    '/nutrition-guide',
    '/meal-plans',
    '/forum',
    '/forum/gallery',
    '/blog',
    '/dashboard',
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

  // Blog posts (if you have them)
  const blogPosts = [
    'homemade-dog-food-recipes',
    'cat-nutrition-guide',
    'bird-diet-essentials',
    'reptile-meal-prep',
    'small-pet-feeding-tips',
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const guides = guidesIndex.map((g) => ({
    url: `${baseUrl}${g.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...categories, ...blogPosts, ...guides];
}

