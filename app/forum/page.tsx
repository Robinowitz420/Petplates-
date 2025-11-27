'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Users, TrendingUp, Plus, Search, Filter, ThumbsUp, MessageCircle, Eye, ChefHat } from 'lucide-react';

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Topics', count: 1247, color: 'bg-gray-100 text-gray-800' },
    { id: 'recipes', name: 'Recipe Discussions', count: 456, color: 'bg-blue-100 text-blue-800' },
    { id: 'nutrition', name: 'Nutrition Questions', count: 234, color: 'bg-green-100 text-green-800' },
    { id: 'health', name: 'Health & Conditions', count: 189, color: 'bg-red-100 text-red-800' },
    { id: 'training', name: 'Training & Behavior', count: 156, color: 'bg-purple-100 text-purple-800' },
    { id: 'products', name: 'Product Reviews', count: 98, color: 'bg-orange-100 text-orange-800' },
    { id: 'general', name: 'General Discussion', count: 114, color: 'bg-indigo-100 text-indigo-800' }
  ];

  const forumThreads = [
    {
      id: 1,
      title: "Homemade chicken and rice recipe - my dog won't eat it!",
      author: "SarahPetMom",
      avatar: "/images/avatars/sarah.jpg",
      category: "recipes",
      replies: 23,
      views: 1456,
      lastReply: "2 hours ago",
      lastReplyBy: "ChefMike",
      isSticky: false,
      tags: ["chicken", "rice", "picky-eater"],
      excerpt: "I've been trying this recipe for 3 days now but my golden retriever just sniffs it and walks away. Any suggestions for making it more appealing?"
    },
    {
      id: 2,
      title: "STICKY: Community Recipe Contest - Winter Warmers!",
      author: "ThePetPantry",
      avatar: "/images/avatars/admin.jpg",
      category: "recipes",
      replies: 67,
      views: 3241,
      lastReply: "1 hour ago",
      lastReplyBy: "RecipeQueen",
      isSticky: true,
      tags: ["contest", "winter", "featured"],
      excerpt: "Share your best warming recipes for cold weather! Winner gets featured on our blog and a $50 Amazon gift card. Contest ends December 15th."
    },
    {
      id: 3,
      title: "Kidney disease diet modifications - success stories?",
      author: "HopefulOwner",
      avatar: "/images/avatars/hope.jpg",
      category: "health",
      replies: 34,
      views: 892,
      lastReply: "4 hours ago",
      lastReplyBy: "KidneyWarrior",
      isSticky: false,
      tags: ["kidney-disease", "success-story", "chronic-illness"],
      excerpt: "My 12-year-old lab was diagnosed with early kidney disease. We've been on a homemade diet for 6 months. Anyone else have positive experiences to share?"
    },
    {
      id: 4,
      title: "Best supplements for senior dogs (8+ years)",
      author: "SeniorDogDad",
      avatar: "/images/avatars/senior.jpg",
      category: "nutrition",
      replies: 28,
      views: 756,
      lastReply: "6 hours ago",
      lastReplyBy: "VetAssistant",
      isSticky: false,
      tags: ["senior-dogs", "supplements", "joint-health"],
      excerpt: "My 10-year-old shepherd has arthritis. What supplements have you found most helpful for mobility and joint health?"
    },
    {
      id: 5,
      title: "Cat food recipes that actually work",
      author: "CatLady2024",
      avatar: "/images/avatars/cat.jpg",
      category: "recipes",
      replies: 45,
      views: 1234,
      lastReply: "3 hours ago",
      lastReplyBy: "FelineExpert",
      isSticky: false,
      tags: ["cats", "recipes", "picky-eaters"],
      excerpt: "My Maine Coon is so picky! She turns her nose up at most commercial foods. What homemade recipes have worked for your finicky felines?"
    },
    {
      id: 6,
      title: "Allergy testing vs elimination diet - which is better?",
      author: "AllergyMom",
      avatar: "/images/avatars/allergy.jpg",
      category: "health",
      replies: 19,
      views: 543,
      lastReply: "8 hours ago",
      lastReplyBy: "Dermatologist",
      isSticky: false,
      tags: ["allergies", "testing", "elimination-diet"],
      excerpt: "My vet recommended allergy testing ($300) but I'm considering trying an elimination diet first. What has your experience been?"
    }
  ];

  const stats = [
    { label: 'Active Members', value: '12,847', icon: Users, color: 'text-blue-600' },
    { label: 'Discussions', value: '3,421', icon: MessageSquare, color: 'text-green-600' },
    { label: 'Recipes Shared', value: '1,892', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Success Stories', value: '756', icon: ThumbsUp, color: 'text-orange-600' }
  ];

  const filteredThreads = forumThreads.filter(thread => {
    const matchesCategory = activeCategory === 'all' || thread.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Pet Nutrition Community
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Connect with fellow pet parents, share recipes, get advice from experts,
            and learn from real experiences in our supportive community.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
              <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore Community</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/forum/gallery"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChefHat className="w-8 h-8 text-primary-600" />
              <div>
                <div className="font-semibold text-gray-900">Recipe Gallery</div>
                <div className="text-sm text-gray-600">Browse community modifications</div>
              </div>
            </Link>
            <Link
              href="/forum?category=recipes"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-8 h-8 text-green-600" />
              <div>
                <div className="font-semibold text-gray-900">Recipe Discussions</div>
                <div className="text-sm text-gray-600">Ask questions, share tips</div>
              </div>
            </Link>
            <Link
              href="/forum?category=health"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">Health Support</div>
                <div className="text-sm text-gray-600">Connect with other pet parents</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search discussions, recipes, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Start Discussion
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : category.color + ' hover:opacity-80'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Forum Threads */}
        <div className="space-y-4">
          {filteredThreads.map((thread) => (
            <div key={thread.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-lg">
                      {thread.author.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Thread Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {thread.isSticky && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                              STICKY
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            thread.category === 'recipes' ? 'bg-blue-100 text-blue-800' :
                            thread.category === 'health' ? 'bg-red-100 text-red-800' :
                            thread.category === 'nutrition' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {categories.find(c => c.id === thread.category)?.name}
                          </span>
                        </div>

                        <Link href={`/forum/thread/${thread.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2">
                            {thread.title}
                          </h3>
                        </Link>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {thread.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {thread.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Thread Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>by <strong className="text-gray-700">{thread.author}</strong></span>
                          <span>Last reply {thread.lastReply} by {thread.lastReplyBy}</span>
                        </div>
                      </div>

                      {/* Thread Stats */}
                      <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{thread.replies} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{thread.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Load More Discussions
          </button>
        </div>

        {/* Community Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Community Guidelines</h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li>• Be respectful and supportive of fellow pet parents</li>
            <li>• Always consult your veterinarian for health-related advice</li>
            <li>• Share your experiences and learn from others</li>
            <li>• No spam, self-promotion, or inappropriate content</li>
            <li>• Report any concerns to our moderation team</li>
          </ul>
        </div>
      </div>
    </div>
  );
}