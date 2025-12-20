/**
 * NEW RECIPE URLs - Filtered for measured ingredients/structured recipes
 * These are URLs not yet in bulk-recipe-urls.ts
 */

export interface NewRecipeSource {
  species: string[];
  urls: string[];
}

export const NEW_RECIPE_URLS: NewRecipeSource[] = [
  // REPTILES - Measured/Structured Diet Pages
  {
    species: ['reptiles'],
    urls: [
      // Ball Python PDFs with feeding schedules
      'https://amccorona.com/wp-content/uploads/2020/05/ARAV_trifold_ball_pythonv2_2.pdf',
      'https://www.caringanimalhospital.net/storage/app/media/ArchivedDocs/ball-pythons-handout-pdf.pdf',
      // Care sheets with structured diet lists
      'https://reptifiles.com/corn-snake-care-sheet/',
      'https://reptifiles.com/california-kingsnake-care-sheet/',
      'https://www.swiftailvet.com/library/boa-constrictor-care/',
      'https://mazuri.com/products/mazuri-aquatic-herbivorous-reef-gel-block',
      'https://reptifiles.com/tortoise-care-sheet/',
      'https://reptifiles.com/crested-gecko-care-sheet/',
      'https://reptifiles.com/green-iguana-care-sheet/',
      'https://reptifiles.com/veiled-chameleon-care-sheet/',
      'https://reptifiles.com/jacksons-chameleon-care-sheet/',
      // Structured feeding lists
      'https://reptileencounters.com/news/what-do-reptiles-eat',
    ],
  },
  
  // POCKET PETS - VCA Hospital Structured Guides + Recipe Forums
  {
    species: ['pocket-pets'],
    urls: [
      // VCA Hospital structured feeding guides
      'https://vcahospitals.com/know-your-pet/rats-feeding',
      'https://vcahospitals.com/know-your-pet/mice-feeding',
      'https://vcahospitals.com/know-your-pet/gerbils-feeding',
      'https://vcahospitals.com/know-your-pet/chinchillas-feeding',
      'https://vcahospitals.com/know-your-pet/hedgehogs-feeding',
      // Sugar Glider measured diet recipes (BML/HPW)
      'https://www.sugarglider.com/glidergossip/topic/1695-bml-diet/',
      'https://info.petsugargliders.com/staple-diets/hpw-diet/',
      'https://www.thesprucepets.com/bml-diet-for-sugar-gliders-5105257',
      'https://bmldiet.com/bml-recipe.html',
      // Rat homemade food recipe forum
      'https://www.ratshackforum.com/threads/home-made-rat-food-d.11712/',
    ],
  },
];

export function getAllNewRecipeUrls(): string[] {
  return NEW_RECIPE_URLS.flatMap(source => source.urls);
}

export function getNewRecipeUrlsBySpecies(species: string): string[] {
  return NEW_RECIPE_URLS
    .filter(source => source.species.includes(species))
    .flatMap(source => source.urls);
}
