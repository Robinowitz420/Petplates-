export interface Supplement {
  name: string;
  description: string;
  benefits: string;
  amazonLink?: string;
}

export interface HealthConcernSupplements {
  [concern: string]: Supplement[];
}

export interface PetSupplements {
  [species: string]: HealthConcernSupplements;
}

export const petSupplements: PetSupplements = {
  dogs: {
    'allergy-support': [
      {
        name: 'Omega-3 Fatty Acids',
        description: 'High-quality fish body oil (salmon/sardine/anchovy) supplements (not cod liver oil)',
        benefits: 'Reduces inflammation and supports immune response',
        amazonLink: 'https://www.amazon.com/dp/B00CBY93XS?tag=robinfrench-20'
      },
      {
        name: 'Quercetin',
        description: 'Natural antihistamine supplement',
        benefits: 'Helps manage allergic reactions and inflammation',
        amazonLink: 'https://www.amazon.com/s?k=dog+quercetin+supplement'
      },
      {
        name: 'Curcumin (Turmeric)',
        description: 'Turmeric extract with enhanced bioavailability',
        benefits: 'Powerful anti-inflammatory properties',
        amazonLink: 'https://www.amazon.com/s?k=dog+curcumin+supplement'
      },
      {
        name: 'Probiotics',
        description: 'Gut health supplements for dogs',
        benefits: 'Supports digestive health and immune function',
        amazonLink: 'https://www.amazon.com/s?k=dog+probiotics'
      }
    ],
    'weight-management': [
      {
        name: 'L-Carnitine',
        description: 'Amino acid supplement for metabolism',
        benefits: 'Supports fat metabolism and energy production',
        amazonLink: 'https://www.amazon.com/s?k=dog+l+carnitine+supplement'
      },
      {
        name: 'Fiber Supplements',
        description: 'Psyllium husk or other fiber sources',
        benefits: 'Promotes satiety and digestive health',
        amazonLink: 'https://www.amazon.com/s?k=dog+fiber+supplement'
      }
    ],
    'digestive-health': [
      {
        name: 'Probiotics',
        description: 'Beneficial bacteria supplements',
        benefits: 'Restores gut microbiome balance',
        amazonLink: 'https://www.amazon.com/s?k=dog+probiotics'
      },
      {
        name: 'Digestive Enzymes',
        description: 'Enzyme supplements for better digestion',
        benefits: 'Aids in breaking down food components',
        amazonLink: 'https://www.amazon.com/s?k=dog+digestive+enzymes'
      },
      {
        name: 'Pumpkin Powder',
        description: 'Natural fiber source',
        benefits: 'Supports digestive regularity',
        amazonLink: 'https://www.amazon.com/s?k=dog+pumpkin+powder'
      }
    ],
    'joint-mobility': [
      {
        name: 'Glucosamine & Chondroitin',
        description: 'Joint health supplements',
        benefits: 'Supports cartilage health and joint mobility',
        amazonLink: 'https://www.amazon.com/s?k=dog+glucosamine+chondroitin'
      },
      {
        name: 'Green-Lipped Mussel',
        description: 'Natural joint supplement',
        benefits: 'Provides omega-3s and glycosaminoglycans',
        amazonLink: 'https://www.amazon.com/s?k=dog+green+lipped+mussel'
      },
      {
        name: 'MSM (Methylsulfonylmethane)',
        description: 'Sulfur compound for joints',
        benefits: 'Supports connective tissue health',
        amazonLink: 'https://www.amazon.com/s?k=dog+msm+supplement'
      }
    ],
    'skin-coat': [
      {
        name: 'Salmon Oil',
        description: 'Omega-3 rich fish oil',
        benefits: 'Promotes healthy skin and shiny coat',
        amazonLink: 'https://www.amazon.com/dp/B00CBY93XS?tag=robinfrench-20'
      },
      {
        name: 'Biotin',
        description: 'Vitamin B7 supplement',
        benefits: 'Supports hair growth and coat quality',
        amazonLink: 'https://www.amazon.com/s?k=dog+biotin+supplement'
      },
      {
        name: 'Vitamin E',
        description: 'Antioxidant vitamin',
        benefits: 'Protects skin cells and supports healing',
        amazonLink: 'https://www.amazon.com/s?k=dog+vitamin+e'
      }
    ],
    'dental-health': [
      {
        name: 'Dental Chews',
        description: 'Enzymatic dental treats',
        benefits: 'Reduces plaque and tartar buildup',
        amazonLink: 'https://www.amazon.com/s?k=dog+dental+chews'
      },
      {
        name: 'Oral Probiotics',
        description: 'Probiotics for oral health',
        benefits: 'Maintains healthy oral microbiome',
        amazonLink: 'https://www.amazon.com/s?k=dog+oral+probiotics'
      }
    ],
    'kidney-urinary': [
      {
        name: 'Kidney Support Supplements',
        description: 'Antioxidant blends for kidney health',
        benefits: 'Supports kidney function and urinary health',
        amazonLink: 'https://www.amazon.com/s?k=dog+kidney+support+supplement'
      },
      {
        name: 'Cranberry Extract',
        description: 'Urinary tract support',
        benefits: 'Promotes urinary tract health',
        amazonLink: 'https://www.amazon.com/s?k=dog+cranberry+supplement'
      }
    ]
  },
  cats: {
    'allergy-support': [
      {
        name: 'Omega-3 Fatty Acids',
        description: 'High-quality fish body oil (salmon/sardine/anchovy) supplements (not cod liver oil)',
        benefits: 'Reduces inflammation and supports skin health',
        amazonLink: 'https://www.amazon.com/dp/B00CBY93XS?tag=robinfrench-20'
      },
      {
        name: 'Quercetin',
        description: 'Natural antihistamine for cats',
        benefits: 'Helps manage allergic reactions',
        amazonLink: 'https://www.amazon.com/s?k=cat+quercetin+supplement'
      },
      {
        name: 'Curcumin',
        description: 'Turmeric extract for cats',
        benefits: 'Anti-inflammatory properties',
        amazonLink: 'https://www.amazon.com/s?k=cat+curcumin+supplement'
      }
    ],
    'weight-management': [
      {
        name: 'L-Carnitine',
        description: 'Metabolism support for cats',
        benefits: 'Supports fat metabolism',
        amazonLink: 'https://www.amazon.com/s?k=cat+l+carnitine+supplement'
      },
      {
        name: 'Fiber Supplements',
        description: 'Cat-safe fiber sources',
        benefits: 'Promotes healthy weight management',
        amazonLink: 'https://www.amazon.com/s?k=cat+fiber+supplement'
      }
    ],
    'digestive-health': [
      {
        name: 'Cat Probiotics',
        description: 'Probiotic supplements for cats',
        benefits: 'Supports digestive and immune health',
        amazonLink: 'https://www.amazon.com/s?k=cat+probiotics'
      },
      {
        name: 'Hairball Remedies',
        description: 'Hairball control supplements',
        benefits: 'Prevents and manages hairballs',
        amazonLink: 'https://www.amazon.com/s?k=cat+hairball+supplement'
      },
      {
        name: 'Digestive Enzymes',
        description: 'Enzyme supplements for cats',
        benefits: 'Aids in food digestion',
        amazonLink: 'https://www.amazon.com/s?k=cat+digestive+enzymes'
      }
    ],
    'joint-mobility': [
      {
        name: 'Glucosamine for Cats',
        description: 'Joint supplements formulated for cats',
        benefits: 'Supports joint health and mobility',
        amazonLink: 'https://www.amazon.com/dp/B0FBTC5HSV?tag=robinfrench-20'
      },
      {
        name: 'Chondroitin',
        description: 'Cartilage support supplement',
        benefits: 'Maintains joint cartilage',
        amazonLink: 'https://www.amazon.com/s?k=cat+chondroitin+supplement'
      }
    ],
    'skin-coat': [
      {
        name: 'Salmon Oil for Cats',
        description: 'Omega-3 supplements for cats',
        benefits: 'Promotes healthy skin and coat',
        amazonLink: 'https://www.amazon.com/dp/B00CBY93XS?tag=robinfrench-20'
      },
      {
        name: 'Vitamin E',
        description: 'Antioxidant for skin health',
        benefits: 'Supports skin healing and coat quality',
        amazonLink: 'https://www.amazon.com/s?k=cat+vitamin+e+supplement'
      },
      {
        name: 'Biotin',
        description: 'Vitamin B7 for cats',
        benefits: 'Supports hair growth and skin health',
        amazonLink: 'https://www.amazon.com/s?k=cat+biotin+supplement'
      }
    ],
    'dental-health': [
      {
        name: 'Cat Dental Chews',
        description: 'Dental treats for cats',
        benefits: 'Reduces plaque and promotes oral health',
        amazonLink: 'https://www.amazon.com/s?k=cat+dental+chews'
      },
      {
        name: 'Oral Probiotics for Cats',
        description: 'Oral health probiotics',
        benefits: 'Maintains healthy oral microbiome',
        amazonLink: 'https://www.amazon.com/s?k=cat+oral+probiotics'
      }
    ],
    'kidney-urinary': [
      {
        name: 'Kidney Support for Cats',
        description: 'Supplements for feline kidney health',
        benefits: 'Supports kidney function with appropriate nutrients',
        amazonLink: 'https://www.amazon.com/s?k=cat+kidney+support+supplement'
      },
      {
        name: 'Cranberry Extract for Cats',
        description: 'Urinary tract support',
        benefits: 'Promotes urinary tract health',
        amazonLink: 'https://www.amazon.com/s?k=cat+cranberry+supplement'
      }
    ]
  },
  birds: {
    'digestive-health': [
      {
        name: 'Avian Probiotics',
        description: 'Probiotics formulated for birds',
        benefits: 'Supports digestive health and nutrient absorption',
        amazonLink: 'https://www.amazon.com/s?k=bird+probiotics'
      },
      {
        name: 'Calcium Supplements',
        description: 'Calcium for egg-laying birds',
        benefits: 'Supports bone health and eggshell quality',
        amazonLink: 'https://www.amazon.com/s?k=bird+calcium+supplement'
      }
    ],
    'skin-coat': [
      {
        name: 'Feather Supplements',
        description: 'Molt support with vitamins',
        benefits: 'Supports feather health and molting',
        amazonLink: 'https://www.amazon.com/s?k=bird+feather+supplement'
      },
      {
        name: 'Omega Fatty Acids',
        description: 'Essential fatty acids for birds',
        benefits: 'Promotes healthy skin and feather condition',
        amazonLink: 'https://www.amazon.com/s?k=bird+omega+supplement'
      }
    ],
    'dental-health': [
      {
        name: 'Cuttlebone',
        description: 'Natural calcium source',
        benefits: 'Supports beak health and calcium intake',
        amazonLink: 'https://www.amazon.com/s?k=bird+cuttlebone'
      },
      {
        name: 'Mineral Blocks',
        description: 'Mineral supplements for birds',
        benefits: 'Provides essential minerals for beak maintenance',
        amazonLink: 'https://www.amazon.com/s?k=bird+mineral+block'
      }
    ]
  },
  reptiles: {
    'digestive-health': [
      {
        name: 'Reptile Probiotics',
        description: 'Probiotic supplements for reptiles',
        benefits: 'Supports digestive health and gut flora',
        amazonLink: 'https://www.amazon.com/s?k=reptile+probiotics'
      },
      {
        name: 'Gut Load Supplements',
        description: 'Supplements for feeder insects',
        benefits: 'Provides nutrition to reptile food sources',
        amazonLink: 'https://www.amazon.com/s?k=gut+load+supplement'
      }
    ],
    'joint-mobility': [
      {
        name: 'Calcium with Vitamin D3',
        description: 'Calcium supplements for reptiles',
        benefits: 'Supports bone health and prevents metabolic bone disease',
        amazonLink: 'https://www.amazon.com/s?k=reptile+calcium+vitamin+d3'
      },
      {
        name: 'Vitamin A Supplements',
        description: 'Vitamin A for reptiles',
        benefits: 'Supports tissue health and immune function',
        amazonLink: 'https://www.amazon.com/s?k=reptile+vitamin+a+supplement'
      }
    ],
    'skin-coat': [
      {
        name: 'Vitamin A',
        description: 'Vitamin A supplements',
        benefits: 'Supports skin shedding and tissue health',
        amazonLink: 'https://www.amazon.com/s?k=reptile+vitamin+a'
      },
      {
        name: 'Humidity Supplements',
        description: 'Products to support humidity needs',
        benefits: 'Aids in proper shedding and skin health',
        amazonLink: 'https://www.amazon.com/s?k=reptile+humidity+supplement'
      }
    ]
  },
  'pocket-pets': {
    'digestive-health': [
      {
        name: 'Rodent Probiotics',
        description: 'Probiotics for small pets',
        benefits: 'Supports digestive health and gut microbiome',
        amazonLink: 'https://www.amazon.com/s?k=small+pet+probiotics'
      },
      {
        name: 'Soluble Fiber',
        description: 'Fiber supplements like oat bran',
        benefits: 'Promotes digestive regularity',
        amazonLink: 'https://www.amazon.com/s?k=small+pet+fiber+supplement'
      }
    ],
    'skin-coat': [
      {
        name: 'Omega Fatty Acids',
        description: 'Essential fatty acids for small pets',
        benefits: 'Supports healthy skin and coat',
        amazonLink: 'https://www.amazon.com/s?k=small+pet+omega+supplement'
      },
      {
        name: 'Vitamin E',
        description: 'Antioxidant vitamin',
        benefits: 'Supports skin health and healing',
        amazonLink: 'https://www.amazon.com/s?k=small+pet+vitamin+e'
      },
      {
        name: 'Biotin',
        description: 'Vitamin B7 supplement',
        benefits: 'Supports hair growth and coat quality',
        amazonLink: 'https://www.amazon.com/s?k=small+pet+biotin'
      }
    ],
    'dental-health': [
      {
        name: 'Mineral Blocks',
        description: 'Chewable mineral supplements',
        benefits: 'Supports dental health through natural chewing',
        amazonLink: 'https://www.amazon.com/s?k=small+pet+mineral+block'
      },
      {
        name: 'Chew Toys',
        description: 'Dental chews and toys',
        benefits: 'Promotes dental wear and oral health',
        amazonLink: 'https://www.amazon.com/s?k=small+pet+chew+toys'
      }
    ]
  }
};