// lib/data/celebrity-pets-complete.ts
// Celebrity Pet Names + Quotes - Updated with new content

export interface CelebrityPet {
  name: string;
  quote: string;
  petType: 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';
}

// DOGS: The "Paw-llywood" A-List
export const dogCelebrities: CelebrityPet[] = [
  { name: "Bark Obama", quote: "Let me be clear... this is the change my belly has been waiting for.", petType: "dog" },
  { name: "Bark Twain", quote: "The secret of getting ahead is getting started... on this bowl.", petType: "dog" },
  { name: "Bark Ruffalo", quote: "You won't like me when I'm hungry. But I love this.", petType: "dog" },
  { name: "Bark Wahlberg", quote: "This meal? It's wicked good. Say hi to your mother for me.", petType: "dog" },
  { name: "Brad Pitt Bull", quote: "The first rule of Dinner Club: You do not talk about Dinner Club. You just wolf it down.", petType: "dog" },
  { name: "Pooch Clooney", quote: "Sophisticated. Timeless. Delicious. ...What else?", petType: "dog" },
  { name: "Angelina Poo-lee", quote: "I'm a globetrotter, but my favorite destination is right here in this bowl.", petType: "dog" },
  { name: "Corgi Elizabeth II", quote: "One is amused. Highly amused... by the flavor.", petType: "dog" },
  { name: "Chew-barka", quote: "Rrrruuuurrrghhh! (Translation: Seconds, please!)", petType: "dog" },
  { name: "Salvador Dogi", quote: "This flavor is surreal. It's melting like a clock in the sun.", petType: "dog" },
  { name: "Droolius Caesar", quote: "Veni, Vidi, Vici. I came, I saw, I ate it all.", petType: "dog" },
  { name: "Franz Fur-dinand", quote: "Take me out... to dinner!", petType: "dog" },
  { name: "Pup Marley", quote: "Don't worry about a thing... 'cause every little bite is gonna be alright.", petType: "dog" },
  { name: "Pupcasso", quote: "It's not just food... it's a masterpiece of flavor.", petType: "dog" },
  { name: "Billie Howliday", quote: "Summertime... and the livin' is easy (when the bowl is full).", petType: "dog" },
  { name: "Gnaw-msky Chomsky", quote: "The universal grammar of this meal is simply delicious.", petType: "dog" },
  { name: "Kanye Westie", quote: "Imma let you finish, but this is the best bowl of food of all time!", petType: "dog" },
  { name: "Anderson Pooper", quote: "Breaking news: This dinner is officially fantastic.", petType: "dog" },
  { name: "Chris Hemswoofth", quote: "Another! (Smashes bowl happily)", petType: "dog" },
  { name: "Dwayne \"The Wag\" Johnson", quote: "Can you smeeeeelllll what The Wag is eating?!", petType: "dog" },
  { name: "Woofie Goldberg", quote: "This food really speaks to my soul, sister.", petType: "dog" },
  { name: "Collie Parton", quote: "I will always love yoooouuuu (food).", petType: "dog" },
  { name: "Snoop Doggy Dog", quote: "Fo' shizzle, this drizzle... of gravy is off the chain.", petType: "dog" },
  { name: "Mary Puppins", quote: "A spoonful of sugar helps the medicine go down, but this needs no help.", petType: "dog" },
  { name: "Paw McCartney", quote: "All you need is love... and lunch.", petType: "dog" },
  { name: "Ozzy Pawsbourne", quote: "All aboard! Hahahaha! ... The dinner train.", petType: "dog" },
  { name: "Sarah Jessica Barker", quote: "I couldn't help but wonder... is this the perfect meal?", petType: "dog" },
  { name: "Jude Paw", quote: "Hey Jude, don't make it bad... take a sad bowl and make it better.", petType: "dog" },
  { name: "Jimmy Chew", quote: "It's not just food, it's high fashion for my tastebuds.", petType: "dog" },
  { name: "Virginia Woof", quote: "One cannot think well, love well, sleep well, if one has not dined well.", petType: "dog" },
  { name: "Indiana Bones", quote: "It belongs in a museum! But I'm gonna eat it right now.", petType: "dog" },
  { name: "Hairy Pawter", quote: "Accio Dinner!", petType: "dog" },
  { name: "Dumbledog", quote: "Happiness can be found, even in the darkest of times, if one only remembers to turn on the food dispenser.", petType: "dog" },
  { name: "Sirius Bark", quote: "I did my waiting! Twelve years of it! In Azkaban! ...For this bowl!", petType: "dog" },
  { name: "Sherlock Bones", quote: "The game is afoot! And by game, I mean lunch.", petType: "dog" },
];

// CATS: The "Meow-vies" & Music
export const catCelebrities: CelebrityPet[] = [
  { name: "Catrick Swayze", quote: "Nobody puts Dinner in the corner.", petType: "cat" },
  { name: "Leonardo DiCatrio", quote: "I'm the King of the World! ...and this food bowl!", petType: "cat" },
  { name: "Cat Damon", quote: "How do you like them apples? Actually, nevermind, I prefer this.", petType: "cat" },
  { name: "Meowly Cyrus", quote: "I came in like a wrecking ball... straight for the treats.", petType: "cat" },
  { name: "Cate Blanchcat", quote: "The world is changed. I feel it in the water. I feel it in the earth. I smell it in this bowl.", petType: "cat" },
  { name: "Al Pacat-ino", quote: "Say hello to my little friend... the kibble.", petType: "cat" },
  { name: "Jack Nicatson", quote: "Here's Johnny!... and he's hungry!", petType: "cat" },
  { name: "Dustin Pawman", quote: "Definitely, definitely delicious. Yeah.", petType: "cat" },
  { name: "Anthony Pawpkins", quote: "I ate his liver with some fava beans and a nice chianti... just kidding, it's pate.", petType: "cat" },
  { name: "Christopher Clawken", quote: "I got a fever... and the only prescription... is more dinner.", petType: "cat" },
  { name: "Daniel Day-Flewis", quote: "I drink your milkshake! I drink it up! (And your water bowl too).", petType: "cat" },
  { name: "Gary Paw-ldman", quote: "Bring me... EVERYTHING!!!", petType: "cat" },
  { name: "Katy Purry", quote: "I kissed a bowl and I liked it.", petType: "cat" },
  { name: "Cindy Clawford", quote: "I don't get out of bed for less than a premium meal.", petType: "cat" },
  { name: "RuPaw", quote: "If you can't love yourself, how in the hell are you gonna love this meal? Can I get an amen?", petType: "cat" },
  { name: "Cleocatra", quote: "Worship me, and bring me the feast fit for a Queen.", petType: "cat" },
  { name: "Picatso", quote: "Give me a museum and I'll fill it. Give me a bowl and I'll empty it.", petType: "cat" },
  { name: "Fidel Cat-stro", quote: "History will absolve me... for eating this seconds before you put it down.", petType: "cat" },
  { name: "Genghis Cat", quote: "I am the punishment of God... for this empty bowl.", petType: "cat" },
  { name: "Margaret Scratcher", quote: "The lady's not for turning... away from this plate.", petType: "cat" },
  { name: "Chairman Meow", quote: "The revolution will be fed.", petType: "cat" },
  { name: "Purr-tricia", quote: "I don't judge... much. But this food? 10 out of 10.", petType: "cat" },
];

// BIRDS: The "Fly" List
export const birdCelebrities: CelebrityPet[] = [
  { name: "Tweety Mercury", quote: "Don't stop me now... I'm having such a good feed.", petType: "bird" },
  { name: "Taylor Swift-let", quote: "I've got a blank space, baby... and I'll write 'YUM'.", petType: "bird" },
  { name: "Beyoncé Birdie", quote: "If you liked it then you should have put a seed on it.", petType: "bird" },
  { name: "Adele Sparrow", quote: "Hello from the other side... of the bird feeder.", petType: "bird" },
  { name: "Rihanna Robin", quote: "Please don't stop the music... or the feeding.", petType: "bird" },
  { name: "The Weeknd Warbler", quote: "I can't feel my beak when I'm with you... but I love it.", petType: "bird" },
  { name: "Drake Duckling", quote: "Started from the bottom now we here (at the food bowl).", petType: "bird" },
  { name: "Post Mallard", quote: "Congratulations... to the chef.", petType: "bird" },
  { name: "Meryl Cheep", quote: "This is the best performance by a meal in a leading role.", petType: "bird" },
  { name: "Feather Locklear", quote: "I'm just here for the drama... and the millet.", petType: "bird" },
  { name: "Christopher Squawken", quote: "Walk this way... to the feeder.", petType: "bird" },
  { name: "Marty McFly", quote: "This heavy? No, this is delicious!", petType: "bird" },
  { name: "Sheryl Crow", quote: "All I wanna do is have some fun... and eat this.", petType: "bird" },
  { name: "Crow-nan O'Brien", quote: "Welcome to the show! Tonight's guest: Dinner.", petType: "bird" },
  { name: "Duck Norris", quote: "This meal didn't satisfy my hunger. My hunger surrendered to this meal.", petType: "bird" },
];

// REPTILES: The "Cold-Blooded" Celebs
export const reptileCelebrities: CelebrityPet[] = [
  { name: "Scale-y Cyrus", quote: "It's the climb... to get to the top of the rock for this deliciousness.", petType: "reptile" },
  { name: "Brad Pitthon", quote: "To be honest, I find the concept of 'sharing' this meal elusive.", petType: "reptile" },
  { name: "George Geck-looney", quote: "I'm not just a pretty face. I have a pretty big appetite too.", petType: "reptile" },
  { name: "Sandra Bullfrog", quote: "I love a meal that makes me want to hop for joy.", petType: "reptile" },
  { name: "Scarlett Johansnake", quote: "I have a very specific set of skills. Eating this is one of them.", petType: "reptile" },
  { name: "Natalie Portman-tis", quote: "I will not let this meal die. It is too important.", petType: "reptile" },
  { name: "Lizard McGuire", quote: "This is what dreams are made of.", petType: "reptile" },
  { name: "Chamillionaire", quote: "They see me rollin', they hatin'... cause I'm eatin' dirty.", petType: "reptile" },
  { name: "Kim Komodo", quote: "This is breaking the internet. Or at least my diet.", petType: "reptile" },
  { name: "Reese Slither-spoon", quote: "What, like it's hard? To eat this whole thing?", petType: "reptile" },
  { name: "Snake Gyllenhaal", quote: "I wish I knew how to quit you... delicious food.", petType: "reptile" },
  { name: "Justin Timbersnake", quote: "I'm bringing sexy back. And hunger.", petType: "reptile" },
  { name: "Eddie Izzard", quote: "Cake or death? I'll take the meal, thank you very much.", petType: "reptile" },
];

// POCKET PETS: Pocket Sized Puns (Rodents & Rabbits)
export const pocketPetCelebrities: CelebrityPet[] = [
  { name: "Ham Solo", quote: "Chewie, we're home... for lunch.", petType: "pocket-pet" },
  { name: "Hamela Anderson", quote: "I'm always ready for a slow-motion run... to the food bowl.", petType: "pocket-pet" },
  { name: "Guinea Pig Pitt", quote: "I want you to feed me as hard as you can.", petType: "pocket-pet" },
  { name: "Ferret Fawcett", quote: "It's all about the hair... and the snacks.", petType: "pocket-pet" },
  { name: "Bunny Shapiro", quote: "Facts don't care about your feelings, but they do care about carrots.", petType: "pocket-pet" },
  { name: "Gerbil Streep", quote: "I have doubts. I have such doubts... that there will be any left.", petType: "pocket-pet" },
  { name: "Chinchilla Clinton", quote: "I did not inhale. I swallowed it whole.", petType: "pocket-pet" },
  { name: "Hammy Kimmel", quote: "Coming up next: Me eating this entire thing.", petType: "pocket-pet" },
  { name: "Stephen Hambert", quote: "This is a formidable opponent. But I will conquer it.", petType: "pocket-pet" },
  { name: "Jimmy Ferret-lon", quote: "That is great! That is awesome! Everything is awesome!", petType: "pocket-pet" },
  { name: "Oprah Winferbun", quote: "You get a pellet! And YOU get a pellet! Everybody gets a pellet!", petType: "pocket-pet" },
  { name: "Wolf Blitzhamster", quote: "Happening now: A major development in my stomach.", petType: "pocket-pet" },
  { name: "Rabbit De Niro", quote: "You talkin' to me? You talkin' to me? Then you must be offering food.", petType: "pocket-pet" },
  { name: "Hare-y Styles", quote: "Watermelon sugar... HI! Give me that!", petType: "pocket-pet" },
  { name: "Brittney Ears", quote: "Oops!... I did it again. I ate it all.", petType: "pocket-pet" },
  { name: "Guinea Stefani", quote: "This meal is B-A-N-A-N-A-S.", petType: "pocket-pet" },
];

// COMBINED EXPORT
export const allCelebrityPets = [
  ...dogCelebrities,
  ...catCelebrities,
  ...birdCelebrities,
  ...reptileCelebrities,
  ...pocketPetCelebrities
];

// STATISTICS
export const celebrityStats = {
  total: allCelebrityPets.length,
  dogs: dogCelebrities.length,
  cats: catCelebrities.length,
  birds: birdCelebrities.length,
  reptiles: reptileCelebrities.length,
  pocketPets: pocketPetCelebrities.length
};

// USAGE: Random assignment to recipes
export function getRandomCelebrityByType(petType: string): CelebrityPet {
  const filtered = allCelebrityPets.filter(c => c.petType === petType);
  if (filtered.length === 0) {
    // Fallback to first available if type doesn't match
    return allCelebrityPets[0];
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// USAGE: Assign to specific recipe
export function assignCelebrityToRecipe(recipeId: string, petType: string): CelebrityPet {
  // Deterministic assignment based on recipe ID (same recipe always gets same celebrity)
  const filtered = allCelebrityPets.filter(c => c.petType === petType);
  if (filtered.length === 0) {
    // Fallback to first available if type doesn't match
    return allCelebrityPets[0];
  }
  const hash = recipeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return filtered[hash % filtered.length];
}
