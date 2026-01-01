export type TenPageGuideEntry = {
  species: 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';
  slug: string;
  title: string;
};

export const TEN_PAGE_GUIDES: TenPageGuideEntry[] = [
  {
    species: 'dogs',
    slug: '/guides/dogs/can-dogs-eat-garlic',
    title: 'Can dogs eat garlic?',
  },
  {
    species: 'dogs',
    slug: '/guides/dogs/homemade-dog-food-for-pancreatitis',
    title: 'Homemade dog food for pancreatitis',
  },
  {
    species: 'cats',
    slug: '/guides/cats/can-cats-eat-tuna-every-day',
    title: 'Can cats eat tuna every day?',
  },
  {
    species: 'cats',
    slug: '/guides/cats/homemade-cat-food-for-kidney-disease',
    title: 'Homemade cat food for kidney disease (CKD)',
  },
  {
    species: 'birds',
    slug: '/guides/birds/is-avocado-toxic-to-birds',
    title: 'Is avocado toxic to birds?',
  },
  {
    species: 'birds',
    slug: '/guides/birds/pellets-vs-seeds-for-birds',
    title: 'Pellets vs seeds for pet birds',
  },
  {
    species: 'reptiles',
    slug: '/guides/reptiles/can-bearded-dragons-eat-spinach',
    title: 'Can bearded dragons eat spinach?',
  },
  {
    species: 'reptiles',
    slug: '/guides/reptiles/reptile-calcium-basics',
    title: 'Reptile calcium basics',
  },
  {
    species: 'pocket-pets',
    slug: '/guides/pocket-pets/can-rabbits-eat-iceberg-lettuce',
    title: 'Can rabbits eat iceberg lettuce?',
  },
  {
    species: 'pocket-pets',
    slug: '/guides/pocket-pets/budget-friendly-guinea-pig-grocery-list',
    title: 'Budget-friendly guinea pig grocery list',
  },
];
