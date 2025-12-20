/**
 * LATEST RECIPE URLs - December 2025 batch
 * Foreign-language sources with structured recipe content
 */

export interface LatestRecipeSource {
  species: string[];
  recipeType: string;
  language: string;
  url: string;
}

export const LATEST_RECIPE_URLS: LatestRecipeSource[] = [
  // BIRDS - Chop & Softfood Recipes
  {
    species: ["budgie", "cockatiel", "lovebird", "conure", "african_grey", "macaw", "cockatoo", "quaker_parakeet"],
    recipeType: "chop",
    language: "de",
    url: "https://www.vogelforen.de/threads/chop-rezepte-fuer-papageien.260418/"
  },
  {
    species: ["budgie", "cockatiel", "canary", "finch"],
    recipeType: "kochfutter",
    language: "de",
    url: "https://www.sittich-info.de/ernaehrung/chop-rezepte/"
  },
  {
    species: ["african_grey", "macaw", "cockatoo", "conure", "lovebird"],
    recipeType: "chop",
    language: "fr",
    url: "https://www.perroquet.net/alimentation/chop/"
  },
  {
    species: ["budgie", "cockatiel", "canary", "finch"],
    recipeType: "softfood",
    language: "de",
    url: "https://www.vogelforen.de/threads/weichfutter-rezepte.241018/"
  },

  // REPTILES - Salad & Formula Recipes
  {
    species: ["bearded_dragon"],
    recipeType: "salad",
    language: "de",
    url: "https://www.bartagame-info.de/ernaehrung/futterplan/"
  },
  {
    species: ["bearded_dragon"],
    recipeType: "salad",
    language: "fr",
    url: "https://www.dragonsdesables.fr/alimentation-bartagame/"
  },
  {
    species: ["leopard_gecko"],
    recipeType: "insectivore_formula",
    language: "de",
    url: "https://www.leopardgecko-info.de/ernaehrung/"
  },
  {
    species: ["iguana"],
    recipeType: "salad",
    language: "de",
    url: "https://www.iguanahaltung.de/futterplan/"
  },
  {
    species: ["tortoise"],
    recipeType: "salad",
    language: "de",
    url: "https://www.schildkroetenforum.eu/ernaehrung/"
  },
  {
    species: ["turtle"],
    recipeType: "gel_food",
    language: "en",
    url: "https://azeah.com/turtles-tortoises/homemade-turtle-food"
  },
  {
    species: ["crested_gecko"],
    recipeType: "insectivore_formula",
    language: "fr",
    url: "https://www.geckosdumonde.fr/recettes-gecko/"
  },
  {
    species: ["chameleon"],
    recipeType: "insectivore_formula",
    language: "fr",
    url: "https://www.dragonsdesables.fr/alimentation-reptiles/"
  },

  // SNAKES - Prey Schedules (not recipes, but feeding guides)
  {
    species: ["ball_python", "corn_snake", "kingsnake", "boa_constrictor"],
    recipeType: "prey_schedule",
    language: "de",
    url: "https://www.schlangenforum.de/t/futterplan-koenigspython.58612/"
  },
  {
    species: ["ball_python", "corn_snake"],
    recipeType: "prey_schedule",
    language: "fr",
    url: "https://www.reptiligne.fr/alimentation-serpents/"
  },

  // POCKET PETS - Dry Mixes & Complete Diets
  {
    species: ["rat", "mouse", "gerbil"],
    recipeType: "dry_mix",
    language: "de",
    url: "https://www.diebrain.de/ra-futterkueche.html"
  },
  {
    species: ["hamster"],
    recipeType: "dry_mix",
    language: "de",
    url: "https://www.hamsterhilfe-nrw.de/?page_id=256"
  },
  {
    species: ["rabbit", "guinea_pig"],
    recipeType: "salad",
    language: "de",
    url: "https://kaninchenwiese.de/ernaehrung/futterplaene/"
  },
  {
    species: ["chinchilla"],
    recipeType: "dry_mix",
    language: "de",
    url: "https://www.chinchilla-forum.de/ernaehrung/"
  },
  {
    species: ["ferret"],
    recipeType: "raw_batch",
    language: "en",
    url: "https://www.unusualpetvets.com.au/ferret-raw-feeding-recipe/"
  },
  {
    species: ["sugar_glider"],
    recipeType: "complete_diet",
    language: "en",
    url: "https://critterlove.com/original-hpw-recipe/"
  },
  {
    species: ["hedgehog"],
    recipeType: "ingredient_mix",
    language: "de",
    url: "https://www.igelhilfe-sachsen.de/futter-rezepte/"
  }
];

export function getAllLatestRecipeUrls(): string[] {
  return LATEST_RECIPE_URLS.map(source => source.url);
}

export function getLatestRecipeUrlsByLanguage(language: string): string[] {
  return LATEST_RECIPE_URLS
    .filter(source => source.language === language)
    .map(source => source.url);
}

export function getLatestRecipeUrlsBySpecies(species: string): string[] {
  return LATEST_RECIPE_URLS
    .filter(source => source.species.includes(species))
    .map(source => source.url);
}
