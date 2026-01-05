import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, User, Share2, Bookmark } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';
import { blogIndex } from '@/lib/blog/blogIndex';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Paws & Plates',
  url: getSiteUrl(),
  logo: absoluteUrl('/images/emojis/Mascots/HeroPics/newLogo.png'),
};

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  tags: string[];
}

export const dynamicParams = false;

export function generateStaticParams() {
  return blogIndex.map((entry) => ({ slug: entry.slug.replace('/blog/', '') }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = `/blog/${params.slug}`;
  const entry = blogIndex.find((p) => p.slug === slug);

  const title = entry?.title || 'Pet Nutrition Blog - Paws & Plates';
  const description = entry?.excerpt || 'Expert insights, research-backed advice, and the latest in pet nutrition science.';

  return {
    title,
    description,
    alternates: {
      canonical: slug,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(slug),
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const slug = `/blog/${params.slug}`;
  const entry = blogIndex.find((p) => p.slug === slug);

  if (!entry) {
    notFound();
  }

  // Mock blog post data - in real app, this would come from a CMS or database
  const blogPost: BlogPost = {
    id: params.slug,
    title: entry?.title || 'The Complete Guide to Homemade Dog Food: What Every Pet Parent Needs to Know',
    content: `
      <p className="text-lg text-orange-300 leading-relaxed mb-6">
        Making homemade dog food can be incredibly rewarding, but it requires careful planning to ensure your dog gets complete, balanced nutrition. This comprehensive guide will walk you through everything you need to know to safely prepare nutritious meals at home.
      </p>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">Why Choose Homemade Dog Food?</h2>
      <p className="text-orange-300 leading-relaxed mb-4">
        Commercial dog food has come a long way, but homemade meals offer several advantages:
      </p>
      <ul className="list-disc pl-6 mb-6 text-orange-300">
        <li>You know exactly what's in every meal</li>
        <li>You can accommodate specific allergies or sensitivities</li>
        <li>You can use higher-quality, fresher ingredients</li>
        <li>You can adjust recipes for specific health conditions</li>
        <li>You can control portion sizes and caloric intake</li>
      </ul>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">Essential Nutrients Your Dog Needs</h2>
      <p className="text-orange-300 leading-relaxed mb-4">
        Dogs require a balance of proteins, fats, carbohydrates, vitamins, and minerals. The key nutrients include:
      </p>

      <div className="bg-green-900/20 border-l-4 border-green-800/40 p-6 mb-6">
        <h3 className="text-lg font-semibold text-orange-300 mb-2">Macronutrients</h3>
        <ul className="text-orange-300">
          <li><strong>Protein:</strong> 18-25% of diet (muscle maintenance, enzyme production)</li>
          <li><strong>Fat:</strong> 10-15% of diet (energy, skin/coat health, vitamin absorption)</li>
          <li><strong>Carbohydrates:</strong> 30-50% of diet (energy, fiber for digestion)</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">Getting Started: Basic Recipe Template</h2>
      <p className="text-orange-300 leading-relaxed mb-4">
        Start with this simple template and adjust based on your dog's specific needs:
      </p>

      <div className="bg-green-900/20 p-6 rounded-lg mb-6">
        <h3 className="font-semibold text-orange-300 mb-4">Basic Homemade Dog Food Recipe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-orange-300 mb-2">Protein Source (50%)</h4>
            <ul className="text-orange-300">
              <li>• Ground chicken or turkey</li>
              <li>• Lean beef or lamb</li>
              <li>• Fish (canned in water)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-orange-300 mb-2">Vegetables (25%)</h4>
            <ul className="text-orange-300">
              <li>• Sweet potatoes</li>
              <li>• Carrots</li>
              <li>• Green beans</li>
              <li>• Pumpkin</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-orange-300 mb-2">Carbs (20%)</h4>
            <ul className="text-orange-300">
              <li>• Brown rice</li>
              <li>• Quinoa</li>
              <li>• Oatmeal</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-orange-300 mb-2">Supplements (5%)</h4>
            <ul className="text-orange-300">
              <li>• Fish oil</li>
              <li>• Calcium supplement</li>
              <li>• Vitamin/mineral mix</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">Common Mistakes to Avoid</h2>
      <div className="space-y-4 mb-6">
        <div className="border-l-4 border-green-800/40 bg-green-900/20 p-4">
          <h3 className="font-semibold text-orange-300">Over-Supplementation</h3>
          <p className="text-orange-300">Too many vitamins can be as harmful as deficiencies. Stick to veterinary-recommended amounts.</p>
        </div>
        <div className="border-l-4 border-green-800/40 bg-green-900/20 p-4">
          <h3 className="font-semibold text-orange-300">Ignoring Calcium-Phosphorus Balance</h3>
          <p className="text-orange-300">This ratio is crucial for bone health. Most homemade diets need calcium supplementation.</p>
        </div>
        <div className="border-l-4 border-green-800/40 bg-green-900/20 p-4">
          <h3 className="font-semibold text-orange-300">Sudden Diet Changes</h3>
          <p className="text-orange-300">Transition gradually over 7-10 days to avoid digestive upset.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">When to Consult a Veterinarian</h2>
      <p className="text-orange-300 leading-relaxed mb-4">
        While homemade dog food can be excellent, certain situations require professional guidance:
      </p>
      <ul className="list-disc pl-6 mb-6 text-orange-300">
        <li>Puppies or senior dogs with specific nutritional needs</li>
        <li>Dogs with health conditions (kidney disease, diabetes, allergies)</li>
        <li>Breed-specific requirements (large/giant breeds, brachycephalic dogs)</li>
        <li>If your dog shows signs of nutritional deficiencies</li>
      </ul>

      <div className="bg-green-900/20 border border-green-800/40 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-orange-300 mb-2"> Pro Tip</h3>
        <p className="text-orange-300">
          Start with commercially available vitamin/mineral mixes formulated for homemade diets. These take the guesswork out of supplementation and ensure complete nutrition.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-4">Sample Recipes to Get Started</h2>
      <p className="text-orange-300 leading-relaxed mb-6">
        Here are three balanced recipes for different life stages. Each serves one adult dog for one day.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-900/20 border border-green-800/40 rounded-lg p-6">
          <h3 className="font-bold text-orange-300 mb-3">Adult Maintenance</h3>
          <ul className="text-sm text-orange-300 space-y-1">
            <li>1 lb ground chicken</li>
            <li>1 cup sweet potato</li>
            <li>1 cup carrots</li>
            <li>½ cup brown rice</li>
            <li>1 tbsp fish oil</li>
            <li>Calcium supplement</li>
          </ul>
        </div>
        <div className="bg-green-900/20 border border-green-800/40 rounded-lg p-6">
          <h3 className="font-bold text-orange-300 mb-3">Weight Management</h3>
          <ul className="text-sm text-orange-300 space-y-1">
            <li>¾ lb ground turkey</li>
            <li>2 cups zucchini</li>
            <li>1 cup green beans</li>
            <li>½ cup quinoa</li>
            <li>½ tbsp fish oil</li>
            <li>Calcium supplement</li>
          </ul>
        </div>
        <div className="bg-green-900/20 border border-green-800/40 rounded-lg p-6">
          <h3 className="font-bold text-orange-300 mb-3">Senior Dog</h3>
          <ul className="text-sm text-orange-300 space-y-1">
            <li>¾ lb ground chicken</li>
            <li>1 cup pumpkin</li>
            <li>1 cup carrots</li>
            <li>½ cup oatmeal</li>
            <li>1 tbsp fish oil</li>
            <li>Joint supplement</li>
            <li>Calcium supplement</li>
          </ul>
        </div>
      </div>

      <p className="text-orange-300 leading-relaxed mb-8">
        Remember, these are starting points. Every dog is unique, and their nutritional needs can vary based on age, activity level, health status, and individual metabolism. When in doubt, consult with a pet health specialist to create a diet perfectly tailored to your dog's needs.
      </p>
    `,
    author: entry?.author || 'Dr. Sarah Mitchell, DVM',
    date: entry?.date || '2024-11-20',
    readTime: entry?.readTime || '8 min read',
    category: entry?.category || 'Nutrition',
    image: '/images/emojis/Mascots/Prep Puppy.jpg',
    tags: ['homemade dog food', 'nutrition', 'recipes', 'pet health specialist advice']
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {/* Navigation */}
      <div className="bg-surface border-b border-green-800/40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70 mb-3">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="text-orange-300 hover:text-orange-200">
                  Home
                </Link>
              </li>
              <li className="text-white/50">→</li>
              <li>
                <Link href="/blog" className="text-orange-300 hover:text-orange-200">
                  Blog
                </Link>
              </li>
              <li className="text-white/50">→</li>
              <li className="text-white">{blogPost.title}</li>
            </ol>
          </nav>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-orange-300 hover:text-orange-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm text-white/70 mb-4">
            <span className="bg-green-900/20 text-orange-300 px-3 py-1 rounded-full border border-green-800/40">
              {blogPost.category}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(blogPost.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {blogPost.readTime}
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            {blogPost.title}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-orange-300" />
              </div>
              <div>
                <div className="font-semibold text-white">{blogPost.author}</div>
                <div className="text-sm text-white/70">Pet Health Specialist</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 text-orange-300/70 hover:text-orange-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-orange-300/70 hover:text-orange-200 transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-8 relative w-full h-64 md:h-96">
          <Image
            src={blogPost.image}
            alt={blogPost.title}
            fill
            className="object-cover rounded-lg shadow-lg"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>

        {/* Content */}
        <div
          className="max-w-none text-white/80"
          dangerouslySetInnerHTML={{ __html: blogPost.content }}
        />

        {/* Tags */}
        <div className="mt-8 pt-8 border-t border-green-800/40">
          <div className="flex flex-wrap gap-2">
            {blogPost.tags.map((tag) => (
              <span
                key={tag}
                className="bg-green-900/20 text-orange-300 px-3 py-1 rounded-full text-sm border border-green-800/40"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        <div className="mt-8 bg-surface border border-green-800/40 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-orange-300" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{blogPost.author}</h3>
              <p className="text-white/70 text-sm mb-3">
                Dr. Mitchell is a board-certified pet health specialist with over 15 years of experience
                helping pet parents create balanced homemade diets. She specializes in preventive nutrition
                and works with pets of all species.
              </p>
              <Link
                href="/about"
                className="text-orange-300 hover:text-orange-200 font-medium text-sm"
              >
                Learn more about our pet health specialist team →
              </Link>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/blog/cat-nutrition-myths-debunked"
              className="bg-surface border border-green-800/40 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h4 className="font-semibold text-white mb-2 hover:text-orange-200 transition-colors">
                Cat Nutrition Myths Debunked
              </h4>
              <p className="text-white/70 text-sm">
                Separating fact from fiction in feline nutrition...
              </p>
            </Link>
            <Link
              href="/blog/supplements-every-pet-needs"
              className="bg-surface border border-green-800/40 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h4 className="font-semibold text-white mb-2 hover:text-orange-200 transition-colors">
                Essential Supplements Every Pet Needs
              </h4>
              <p className="text-white/70 text-sm">
                Not all pets need supplements, but many benefit...
              </p>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}