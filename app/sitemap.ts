import { MetadataRoute } from 'next';
import { guidesIndex } from '@/lib/guides/guidesIndex';
import { blogIndex } from '@/lib/blog/blogIndex';
import { getSiteUrl } from '@/lib/siteUrl';
import { TEN_PAGE_GUIDES } from '@/lib/seo/tenPageGuides';

// Dynamic sitemap generation for Next.js
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  // Static, indexable hub pages
  const routes = ['', '/about', '/faq', '/privacy', '/blog', '/contact', '/meal-plans', '/nutrition-guide', '/forum'].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: route === '' ? ('daily' as const) : ('weekly' as const),
      priority: route === '' ? 1.0 : 0.8,
    })
  );

  // Species hub pages
  const speciesHubs = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'].map((species) => ({
    url: `${baseUrl}/species/${species}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Guides hub pages
  const guideHubs = ['dogs', 'cats', 'birds', 'reptiles', 'pocket-pets'].map((species) => ({
    url: `${baseUrl}/guides/${species}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const guides = guidesIndex.map((g) => ({
    url: `${baseUrl}${g.slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const tenPageGuides = TEN_PAGE_GUIDES.map((g) => ({
    url: `${baseUrl}${g.slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const blogPosts = blogIndex.map((p) => ({
    url: `${baseUrl}${p.slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...speciesHubs, ...guideHubs, ...guides, ...tenPageGuides, ...blogPosts];
}

