export type BlogIndexEntry = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
};

export const blogIndex: BlogIndexEntry[] = [
  {
    slug: '/blog/complete-guide-homemade-dog-food',
    title: 'The Complete Guide to Homemade Dog Food: What Every Pet Parent Needs to Know',
    excerpt:
      'Learn how to safely transition your dog to homemade meals while ensuring complete nutrition. Our pet health specialist-approved guide covers everything from ingredient selection to portion calculations.',
    author: 'Dr. Sarah Mitchell, DVM',
    date: '2024-11-20',
    readTime: '8 min read',
    category: 'Nutrition',
  },
  {
    slug: '/blog/cat-nutrition-myths-debunked',
    title: 'Cat Nutrition Myths Debunked: Separating Fact from Fiction',
    excerpt:
      'From "cats need milk" to "raw diets are dangerous," we examine common misconceptions about feline nutrition and provide evidence-based guidance.',
    author: 'Dr. Michael Chen, Pet Health Specialist',
    date: '2024-11-18',
    readTime: '6 min read',
    category: 'Myths',
  },
  {
    slug: '/blog/fresh-pet-food-market-trends',
    title: 'The Rise of Fresh Pet Food: Market Trends and What They Mean for Your Pet',
    excerpt:
      'The pet food industry is undergoing a revolution. Discover the latest trends in fresh, human-grade pet nutrition and how to choose the best options.',
    author: 'Emma Rodriguez, Pet Industry Analyst',
    date: '2024-11-15',
    readTime: '5 min read',
    category: 'Industry',
  },
  {
    slug: '/blog/supplements-every-pet-needs',
    title: 'Essential Supplements Every Pet Needs (And Why)',
    excerpt:
      'Not all pets need supplements, but many benefit from targeted nutritional support. Learn which supplements are essential and how to choose quality products.',
    author: 'Dr. James Park, Pet Health Researcher',
    date: '2024-11-12',
    readTime: '7 min read',
    category: 'Supplements',
  },
  {
    slug: '/blog/reading-pet-food-labels',
    title: 'How to Read Pet Food Labels Like a Pro',
    excerpt:
      'Pet food labels can be confusing, but they contain crucial information about nutrition. Master the art of label reading to make informed choices.',
    author: 'Lisa Thompson, Pet Nutrition Consultant',
    date: '2024-11-10',
    readTime: '4 min read',
    category: 'Education',
  },
  {
    slug: '/blog/seasonal-pet-nutrition',
    title: 'Seasonal Pet Nutrition: Adjusting Diets for Winter, Summer, and Everything In Between',
    excerpt:
      "Your pet's nutritional needs change with the seasons. Learn how to adjust their diet for optimal health year-round.",
    author: 'Dr. Rachel Green, Holistic Veterinarian',
    date: '2024-11-08',
    readTime: '6 min read',
    category: 'Seasonal',
  },
];
