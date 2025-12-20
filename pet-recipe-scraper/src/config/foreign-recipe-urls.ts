/**
 * FOREIGN LANGUAGE RECIPE URLs
 * German, French, Spanish sources with structured ingredient lists
 * These sites have better structured data than English sources for exotic pets
 */

export interface ForeignRecipeSource {
  species: string[];
  language: 'de' | 'fr' | 'es';
  urls: string[];
}

export const FOREIGN_RECIPE_URLS: ForeignRecipeSource[] = [
  // GERMAN REPTILE SOURCES
  {
    species: ['reptiles'],
    language: 'de',
    urls: [
      // Bearded Dragon (Bartagame)
      'https://www.bartagame-info.de/ernaehrung/futterplan/',
      'https://www.terraristikladen.de/blog/bartagamen-ernaehrung/',
      'https://www.drta-archiv.de/ernaehrung-bartagamen/',
      // Leopard Gecko
      'https://www.leopardgecko-info.de/ernaehrung/',
      'https://www.terraristik.com/t/leckeres-futter-fuer-leopardgeckos/214856',
      // Iguana
      'https://www.iguanahaltung.de/ernaehrung/',
      'https://www.terraristik.com/t/iguanasalat-rezept/128404',
      // Tortoise
      'https://www.schildkroetenforum.eu/ernaehrung/',
      'https://www.testudo-forum.de/ernaehrung-futterpflanzen/',
    ],
  },
  
  // FRENCH REPTILE SOURCES
  {
    species: ['reptiles'],
    language: 'fr',
    urls: [
      // Bearded Dragon
      'https://www.dragonsdesables.fr/alimentation-bartagame/',
      'https://www.forum-reptiles.com/t/alimentation-bartagame-recettes/148231',
      // Crested Gecko
      'https://www.geckosdumonde.fr/alimentation-gecko-a-cretes/',
    ],
  },
  
  // SPANISH REPTILE SOURCES
  {
    species: ['reptiles'],
    language: 'es',
    urls: [
      'https://www.reptilandia.es/blog/alimentacion-reptiles',
      'https://www.expertoanimal.com/alimentacion-del-dragon-barbudo-22368.html',
    ],
  },
  
  // GERMAN POCKET PET SOURCES
  {
    species: ['pocket-pets'],
    language: 'de',
    urls: [
      // Rat / Mouse / Hamster
      'https://www.diebrain.de/ra-futter.html',
      'https://www.hamsterhilfe-nrw.de/?page_id=256',
      'https://www.futterplaene.de/ratten-futterplan/',
      // Chinchilla
      'https://www.chinchilla-forum.de/ernaehrung/',
      'https://www.chinchillaschutzforum.de/futterplaene/',
      // Sugar Glider
      'https://www.sugarglider-info.de/bml-rezept/',
      'https://www.sugarglider-haltung.de/ernaehrung/',
      // Guinea Pig / Rabbit
      'https://www.tierernaehrung.de/ernaehrung/kleintiere/kaninchen-und-meerschweinchen/',
    ],
  },
  
  // FRENCH POCKET PET SOURCES
  {
    species: ['pocket-pets'],
    language: 'fr',
    urls: [
      'https://www.rodentia.fr/alimentation-rat/',
      'https://www.hamster-france.org/t/alimentation-hamster-recettes/218',
    ],
  },
  
  // SPANISH POCKET PET SOURCES
  {
    species: ['pocket-pets'],
    language: 'es',
    urls: [
      'https://www.expertoanimal.com/dieta-del-conejo-y-del-conejillo-de-indias-55047.html',
      'https://www.expertoanimal.com/alimentacion-de-conejo-domestico-22373.html',
      'https://www.expertoanimal.com/alimentacion-de-meerschweinchen-22370.html',
    ],
  },
  
  // GERMAN BIRD SOURCES (Kochfutter/chop recipes)
  {
    species: ['birds'],
    language: 'de',
    urls: [
      'https://www.vogelforen.de/threads/futterrezepte-fuer-papageien.246731/',
      'https://www.sittich-info.de/ernaehrung/kochfutter/',
      'https://www.vogel-futter.de/blog/kochfutter-rezepte',
      // Softbill recipes
      'https://www.vogelforen.de/threads/weichfutter-rezepte.241018/',
    ],
  },
  
  // FRENCH BIRD SOURCES
  {
    species: ['birds'],
    language: 'fr',
    urls: [
      'https://www.perroquet.net/alimentation/recettes/',
      'https://www.oiseaux.net/alimentation-recettes.html',
      // Softbills
      'https://www.oiseaux.net/alimentation/insectivores.html',
    ],
  },
  
  // SPANISH BIRD SOURCES
  {
    species: ['birds'],
    language: 'es',
    urls: [
      'https://www.loro-info.com/alimentacion/recetas',
    ],
  },
  
  // ADDITIONAL ENGLISH SOURCES (structured forums)
  {
    species: ['birds'],
    language: 'de', // Using 'de' as placeholder for English
    urls: [
      'https://www.birdtricksstore.com/blogs/bird-tricks/bird-nutrition-recipes',
      'https://www.parrothead.com/forums/food-recipes.33/',
    ],
  },
  
  // ADDITIONAL SPECIALIZED SOURCES
  {
    species: ['pocket-pets'],
    language: 'de', // English source
    urls: [
      // Ferret raw diet with measured recipe
      'https://www.unusualpetvets.com.au/ferret-raw-feeding-recipe/',
      // Hedgehog
      'https://www.igelhilfe-sachsen.de/ernaehrung/',
      'https://www.hedgehogcare.org.uk/food.php',
    ],
  },
];

export function getAllForeignRecipeUrls(): string[] {
  return FOREIGN_RECIPE_URLS.flatMap(source => source.urls);
}

export function getForeignRecipeUrlsBySpecies(species: string): string[] {
  return FOREIGN_RECIPE_URLS
    .filter(source => source.species.includes(species))
    .flatMap(source => source.urls);
}

export function getForeignRecipeUrlsByLanguage(language: 'de' | 'fr' | 'es'): string[] {
  return FOREIGN_RECIPE_URLS
    .filter(source => source.language === language)
    .flatMap(source => source.urls);
}
