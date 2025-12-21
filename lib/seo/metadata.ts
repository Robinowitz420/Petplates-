// SEO Metadata Configurations for Key Pages
import { Metadata } from 'next';

const baseUrl = 'https://petplatesmealplatform-ldvstwjsy-plateandpaw.vercel.app';

// Helper to generate structured data for recipes
export function generateRecipeStructuredData(recipe: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": recipe.name,
    "description": recipe.description,
    "image": recipe.imageUrl ? `${baseUrl}${recipe.imageUrl}` : undefined,
    "prepTime": recipe.prepTime,
    "cookTime": recipe.cookTime,
    "recipeYield": `${recipe.servings} servings`,
    "recipeCategory": "Pet Food",
    "recipeCuisine": "Pet Nutrition",
    "keywords": `${recipe.category} food, homemade pet food, ${recipe.name}`,
    "recipeIngredient": recipe.ingredients?.map((i: any) => i.name) || [],
    "recipeInstructions": recipe.instructions?.map((step: string, idx: number) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "text": step
    })) || [],
    "author": {
      "@type": "Organization",
      "name": "Paws & Plates"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  };
}

// Page-specific metadata configurations
export const pageMetadata: Record<string, Metadata> = {
  home: {
    title: 'Paws & Plates - Fresh Meal Prep for Dogs, Cats, Birds, Reptiles & Small Pets',
    description: 'Free vet-approved meal plans for ALL your pets. Custom recipes for dogs, cats, birds, reptiles, and pocket pets with one-click Amazon ingredient ordering. AAFCO & WSAVA compliant.',
    keywords: ['homemade dog food', 'homemade cat food', 'DIY pet meals', 'pet meal prep', 'fresh pet food recipes'],
    openGraph: {
      title: 'Paws & Plates - Fresh Meal Prep for All Pets',
      description: 'Free vet-approved meal plans with one-click Amazon ingredient ordering',
    },
  },
  
  dogs: {
    title: 'Homemade Dog Food Recipes - Vet-Approved & AAFCO Compliant',
    description: 'Free custom dog food recipes for all breeds, ages, and health needs. AAFCO compliant nutrition with Amazon ingredient links. Puppy, adult, and senior meal plans.',
    keywords: ['homemade dog food', 'dog food recipes', 'puppy food recipes', 'senior dog food', 'healthy dog meals'],
    openGraph: {
      title: 'Homemade Dog Food Recipes - Vet-Approved',
      description: 'AAFCO compliant dog food recipes for all breeds and ages',
    },
  },
  
  cats: {
    title: 'Homemade Cat Food Recipes - Vet-Approved & Balanced',
    description: 'Free custom cat food recipes for all breeds and ages. AAFCO compliant nutrition with Amazon ingredient links. Kitten, adult, and senior meal plans.',
    keywords: ['homemade cat food', 'cat food recipes', 'kitten food recipes', 'senior cat food', 'healthy cat meals'],
    openGraph: {
      title: 'Homemade Cat Food Recipes - Vet-Approved',
      description: 'AAFCO compliant cat food recipes for all breeds and ages',
    },
  },
  
  birds: {
    title: 'Bird Food Recipes & Diet Plans - Parrot, Parakeet, Cockatiel Nutrition',
    description: 'Custom bird diet plans for parrots, parakeets, cockatiels, and more. Evidence-based avian nutrition with ingredient shopping links.',
    keywords: ['bird food recipes', 'parrot diet', 'parakeet food', 'cockatiel nutrition', 'homemade bird food'],
    openGraph: {
      title: 'Bird Food Recipes - Avian Nutrition Plans',
      description: 'Evidence-based diet plans for parrots, parakeets, and more',
    },
  },
  
  reptiles: {
    title: 'Reptile Diet Plans - Bearded Dragon, Gecko, Snake Nutrition',
    description: 'Custom reptile diet plans for bearded dragons, geckos, snakes, and more. Species-specific nutrition with ingredient links.',
    keywords: ['reptile diet', 'bearded dragon food', 'gecko diet', 'snake feeding', 'reptile nutrition'],
    openGraph: {
      title: 'Reptile Diet Plans - Species-Specific Nutrition',
      description: 'Custom diet plans for bearded dragons, geckos, snakes, and more',
    },
  },
  
  'pocket-pets': {
    title: 'Small Pet Food Recipes - Hamster, Rabbit, Guinea Pig Nutrition',
    description: 'Custom diet plans for rabbits, hamsters, guinea pigs, ferrets, and more. Small pet nutrition with ingredient shopping links.',
    keywords: ['rabbit food', 'hamster diet', 'guinea pig nutrition', 'ferret food', 'small pet recipes'],
    openGraph: {
      title: 'Small Pet Food Recipes - Hamster, Rabbit, Guinea Pig',
      description: 'Custom diet plans for rabbits, hamsters, guinea pigs, and more',
    },
  },
  
  blog: {
    title: 'Pet Nutrition Blog - Meal Prep Tips & Recipes',
    description: 'Expert pet nutrition advice, homemade food recipes, and meal prep tips for dogs, cats, birds, reptiles, and small pets.',
    keywords: ['pet nutrition blog', 'pet food tips', 'homemade pet food advice', 'pet meal prep'],
    openGraph: {
      title: 'Pet Nutrition Blog - Expert Advice & Recipes',
      description: 'Expert pet nutrition advice and homemade food recipes',
    },
  },
  
  faq: {
    title: 'FAQ - Common Questions About Pet Meal Prep',
    description: 'Frequently asked questions about homemade pet food, nutrition guidelines, AAFCO compliance, and meal prep for dogs, cats, birds, reptiles, and small pets.',
    keywords: ['pet food FAQ', 'homemade pet food questions', 'AAFCO guidelines', 'pet nutrition FAQ'],
    openGraph: {
      title: 'FAQ - Pet Meal Prep Questions Answered',
      description: 'Common questions about homemade pet food and nutrition',
    },
  },
  
  contact: {
    title: 'Contact Us - Paws & Plates Support',
    description: 'Get in touch with the Paws & Plates team. Questions about pet nutrition, meal plans, or account support.',
    keywords: ['contact pet nutrition', 'Paws & Plates support', 'pet food questions'],
    openGraph: {
      title: 'Contact Paws & Plates',
      description: 'Get in touch with our pet nutrition team',
    },
  },
};

// Generate organization structured data
export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Paws & Plates",
  "description": "Free vet-approved meal plans for dogs, cats, birds, reptiles, and pocket pets",
  "url": baseUrl,
  "logo": `${baseUrl}/images/emojis/Mascots/HeroPics/HeroBanner-v3.png`,
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "support@pawandplate.com"
  },
  "sameAs": [
    // Add your social media profiles here when you have them
    // "https://facebook.com/pawandplate",
    // "https://twitter.com/pawandplate",
    // "https://instagram.com/pawandplate",
  ]
};

// Generate FAQ structured data for FAQ page
export function generateFAQStructuredData(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${baseUrl}${item.url}`
    }))
  };
}

