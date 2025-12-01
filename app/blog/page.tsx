import Link from 'next/link';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const blogPosts = [
    {
      id: 'complete-guide-homemade-dog-food',
      title: 'The Complete Guide to Homemade Dog Food: What Every Pet Parent Needs to Know',
      excerpt: 'Learn how to safely transition your dog to homemade meals while ensuring complete nutrition. Our veterinary-approved guide covers everything from ingredient selection to portion calculations.',
      author: 'Dr. Sarah Mitchell, DVM',
      date: '2024-11-20',
      readTime: '8 min read',
      category: 'Nutrition',
      image: '/IMAGES FOR SITE/Dogo.jpg'
    },
    {
      id: 'cat-nutrition-myths-debunked',
      title: 'Cat Nutrition Myths Debunked: Separating Fact from Fiction',
      excerpt: 'From "cats need milk" to "raw diets are dangerous," we examine common misconceptions about feline nutrition and provide evidence-based guidance.',
      author: 'Dr. Michael Chen, Veterinary Nutritionist',
      date: '2024-11-18',
      readTime: '6 min read',
      category: 'Myths',
      image: '/IMAGES FOR SITE/CatScientist.png'
    },
    {
      id: 'fresh-pet-food-market-trends',
      title: 'The Rise of Fresh Pet Food: Market Trends and What They Mean for Your Pet',
      excerpt: 'The pet food industry is undergoing a revolution. Discover the latest trends in fresh, human-grade pet nutrition and how to choose the best options.',
      author: 'Emma Rodriguez, Pet Industry Analyst',
      date: '2024-11-15',
      readTime: '5 min read',
      category: 'Industry',
      image: '/IMAGES FOR SITE/Dinner.jpg'
    },
    {
      id: 'supplements-every-pet-needs',
      title: 'Essential Supplements Every Pet Needs (And Why)',
      excerpt: 'Not all pets need supplements, but many benefit from targeted nutritional support. Learn which supplements are essential and how to choose quality products.',
      author: 'Dr. James Park, Veterinary Researcher',
      date: '2024-11-12',
      readTime: '7 min read',
      category: 'Supplements',
      image: '/IMAGES FOR SITE/Puppychef1.png'
    },
    {
      id: 'reading-pet-food-labels',
      title: 'How to Read Pet Food Labels Like a Pro',
      excerpt: 'Pet food labels can be confusing, but they contain crucial information about nutrition. Master the art of label reading to make informed choices.',
      author: 'Lisa Thompson, Pet Nutrition Consultant',
      date: '2024-11-10',
      readTime: '4 min read',
      category: 'Education',
      image: '/IMAGES FOR SITE/dishe.jpg'
    },
    {
      id: 'seasonal-pet-nutrition',
      title: 'Seasonal Pet Nutrition: Adjusting Diets for Winter, Summer, and Everything In Between',
      excerpt: 'Your pet\'s nutritional needs change with the seasons. Learn how to adjust their diet for optimal health year-round.',
      author: 'Dr. Rachel Green, Holistic Veterinarian',
      date: '2024-11-08',
      readTime: '6 min read',
      category: 'Seasonal',
      image: '/IMAGES FOR SITE/indian-food-illustration-kawaii-design-600nw-2629494985.webp'
    }
  ];

  const categories = ['All', 'Nutrition', 'Myths', 'Industry', 'Supplements', 'Education', 'Seasonal'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Pet Nutrition Blog
          </h1>
          <p className="text-xl text-primary-100">
            Expert insights, research-backed advice, and the latest in pet nutrition science
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-primary-50 hover:border-primary-300 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
                  {blogPosts[0].category}
                </span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(blogPosts[0].date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {blogPosts[0].readTime}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {blogPosts[0].title}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {blogPosts[0].excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{blogPosts[0].author}</span>
                </div>
                <Link
                  href={`/blog/${blogPosts[0].id}`}
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs font-medium">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">{post.author}</span>
                  </div>
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-primary-600 text-white rounded-lg p-8 mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Updated on Pet Nutrition</h3>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Get the latest research, recipe ideas, and expert advice delivered to your inbox weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}