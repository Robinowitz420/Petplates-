/**
 * BULK RECIPE URL COLLECTION
 * Curated recipe URLs organized by species
 */

export interface BulkRecipeSource {
  species: string[];
  urls: string[];
}

export const BULK_RECIPE_URLS: BulkRecipeSource[] = [
  // DOGS
  {
    species: ['dogs'],
    urls: [
      'https://cleananddelicious.com/homemade-dog-food/',
      'https://thismessisours.com/easy-homemade-dog-food-recipe/',
      'https://www.food.com/recipe/homemade-dog-food-250094',
      'https://www.delicioustable.com/homemade-dog-food/',
      'https://stellanspice.com/balanced-dog-food/',
      'https://www.meatloafandmelodrama.com/homemade-dog-food/',
      'https://thealmondeater.com/homemade-dog-food/',
      'https://azestfor.com/blogs/recipes/making-homemade-dog-food',
      'https://www.food.com/recipe/homemade-rabbit-meal-for-dogs-394819',
    ],
  },
  
  // CATS
  {
    species: ['cats'],
    urls: [
      'https://cats.com/homemade-cat-food-recipes',
      'https://catinfo.org/making-cat-food/',
      'https://holisticvetblend.com/blogs/news/homemade-cat-food-recipes-vet-approved',
      'https://holisticvetblend.com/blogs/news/easy-homemade-cat-food-recipe-nutritious-and-delicious',
      'https://www.food.com/recipe/homemade-cat-food-302842',
      'https://www.ibdkitties.net/homecooked/',
      'https://www.floppycats.com/3-diy-homemade-cat-food-recipes-that-are-healthy-too.html',
      'https://cats-magazine.com/homemade-cat-food/homemade-cat-food-simple-healthy-and-purr-fect-for-your-furry-friend/',
      'https://cats-magazine.com/homemade-cat-food/the-purr-fect-guide-to-homemade-food-for-cats-easy-quick-and-yummy-recipe-beefy-barley-delight/',
    ],
  },
  
  // BIRDS - Parakeet/Budgie
  {
    species: ['birds'],
    urls: [
      'https://www.budgiecare.org/budgie-treat-recipes.php',
      'https://www.budgiecare.org/budgie-food.php',
      'https://mypetparakeet.com/what-can-i-feed-my-baby-parakeet-5-homemade-baby-budgie-food-recipes/',
      'https://www.omlet.us/guide/parakeets/recipes/',
      'https://pets.thenest.com/recipes-parakeets-6628.html',
      'https://4ingredients.com.au/blogs/recipes/budgie-balls',
      'https://www.tiktok.com/discover/homemade-budgie-food',
      'https://budgies.org/info/recipes/formulas.html',
      'https://www.budgiecare.org/budgie-hand-feeding-recipes.php',
      'https://parrot-chow.livejournal.com/10972.html',
      'https://birdtricksstore.com/blogs/birdtricks-blog/homemade-cockatiel-seed-and-grain-mix-recipe',
      // Cockatiel
      'https://www.talkcockatiels.com/threads/recipe-share.6958/',
      'https://www.happycockatiel.com/homemade-cockatiel-food-recipes/',
      'https://cockatielsaspets.com/homemade-cockatiel-food-and-how-to-do-it-yourself',
      'https://www.cuteness.com/article/make-homemade-baby-cockatiel-food/',
      'https://www.backyardchickens.com/threads/homemade-cockatiel-feed.1532649/',
      'https://petshoods.com/cockatiel-bird-best-food-and-care/',
      'https://poweringprogress.kohlerpower.com/make-your-own-baby-cockatiel-food/',
      'https://www.epicuricloud.com/recipe/cockatiel-seed-tweets/',
      'https://www.cockatielcottage.net/formula.html',
      // Canary & Finch
      'https://www.omlet.us/guide/finches_and_canaries/finch_food/treats/',
      'https://www.homemadebirdfood.com/finch-and-canary-treat.html',
      'https://www.omlet.co.uk/guide/finches_and_canaries/finch_food/egg_food/',
      'https://www.gouldiangardens.com/make-your-own-eggfood/',
      'https://thefinchtree.weebly.com/recipes.html',
      'https://www.finchaviary.com/Maintenance/EggfoodRecipes.htm',
      'https://www.omlet.co.uk/guide/finches_and_canaries/finch_food/fresh_food',
      'https://www.omlet.us/guide/finches_and_canaries/finch_food/',
      'https://www.ladygouldianfinch.com/soft-food-recipe.aspx',
      'https://earthlife.net/finch-canary-food/',
      // Large Parrots
      'https://www.thriftyfun.com/Homemade-Parrot-Food-Recipes.html',
      'https://www.parrotforums.com/threads/cook-portion-freeze-my-recipe.22594/',
      'http://www.picklestheparrot.com/birdie-recipes.php',
      'https://www.parrotparrot.com/parrot-health/recipes-that-birds-love/',
      'https://exoticdirect.co.uk/news/what-can-african-grey-parrots-eat/',
      'http://www.parrotenrichment.com/recipes.html',
      'https://www.pinterest.com/sprkygirl/parrot-foodrecipes/',
      'https://www.pinterest.com/naturechest/parrot-recipes-and-nutrition/',
      'https://heidishappyacrefarm.weebly.com/day-in-the-life-of-a-homesteader/making-chopaka-homemade-parrot-food',
      // Other Birds
      'https://birdvibes.com/7-tasty-homemade-parrot-foods-your-bird-will-love/',
      'https://www.northernparrots.com/blog/parrot-food-recipes-from-lafeber/',
      'https://britishpetinsurance.co.uk/d-i-y-parrot-food-recipes/',
      'https://thehappycockatoo.wordpress.com/tag/parrot-recipes/',
      'https://avianbliss.com/parrot-food-recipes-homemade/',
    ],
  },
  
  // POCKET PETS - Rabbits
  {
    species: ['pocket-pets'],
    urls: [
      'https://www.pdsa.org.uk/what-we-do/blog/three-easy-homemade-rabbit-treat-recipes',
      'https://mollygreen.com/blog/feeding-rabbits-naturallygrowing-and-making-your-own-rabbit-feed/',
      'https://www.homesteadingtoday.com/threads/making-your-own-rabbit-feed.217628/',
      'https://www.westleysworld.com/thefiles/home-made-rabbit-treats',
      'https://www.instructables.com/Homemade-Rabbit-Treats/',
      'https://2kidstrying2cook.com/how-to-make-inexpensive-rabbit-treats/',
      // Guinea Pigs
      'https://uk.kavee.com/blogs/the-piggy-blog/8-emergency-liquid-food-recipes-for-guinea-pigs',
      'https://kavee.com/blogs/the-piggy-blog/easiest-homemade-treats-for-guinea-pigs-recipe-only-4-ingredients',
      'https://kavee.com/blogs/the-piggy-blog/homemade-christmas-treats-for-guinea-pigs-easy-recipe',
      'https://www.guineapigcages.com/threads/any-recipes-for-home-made-guinea-food.5967/',
      'https://homeandroost.co.uk/blogs/guinea-pigs/delicious-diy-guinea-pig-treats-10-easy-recipes',
      'https://www.epicuricloud.com/recipe/gnaw-gnaw-biscuits-teeth-tamers-for-guinea-pigs-and-rabbits/',
      'https://www.theguineapigforum.co.uk/threads/how-to-make-homemade-guinea-pig-treats.128887/',
      'https://animals.mom.com/homemade-guinea-pig-food-5637.html',
      'https://www.theguineapigforum.co.uk/threads/home-made-treat-recipes.88397/',
      'https://smallpetselect.com/diy-guinea-pig-treat-recipes/',
      // Ferrets
      'https://www.unusualpetvets.com.au/ferret-raw-feeding-recipe/',
      'https://www.lovetoknowpets.com/small-mammals/how-make-homemade-ferret-food-treats',
      'http://thehammock.weebly.com/ferret-diet.html',
      'https://ferretguidance.com/best-ferret-food-recipes/',
      'https://diyferret.com/best-ferret-treats-and-homemade-ferret-treats/',
      'https://www.fairoakferrets.co.uk/raw-feeding-ferrets',
      'https://www.unusualpetvets.com.au/wp-content/uploads/2023/12/ferret-raw-feeding-recipe.pdf',
      'https://holisticferret60.proboards.com/thread/18144/homemade-ferret-dry-kibble',
      'https://www.ferret-world.com/best-ferret-food-DIY-tips',
      // Hamsters
      'https://pethelpful.com/rodents/organic-hamster-food-recipe',
      'https://articles.hepper.com/homemade-hamster-food-recipes/',
      'https://hamsterclubhouse.com/forum/viewtopic.php?t=416',
      'https://www.easy-kids-recipes.com/hamster-food.html',
      'https://thehamsterbakery.weebly.com/hamster-recipes.html',
      'https://hamsterclubhouse.com/forum/viewtopic.php?t=308',
      'https://www.tiktok.com/discover/how-to-make-hamster-food-mix',
      'https://www.hamstercentral.com/community/feeding-nutrition/49161-homemade-mix-robos-syrians.html',
      'https://wbmr.grey-panther.net/hamsterhideout.com/forum/topic/62070-recipes-for-hamsters/page-1.html',
      'https://petfables.com.sg/blogs/pf-pet-wiki/10-best-diy-home-baked-treat-recipes-for-hamsters',
      'https://www.thesprucepets.com/feeding-pet-hamsters-1239444',
      'https://www.petmd.com/exotic/nutrition/what-do-hamsters-eat',
      // Rats
      'https://www.instructables.com/Homemade-Pet-Rat-Food/',
      'https://www.thesprucepets.com/feeding-pet-rats-1239447',
      // Mice
      'https://www.thesprucepets.com/feeding-pet-mice-1239446',
      'https://www.petmd.com/exotic/nutrition/what-do-pet-mice-eat',
      // Gerbils
      'https://www.thesprucepets.com/feeding-pet-gerbils-1239445',
      'https://www.petmd.com/exotic/nutrition/what-do-pet-gerbils-eat',
      // Chinchillas
      'https://www.thesprucepets.com/feeding-pet-chinchillas-1239442',
      'https://www.petmd.com/exotic/nutrition/what-do-chinchillas-eat',
      // Sugar Gliders
      'https://exoticnutrition.com/blogs/blog/homemade-sugar-glider-diets',
      'https://www.charmedpen.com/posts/angelas-sugar-glider-food-recipe/',
      // Hedgehogs
      'https://www.thesprucepets.com/feeding-pet-hedgehogs-1239441',
      'https://www.petmd.com/exotic/nutrition/what-do-hedgehogs-eat',
    ],
  },
  
  // REPTILES - Bearded Dragons
  {
    species: ['reptiles'],
    urls: [
      'https://www.beardeddragon.org/threads/homemade-beardie-food.127123/',
      'https://petsvills.com/bearded-dragon-homemade-food-recipes/',
      'https://mulberrywindacres.com/salad-for-your-bearded-dragon/',
      'https://www.tiktok.com/discover/diy-bearded-dragon-treats',
      'https://www.instructables.com/A-Easy-Meal-to-Make-for-Your-Bearded-Dragon/',
      'https://community.morphmarket.com/t/making-bearded-dragon-food-in-bulk/22066',
      'https://www.beardeddragon.org/threads/recipes.167677/',
      'https://dragonsdiet.com/blogs/dragon-care/the-complete-bearded-dragon-diet-plan',
      // Leopard Gecko
      'https://www.theleopardgeckos.com/diet/',
      'https://reptifiles.com/leopard-gecko-care/leopard-gecko-feeding/',
      'https://www.zillarules.com/articles/what-do-i-feed-my-reptile-to-keep-it-healthy',
      // Ball Python
      'https://reptifiles.com/ball-python-care-guide/ball-python-feeding/',
      'https://www.reptilecentre.com/blog/feeding-your-ball-python/',
      // Corn Snake
      'https://reptifiles.com/corn-snake-care-guide/corn-snake-feeding/',
      'https://www.thesprucepets.com/feeding-your-corn-snake-1239446',
      // Kingsnake
      'https://reptifiles.com/kingsnake-care-sheet/',
      'https://www.thesprucepets.com/feeding-pet-snakes-1239440',
      // Boa Constrictor
      'https://reptifiles.com/boa-constrictor-care-guide/boa-feeding/',
      'https://www.thesprucepets.com/boa-constrictor-care-1239448',
      // Crested Gecko
      'https://reptifiles.com/crested-gecko-care/crested-gecko-feeding/',
      'https://www.pangeareptile.com/blogs/news/what-do-crested-geckos-eat',
      // Iguana
      'https://reptifiles.com/green-iguana-care-sheet/green-iguana-feeding/',
      'https://www.anapsid.org/iguana.html',
      // Chameleon
      'https://reptifiles.com/chameleon-care-sheet/chameleon-feeding/',
      'https://www.thesprucepets.com/chameleon-diet-1239449',
      // Turtle (Aquatic)
      'https://reptifiles.com/red-eared-slider-care/red-eared-slider-feeding/',
      'https://www.thesprucepets.com/feeding-pet-turtles-1239443',
      // Tortoise
      'https://reptifiles.com/tortoise-care-sheet/tortoise-feeding/',
      'https://www.thetortoisetable.org.uk/',
    ],
  },
];

export function getAllBulkRecipeUrls(): string[] {
  return BULK_RECIPE_URLS.flatMap(source => source.urls);
}

export function getBulkRecipeUrlsBySpecies(species: string): string[] {
  return BULK_RECIPE_URLS
    .filter(source => source.species.includes(species))
    .flatMap(source => source.urls);
}
