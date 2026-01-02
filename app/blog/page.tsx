import Link from 'next/link';
import { Clock } from 'lucide-react';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';
import Image from 'next/image';
import BlogBanner from '@/public/images/Site Banners/BlogBanner.png';
import { Metadata } from 'next';
import { blogIndex } from '@/lib/blog/blogIndex';

export const metadata: Metadata = {
  title: 'Pet Nutrition Blog - Paws & Plates',
  description: 'Expert insights, research-backed advice, and the latest in pet nutrition science from the team at Paws & Plates.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Pet Nutrition Blog - Paws & Plates',
    description: 'Expert insights, research-backed advice, and the latest in pet nutrition science.',
    url: absoluteUrl('/blog'),
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Paws & Plates',
  url: getSiteUrl(),
  logo: absoluteUrl('/images/emojis/Mascots/HeroPics/newLogo.png'),
};

export default function BlogPage() {
  const blogPosts = blogIndex.map((p) => ({
    id: p.slug.replace('/blog/', ''),
    title: p.title,
    excerpt: p.excerpt,
    author: p.author,
    date: p.date,
    readTime: p.readTime,
    category: p.category,
  }));

  const categories = ['All', 'Nutrition', 'Myths', 'Industry', 'Supplements', 'Education', 'Seasonal'];

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {/* Header */}
      <div className="text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Pet Nutrition Blog
          </h1>
          <p className="text-lg text-orange-200">
            Expert insights, research-backed advice, and the latest in pet nutrition science
          </p>
        </div>
        <div className="max-w-5xl mx-auto flex justify-center">
          <Image
            src={BlogBanner}
            alt="Blog banner"
            priority
            className="rounded-lg border border-orange-500 w-full sm:w-1/2 h-auto"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-surface border border-green-800/40 rounded-full text-sm font-medium text-orange-300 hover:bg-surface-highlight hover:border-orange-500/50 hover:text-orange-200 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts List - Reddit Style */}
        <div className="space-y-4">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-surface rounded border border-green-800/40 hover:border-green-800/60 transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Left side - voting area (optional, can be removed) */}
                  <div className="flex flex-col items-center pt-1">
                    <button className="text-orange-300/70 hover:text-orange-200 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="text-xs text-orange-300/70 mt-1">0</span>
                    <button className="text-orange-300/70 hover:text-orange-200 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Right side - content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-white/70 mb-2">
                      <span className="bg-green-900/20 text-orange-300 px-2 py-0.5 rounded border border-green-800/40">
                        {post.category}
                      </span>
                      <span>•</span>
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <Link href={`/blog/${post.id}`}>
                      <h3 className="text-lg font-semibold text-white mb-2 hover:text-orange-200 transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-white/70 mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-white/70">
                      <Link
                        href={`/blog/${post.id}`}
                        className="hover:text-orange-200 font-medium transition-colors"
                      >
                        Read more
                      </Link>
                      <span>•</span>
                      <button className="hover:text-orange-200 transition-colors">Share</button>
                      <span>•</span>
                      <button className="hover:text-orange-200 transition-colors">Save</button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}