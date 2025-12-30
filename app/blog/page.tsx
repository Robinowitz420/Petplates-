import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function BlogPage() {
  const blogPosts = [
    {
      id: 'complete-guide-homemade-dog-food',
      title: 'The Complete Guide to Homemade Dog Food: What Every Pet Parent Needs to Know',
      excerpt: 'Learn how to safely transition your dog to homemade meals while ensuring complete nutrition. Our pet health specialist-approved guide covers everything from ingredient selection to portion calculations.',
      author: 'Dr. Sarah Mitchell, DVM',
      date: '2024-11-20',
      readTime: '8 min read',
      category: 'Nutrition'
    },
    {
      id: 'cat-nutrition-myths-debunked',
      title: 'Cat Nutrition Myths Debunked: Separating Fact from Fiction',
      excerpt: 'From "cats need milk" to "raw diets are dangerous," we examine common misconceptions about feline nutrition and provide evidence-based guidance.',
      author: 'Dr. Michael Chen, Pet Health Specialist',
      date: '2024-11-18',
      readTime: '6 min read',
      category: 'Myths',
    },
    {
      id: 'fresh-pet-food-market-trends',
      title: 'The Rise of Fresh Pet Food: Market Trends and What They Mean for Your Pet',
      excerpt: 'The pet food industry is undergoing a revolution. Discover the latest trends in fresh, human-grade pet nutrition and how to choose the best options.',
      author: 'Emma Rodriguez, Pet Industry Analyst',
      date: '2024-11-15',
      readTime: '5 min read',
      category: 'Industry',
    },
    {
      id: 'supplements-every-pet-needs',
      title: 'Essential Supplements Every Pet Needs (And Why)',
      excerpt: 'Not all pets need supplements, but many benefit from targeted nutritional support. Learn which supplements are essential and how to choose quality products.',
      author: 'Dr. James Park, Pet Health Researcher',
      date: '2024-11-12',
      readTime: '7 min read',
      category: 'Supplements',
    },
    {
      id: 'reading-pet-food-labels',
      title: 'How to Read Pet Food Labels Like a Pro',
      excerpt: 'Pet food labels can be confusing, but they contain crucial information about nutrition. Master the art of label reading to make informed choices.',
      author: 'Lisa Thompson, Pet Nutrition Consultant',
      date: '2024-11-10',
      readTime: '4 min read',
      category: 'Education',
    },
    {
      id: 'seasonal-pet-nutrition',
      title: 'Seasonal Pet Nutrition: Adjusting Diets for Winter, Summer, and Everything In Between',
      excerpt: 'Your pet\'s nutritional needs change with the seasons. Learn how to adjust their diet for optimal health year-round.',
      author: 'Dr. Rachel Green, Holistic Veterinarian',
      date: '2024-11-08',
      readTime: '6 min read',
      category: 'Seasonal',
    }
  ];

  const categories = ['All', 'Nutrition', 'Myths', 'Industry', 'Supplements', 'Education', 'Seasonal'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Pet Nutrition Blog
          </h1>
          <p className="text-lg text-orange-200">
            Expert insights, research-backed advice, and the latest in pet nutrition science
          </p>
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