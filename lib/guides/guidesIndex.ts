import { GuideCategory } from '@/lib/guides/guidesTemplates';

export type GuideIndexEntry = {
  slug: string;
  category: GuideCategory;
  entityId: string;
  entityName: string;
};

export type ExploreGuidesBlock = {
  hubCategory: GuideCategory;
  heading: string;
  links: Array<{ label: string; href: string }>;
};

export const exploreGuidesBlocks: ExploreGuidesBlock[] = [
  {
    hubCategory: 'birds',
    heading: 'Explore guides',
    links: [
      { label: 'Cockatiel diet: safe foods & routine', href: '/guides/birds/cockatiel-diet' },
      { label: 'Budgie (parakeet) diet basics', href: '/guides/birds/budgie-parakeet-diet' },
      { label: 'Finch feeding basics', href: '/guides/birds/finch-diet' },
      { label: 'Lovebird diet guide', href: '/guides/birds/lovebird-diet' },
      { label: 'Conure diet guide', href: '/guides/birds/conure-diet' },
    ],
  },
  {
    hubCategory: 'reptiles',
    heading: 'Explore guides',
    links: [
      { label: 'Bearded dragon feeding schedule', href: '/guides/reptiles/bearded-dragon-feeding-schedule' },
      { label: 'Leopard gecko diet basics', href: '/guides/reptiles/leopard-gecko-diet' },
      { label: 'Turtle diet basics', href: '/guides/reptiles/turtle-diet' },
      { label: 'Tortoise diet basics', href: '/guides/reptiles/tortoise-diet' },
      { label: 'Crested gecko diet basics', href: '/guides/reptiles/crested-gecko-diet' },
    ],
  },
  {
    hubCategory: 'pocket-pets',
    heading: 'Explore guides',
    links: [
      { label: 'Hamster safe foods list', href: '/guides/pocket-pets/hamster-safe-foods' },
      { label: 'Guinea pig diet guide', href: '/guides/pocket-pets/guinea-pig-diet' },
      { label: 'Rabbit hay-first diet', href: '/guides/pocket-pets/rabbit-diet' },
      { label: 'Chinchilla diet basics', href: '/guides/pocket-pets/chinchilla-diet' },
      { label: 'Hedgehog diet basics', href: '/guides/pocket-pets/hedgehog-diet' },
    ],
  },
  {
    hubCategory: 'dogs',
    heading: 'Explore guides',
    links: [
      { label: 'Golden Retriever feeding guide', href: '/guides/dogs/golden-retriever-feeding-guide' },
      { label: 'Labrador feeding guide', href: '/guides/dogs/labrador-feeding-guide' },
      { label: 'German Shepherd feeding guide', href: '/guides/dogs/german-shepherd-feeding-guide' },
      { label: 'Beagle feeding guide', href: '/guides/dogs/beagle-feeding-guide' },
      { label: 'Dachshund feeding guide', href: '/guides/dogs/dachshund-feeding-guide' },
    ],
  },
  {
    hubCategory: 'cats',
    heading: 'Explore guides',
    links: [
      { label: 'Maine Coon feeding guide', href: '/guides/cats/maine-coon-feeding-guide' },
      { label: 'Siamese feeding guide', href: '/guides/cats/siamese-feeding-guide' },
      { label: 'Ragdoll feeding guide', href: '/guides/cats/ragdoll-feeding-guide' },
      { label: 'Bengal feeding guide', href: '/guides/cats/bengal-feeding-guide' },
      { label: 'Sphynx feeding guide', href: '/guides/cats/sphynx-feeding-guide' },
    ],
  },
];

export const guidesIndex: GuideIndexEntry[] = [
  { slug: '/guides/dogs/golden-retriever-feeding-guide', category: 'dogs', entityId: 'golden-retriever', entityName: 'Golden Retriever' },
  { slug: '/guides/dogs/labrador-feeding-guide', category: 'dogs', entityId: 'labrador', entityName: 'Labrador Retriever' },
  { slug: '/guides/dogs/german-shepherd-feeding-guide', category: 'dogs', entityId: 'german-shepherd', entityName: 'German Shepherd' },
  { slug: '/guides/dogs/bulldog-feeding-guide', category: 'dogs', entityId: 'bulldog', entityName: 'Bulldog' },
  { slug: '/guides/dogs/poodle-feeding-guide', category: 'dogs', entityId: 'poodle', entityName: 'Poodle' },
  { slug: '/guides/dogs/beagle-feeding-guide', category: 'dogs', entityId: 'beagle', entityName: 'Beagle' },
  { slug: '/guides/dogs/rottweiler-feeding-guide', category: 'dogs', entityId: 'rottweiler', entityName: 'Rottweiler' },
  { slug: '/guides/dogs/yorkie-feeding-guide', category: 'dogs', entityId: 'yorkie', entityName: 'Yorkshire Terrier' },
  { slug: '/guides/dogs/boxer-feeding-guide', category: 'dogs', entityId: 'boxer', entityName: 'Boxer' },
  { slug: '/guides/dogs/dachshund-feeding-guide', category: 'dogs', entityId: 'dachshund', entityName: 'Dachshund' },
  { slug: '/guides/dogs/mixed-dog-feeding-guide', category: 'dogs', entityId: 'mixed-dog', entityName: 'Mixed Breed Dog' },
  { slug: '/guides/dogs/other-dog-feeding-guide', category: 'dogs', entityId: 'other-dog', entityName: 'Other Dog' },

  { slug: '/guides/cats/domestic-shorthair-feeding-guide', category: 'cats', entityId: 'domestic-shorthair', entityName: 'Domestic Shorthair' },
  { slug: '/guides/cats/persian-feeding-guide', category: 'cats', entityId: 'persian', entityName: 'Persian' },
  { slug: '/guides/cats/maine-coon-feeding-guide', category: 'cats', entityId: 'maine-coon', entityName: 'Maine Coon' },
  { slug: '/guides/cats/siamese-feeding-guide', category: 'cats', entityId: 'siamese', entityName: 'Siamese' },
  { slug: '/guides/cats/ragdoll-feeding-guide', category: 'cats', entityId: 'ragdoll', entityName: 'Ragdoll' },
  { slug: '/guides/cats/bengal-feeding-guide', category: 'cats', entityId: 'bengal', entityName: 'Bengal' },
  { slug: '/guides/cats/sphynx-feeding-guide', category: 'cats', entityId: 'sphynx', entityName: 'Sphynx' },
  { slug: '/guides/cats/british-shorthair-feeding-guide', category: 'cats', entityId: 'british-shorthair', entityName: 'British Shorthair' },
  { slug: '/guides/cats/abyssinian-feeding-guide', category: 'cats', entityId: 'abyssinian', entityName: 'Abyssinian' },
  { slug: '/guides/cats/mixed-cat-feeding-guide', category: 'cats', entityId: 'mixed-cat', entityName: 'Mixed Breed Cat' },
  { slug: '/guides/cats/other-cat-feeding-guide', category: 'cats', entityId: 'other-cat', entityName: 'Other Cat' },

  { slug: '/guides/birds/budgie-parakeet-diet', category: 'birds', entityId: 'parakeet-budgie', entityName: 'Parakeet (Budgie)' },
  { slug: '/guides/birds/cockatiel-diet', category: 'birds', entityId: 'cockatiel', entityName: 'Cockatiel' },
  { slug: '/guides/birds/canary-diet', category: 'birds', entityId: 'canary', entityName: 'Canary' },
  { slug: '/guides/birds/finch-diet', category: 'birds', entityId: 'finch', entityName: 'Finch' },
  { slug: '/guides/birds/african-grey-diet', category: 'birds', entityId: 'african-grey', entityName: 'African Grey' },
  { slug: '/guides/birds/macaw-diet', category: 'birds', entityId: 'macaw', entityName: 'Macaw' },
  { slug: '/guides/birds/quaker-parakeet-diet', category: 'birds', entityId: 'quaker-parakeet', entityName: 'Quaker Parakeet' },
  { slug: '/guides/birds/cockatoo-diet', category: 'birds', entityId: 'cockatoo', entityName: 'Cockatoo' },
  { slug: '/guides/birds/conure-diet', category: 'birds', entityId: 'conure', entityName: 'Conure' },
  { slug: '/guides/birds/lovebird-diet', category: 'birds', entityId: 'lovebird', entityName: 'Lovebird' },
  { slug: '/guides/birds/other-bird-diet', category: 'birds', entityId: 'other-bird', entityName: 'Other Bird' },

  { slug: '/guides/reptiles/bearded-dragon-feeding-schedule', category: 'reptiles', entityId: 'bearded-dragon', entityName: 'Bearded Dragon' },
  { slug: '/guides/reptiles/leopard-gecko-diet', category: 'reptiles', entityId: 'leopard-gecko', entityName: 'Leopard Gecko' },
  { slug: '/guides/reptiles/turtle-diet', category: 'reptiles', entityId: 'turtle', entityName: 'Turtle (Aquatic)' },
  { slug: '/guides/reptiles/tortoise-diet', category: 'reptiles', entityId: 'tortoise', entityName: 'Tortoise' },
  { slug: '/guides/reptiles/crested-gecko-diet', category: 'reptiles', entityId: 'crested-gecko', entityName: 'Crested Gecko' },
  { slug: '/guides/reptiles/iguana-diet', category: 'reptiles', entityId: 'iguana', entityName: 'Iguana' },
  { slug: '/guides/reptiles/chameleon-diet', category: 'reptiles', entityId: 'chameleon', entityName: 'Chameleon' },
  { slug: '/guides/reptiles/other-reptile-diet', category: 'reptiles', entityId: 'other-reptile', entityName: 'Other Reptile' },

  { slug: '/guides/pocket-pets/hamster-safe-foods', category: 'pocket-pets', entityId: 'hamster', entityName: 'Hamster' },
  { slug: '/guides/pocket-pets/guinea-pig-diet', category: 'pocket-pets', entityId: 'guinea-pig', entityName: 'Guinea Pig' },
  { slug: '/guides/pocket-pets/rabbit-diet', category: 'pocket-pets', entityId: 'rabbit', entityName: 'Rabbit' },
  { slug: '/guides/pocket-pets/rat-diet', category: 'pocket-pets', entityId: 'rat', entityName: 'Rat' },
  { slug: '/guides/pocket-pets/mouse-diet', category: 'pocket-pets', entityId: 'mouse', entityName: 'Mouse' },
  { slug: '/guides/pocket-pets/gerbil-diet', category: 'pocket-pets', entityId: 'gerbil', entityName: 'Gerbil' },
  { slug: '/guides/pocket-pets/ferret-diet', category: 'pocket-pets', entityId: 'ferret', entityName: 'Ferret' },
  { slug: '/guides/pocket-pets/chinchilla-diet', category: 'pocket-pets', entityId: 'chinchilla', entityName: 'Chinchilla' },
  { slug: '/guides/pocket-pets/sugar-glider-diet', category: 'pocket-pets', entityId: 'sugar-glider', entityName: 'Sugar Glider' },
  { slug: '/guides/pocket-pets/hedgehog-diet', category: 'pocket-pets', entityId: 'hedgehog', entityName: 'Hedgehog' },
  { slug: '/guides/pocket-pets/other-pocket-pet-diet', category: 'pocket-pets', entityId: 'other-pocket-pet', entityName: 'Other Pocket Pet' },
];
