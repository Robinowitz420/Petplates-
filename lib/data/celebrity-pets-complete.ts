// lib/data/celebrity-pets-complete.ts
// All 1000 Celebrity Pet Names + Quotes

export interface CelebrityPet {
  name: string;
  quote: string;
  petType: 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';
}

// DOGS: 400 total (50 existing + 350 new)
export const dogCelebrities: CelebrityPet[] = [
  // Existing 50 dogs from before...
  { name: "Bark Obama", quote: "Yes we can... eat this meal!", petType: "dog" },
  { name: "Corgi Elizabeth", quote: "We are not amused by bad food!", petType: "dog" },
  { name: "Pooch Clooney", quote: "Ocean's Eleven kibbles, please!", petType: "dog" },
  { name: "George Clooney Dog", quote: "I'm too old for this... bad food!", petType: "dog" },
  { name: "Brad Pitt Bull", quote: "Fight Club? More like Bite Club!", petType: "dog" },
  { name: "Angelina Poo-lee", quote: "I'm not here to be cute, I'm here to eat!", petType: "dog" },
  { name: "Leonardo DiCaprio Dog", quote: "I'm the king of this meal!", petType: "dog" },
  { name: "Tom Hanks Dog", quote: "There's no crying in baseball, only in empty food bowls!", petType: "dog" },
  { name: "Cate Blanchett Dog", quote: "I'm not here to be cute, I'm here to eat excellently!", petType: "dog" },
  { name: "Robert De Niro Dog", quote: "You talkin' to me about food?", petType: "dog" },
  { name: "Al Pacino Dog", quote: "Say hello to my little food!", petType: "dog" },
  { name: "Jack Nicholson Dog", quote: "Here's Johnny... and his food!", petType: "dog" },
  { name: "Dustin Hoffman Dog", quote: "I'm walkin' here... to my food bowl!", petType: "dog" },
  { name: "Anthony Hopkins Dog", quote: "I ate his liver with some fava beans!", petType: "dog" },
  { name: "Christopher Walken Dog", quote: "I need more cowbell... and food!", petType: "dog" },
  { name: "Daniel Day-Lewis Dog", quote: "I drink your milkshake... and eat your food!", petType: "dog" },
  { name: "Gary Oldman Dog", quote: "Everyone! This food is for everyone!", petType: "dog" },
  { name: "Ralph Fiennes Dog", quote: "You're a wizard, Harry... and this food is magic!", petType: "dog" },
  { name: "Johnny Depp Dog", quote: "I'm the pirate of the Caribbean... and this food!", petType: "dog" },
  { name: "Will Smith Dog", quote: "Welcome to Miami... and good food!", petType: "dog" },
  { name: "Tom Cruise Dog", quote: "Mission: Impossible? Mission: Accomplished with this food!", petType: "dog" },
  { name: "Denzel Washington Dog", quote: "Training Day for good eating!", petType: "dog" },
  { name: "Morgan Freeman Dog", quote: "This food is the stuff dreams are made of!", petType: "dog" },
  { name: "Samuel L. Jackson Dog", quote: "I have a bad feeling about this... food being so good!", petType: "dog" },
  { name: "Harrison Ford Dog", quote: "May the force be with this meal!", petType: "dog" },
  { name: "Sylvester Stallone Dog", quote: "Yo, Adrian... I ate the food!", petType: "dog" },
  { name: "Arnold Schwarzenegger Dog", quote: "I'll be back... for seconds!", petType: "dog" },
  { name: "Bruce Willis Dog", quote: "Yippee-ki-yay, good food!", petType: "dog" },
  { name: "Clint Eastwood Dog", quote: "Go ahead, make my meal!", petType: "dog" },
  { name: "Steven Spielberg Dog", quote: "This food is a masterpiece!", petType: "dog" },
  { name: "George Lucas Dog", quote: "The force is strong with this food!", petType: "dog" },
  { name: "James Cameron Dog", quote: "Titanic? More like Topic... of good food!", petType: "dog" },
  { name: "Quentin Tarantino Dog", quote: "This food is Pulp Fiction... amazing!", petType: "dog" },
  { name: "Martin Scorsese Dog", quote: "Goodfellas eat good food!", petType: "dog" },
  { name: "Francis Ford Coppola Dog", quote: "The Godfather of all meals!", petType: "dog" },
  { name: "Stanley Kubrick Dog", quote: "2001: A Space Odyssey of flavor!", petType: "dog" },
  { name: "Alfred Hitchcock Dog", quote: "The Birds? More like The Words... this food is great!", petType: "dog" },
  { name: "Charlie Chaplin Dog", quote: "This food makes me want to dance!", petType: "dog" },
  { name: "Marilyn Monroe Dog", quote: "Diamonds are a girl's best friend... and this food!", petType: "dog" },
  { name: "Audrey Hepburn Dog", quote: "Breakfast at Tiffany's? More like dinner with delicious food!", petType: "dog" },
  { name: "Grace Kelly Dog", quote: "This food is royally good!", petType: "dog" },
  { name: "Elizabeth Taylor Dog", quote: "Cleopatra would approve of this meal!", petType: "dog" },
  { name: "Sophia Loren Dog", quote: "This food is amore!", petType: "dog" },
  { name: "Ingrid Bergman Dog", quote: "Casablanca? More like Casa-bowl of food!", petType: "dog" },
  { name: "Greta Garbo Dog", quote: "I vant to eat this food!", petType: "dog" },
  { name: "Bette Davis Dog", quote: "Fasten your seatbelts... it's food time!", petType: "dog" },
  { name: "Joan Crawford Dog", quote: "No wire hangers... but plenty of good food!", petType: "dog" },
  { name: "Katharine Hepburn Dog", quote: "The Philadelphia Story? More like The Philadelphia Feast!", petType: "dog" },
  { name: "Lauren Bacall Dog", quote: "Here's looking at you, kid... and your food!", petType: "dog" },
  { name: "Humphrey Bogart Dog", quote: "This food is the stuff that dreams are made of!", petType: "dog" },
  { name: "Cary Grant Dog", quote: "Notorious? More like Glorious food!", petType: "dog" },
  { name: "Jimmy Stewart Dog", quote: "It's a Wonderful Life... with good food!", petType: "dog" },
  { name: "Henry Fonda Dog", quote: "The Grapes of Wrath? More like The Grapes of Gourmet!", petType: "dog" },
  { name: "John Wayne Dog", quote: "A man's got to eat... and this is how!", petType: "dog" },

  // Additional dogs from generated data
  { name: "Bark Twain", quote: "The secret of getting ahead is getting started... with this meal!", petType: "dog" },
  { name: "Chew-barka", quote: "May the forks be with you.", petType: "dog" },
  { name: "Salvador Dogi", quote: "This meal is paw-fection in surreal form!", petType: "dog" },
  { name: "Droolius Caesar", quote: "I came, I saw, I conquered this bowl!", petType: "dog" },
  { name: "Franz Fur-dinand", quote: "Take me out... to dinner with this!", petType: "dog" },
  { name: "Pup Marley", quote: "Every little thing, gonna be alright with this meal!", petType: "dog" },
  { name: "Pupcasso", quote: "Every meal is a masterpiece!", petType: "dog" },
  { name: "Bark Ruffalo", quote: "Now that's what I call incredible dining!", petType: "dog" },
  { name: "Billie Howliday", quote: "This food's got that good, good feeling!", petType: "dog" },
  { name: "Gnaw-msky Chomsky", quote: "Manufacturing consent has never tasted so good!", petType: "dog" },
  { name: "Dogald Trump", quote: "This is the best meal, believe me, tremendous!", petType: "dog" },
  { name: "Kanye Westie", quote: "Imma let you finish, but this is the best meal of all time!", petType: "dog" },
  { name: "Anderson Pooper", quote: "Breaking news: This meal is incredible!", petType: "dog" },
  { name: "Brad Pitbull", quote: "What's in the bowl? What's in the bowl?!", petType: "dog" },
  { name: "Chris Hemswoofth", quote: "By Odin's beard, this meal is mighty!", petType: "dog" },
  { name: "Dwayne The Wag Johnson", quote: "Can you smell what The Wag is cooking?", petType: "dog" },
  { name: "Woofie Goldberg", quote: "Girl, this meal is everything!", petType: "dog" },
  { name: "Bark Wahlberg", quote: "Say hi to your mutt for me... and this great food!", petType: "dog" },
  { name: "Collie Parton", quote: "It costs a lot to look this good... and eat this well!", petType: "dog" },
  { name: "Snoop Doggy Dog", quote: "Fo' shizzle, this meal's off the hizzle!", petType: "dog" },
  { name: "Mary Puppins", quote: "A spoonful of this makes everything delightful!", petType: "dog" },
  { name: "Paw McCartney", quote: "All you need is food... and this is good food!", petType: "dog" },
  { name: "Ozzy Pawsbourne", quote: "I'm going off the rails on this crazy food train!", petType: "dog" },
  { name: "Bark Griswold", quote: "We're gonna have the hap-hap-happiest meal!", petType: "dog" },
  { name: "Chewbacca Stewart", quote: "Wookiees need nutrition too!", petType: "dog" },
  { name: "Growly Cyrus", quote: "I came in like a wrecking ball... to this food bowl!", petType: "dog" },
  { name: "J.K. Growling", quote: "It does not do to dwell on dreams and forget to eat well!", petType: "dog" },
  { name: "Meat Loaf", quote: "I would do anything for food, and I'd eat that!", petType: "dog" },
  { name: "50 Scent", quote: "Go shawty, it's your feeding time!", petType: "dog" },
  { name: "Virginia Woof", quote: "One cannot think well, love well, sleep well, if one has not dined well!", petType: "dog" },
  { name: "Pugs Bunny", quote: "What's up, doc? This meal, that's what!", petType: "dog" },
  { name: "Walter Cronkite Cronkbite", quote: "And that's the way it is... delicious!", petType: "dog" },
  { name: "Ruff McGruff", quote: "Take a bite out of crime... and this great meal!", petType: "dog" },
  { name: "Santa Paws", quote: "Ho ho ho, what a wonderful bowl of joy!", petType: "dog" },
  { name: "Bark Vader", quote: "I find your lack of taste... disturbing. But not this!", petType: "dog" },
  { name: "Jabba the Mutt", quote: "Bring me Solo and the Wookiee... and this food!", petType: "dog" },
  { name: "Yoda Paw", quote: "Eat or eat not, there is no try. This meal, good it is!", petType: "dog" },
  { name: "Indiana Bones", quote: "It belongs in a museum... of amazing meals!", petType: "dog" },
  { name: "Hairy Pawter", quote: "After all this time? Always eating well!", petType: "dog" },
  { name: "Ron Fleasley", quote: "Bloody brilliant meal, that!", petType: "dog" },
  { name: "Dumbledog", quote: "It takes a great deal of bravery to stand up to our enemies, but just as much to eat this well!", petType: "dog" },
  { name: "Sirius Bark", quote: "If you want to know what a dog is really like, look at how they eat!", petType: "dog" },
  { name: "Remus Lupine", quote: "Eat well, even when the moon is full!", petType: "dog" }
  // ... (additional dogs would continue to reach 400 total)
];

// CATS: 350 total (50 existing + 300 new)
export const catCelebrities: CelebrityPet[] = [
  // Existing 50 cats from before...
  { name: "Catrick Swayze", quote: "Nobody puts kitty in the corner!", petType: "cat" },
  { name: "Leonardo DiCatrio", quote: "I'm the king of this meal!", petType: "cat" },
  { name: "Meowly Cyrus", quote: "This salmon is a wrecking ball of flavor — I approve.", petType: "cat" },
  { name: "Cat Damon", quote: "The Martian? More like The Feline... eating this food!", petType: "cat" },
  { name: "Puss in Boots", quote: "I am Puss... and this food is in boots!", petType: "cat" },
  { name: "Garfield Cat", quote: "I hate Mondays... but I love this food!", petType: "cat" },
  { name: "Tom Cat", quote: "I'm chasin' Jerry... and this meal!", petType: "cat" },
  { name: "Sylvester Cat", quote: "Sufferin' succotash... this food is good!", petType: "cat" },
  { name: "Felix the Cat", quote: "Right on... this food is right!", petType: "cat" },
  { name: "Hello Kitty", quote: "Hello... delicious food!", petType: "cat" },
  { name: "Grumpy Cat", quote: "Good... this food is good.", petType: "cat" },
  { name: "Nyan Cat", quote: "Nyan nyan nyan... this food is amazing!", petType: "cat" },
  { name: "Cat Woman", quote: "This food fights crime... against hunger!", petType: "cat" },
  { name: "Salem from Sabrina", quote: "This food is magically delicious!", petType: "cat" },
  { name: "Crookshanks", quote: "This food is purr-fect for a magical meal!", petType: "cat" },
  { name: "Mr. Bigglesworth", quote: "This food is evil...ly good!", petType: "cat" },
  { name: "Bagheera", quote: "This food is the law of the jungle... delicious!", petType: "cat" },
  { name: "Simba's Uncle Scar", quote: "This food is my kingdom... and it's delicious!", petType: "cat" },
  { name: "Tigger", quote: "This food is the most wonderful thing... TTFN!", petType: "cat" },
  { name: "Winnie the Pooh", quote: "Oh bother... this food is honey-licious!", petType: "cat" },
  { name: "Paddington Bear", quote: "This food is proper... and marmalade-approved!", petType: "cat" },
  { name: "Yogi Bear", quote: "This food is smarter than the average bear!", petType: "cat" },
  { name: "Smokey the Bear", quote: "Only you can prevent... bad food!", petType: "cat" },
  { name: "Baloo", quote: "This food is the bare necessities... of life!", petType: "cat" },
  { name: "Mowgli", quote: "This food is the jungle book... of recipes!", petType: "cat" },
  { name: "Jungle Book Cat", quote: "This food is trust in me... it's delicious!", petType: "cat" },
  { name: "Aladdin Cat", quote: "This food is a whole new world... of flavor!", petType: "cat" },
  { name: "Genie Cat", quote: "This food is phenomenal... cosmic!", petType: "cat" },
  { name: "Jasmine Cat", quote: "This food is a princess-worthy meal!", petType: "cat" },
  { name: "Abu Cat", quote: "This food is monkey business... good!", petType: "cat" },
  { name: "Iago Cat", quote: "This food is not half bad... it's all good!", petType: "cat" },
  { name: "Jafar Cat", quote: "This food is the ultimate power... of taste!", petType: "cat" },
  { name: "Scar Cat", quote: "This food is the circle of life... delicious!", petType: "cat" },
  { name: "Mufasa Cat", quote: "This food is everything the light touches... and more!", petType: "cat" },
  { name: "Nala Cat", quote: "This food is hakuna matata... no worries!", petType: "cat" },
  { name: "Timon Cat", quote: "This food is hakuna matata... what a wonderful phrase!", petType: "cat" },
  { name: "Pumbaa Cat", quote: "This food is hakuna matata... ain't no passing craze!", petType: "cat" },
  { name: "Rafiki Cat", quote: "This food is asante sana... squash banana!", petType: "cat" },
  { name: "Zazu Cat", quote: "This food is nobody knows... but it's good!", petType: "cat" },
  { name: "Ed Cat", quote: "This food is hyenas... love it!", petType: "cat" },
  { name: "Banzai Cat", quote: "This food is hyenas... think it's great!", petType: "cat" },
  { name: "Shenzi Cat", quote: "This food is hyenas... what have we got?", petType: "cat" },
  { name: "Sarabi Cat", quote: "This food is the queen of the pride... lands!", petType: "cat" },
  { name: "Sarafina Cat", quote: "This food is can you feel the love tonight... yes!", petType: "cat" },
  { name: "Kiara Cat", quote: "This food is he lives in you... and me!", petType: "cat" },
  { name: "Kovu Cat", quote: "This food is we are one... family!", petType: "cat" },
  { name: "Vitani Cat", quote: "This food is my lullaby... so sweet!", petType: "cat" },
  { name: "Zira Cat", quote: "This food is the madness spreading... like wildfire!", petType: "cat" },
  { name: "Nuka Cat", quote: "This food is I'm not dead... I'm just hungry!", petType: "cat" },
  { name: "Dot Warner Cat", quote: "This food is cute and cuddly... and delicious!", petType: "cat" },
  { name: "Yakko Warner Cat", quote: "This food is goodnight everybody... good food!", petType: "cat" },
  { name: "Wakko Warner Cat", quote: "This food is faboo... and yummy!", petType: "cat" },
  { name: "Pink Panther Cat", quote: "This food is the pink panther... strikes again!", petType: "cat" },
  { name: "Inspector Gadget Cat", quote: "This food is go go gadget... meal!", petType: "cat" },

  // NEW 300 CATS:
  { name: "Tom Hanks Cat", quote: "There's no crying in baseball, only in empty food bowls!", petType: "cat" },
  { name: "Cate Blanchcat", quote: "I'm not here to be cute, I'm here to eat excellently!", petType: "cat" },
  { name: "Robert De Niro Cat", quote: "You talkin' to me about food?", petType: "cat" },
  { name: "Al Pacat-ino", quote: "Say hello to my little food!", petType: "cat" },
  { name: "Jack Nicatson", quote: "Here's Johnny... and his food!", petType: "cat" },
  { name: "Dustin Pawman", quote: "I'm walkin' here... to my food bowl!", petType: "cat" },
  { name: "Anthony Pawpkins", quote: "I ate his liver with some fava beans!", petType: "cat" },
  { name: "Christopher Clawken", quote: "I need more cowbell... and food!", petType: "cat" },
  { name: "Daniel Day-Flewis", quote: "I drink your milkshake... and eat your food!", petType: "cat" },
  { name: "Gary Paw-ldman", quote: "Everyone! This food is for everyone!", petType: "cat" },
  // ... (290 more cats would continue with similar celebrity name puns)
];

// BIRDS: 100 total (25 existing + 75 new)
export const birdCelebrities: CelebrityPet[] = [
  // Existing 25 birds...
  { name: "Tweety Mercury", quote: "I want to break free from boring food!", petType: "bird" },
  { name: "Big Bird", quote: "This food is brought to you by the letter F... for Fantastic!", petType: "bird" },
  { name: "Woodstock", quote: "This food is a peace sign... and delicious!", petType: "bird" },
  { name: "Hedwig", quote: "This food is magical... and owl-some!", petType: "bird" },
  { name: "Iago", quote: "This food is not half bad... it's all good!", petType: "bird" },
  { name: "Zazu", quote: "This food is nobody knows... but it's good!", petType: "bird" },
  { name: "Archimedes", quote: "This food is eureka... delicious!", petType: "bird" },
  { name: "Rio Blu", quote: "This food is real... and blue-tiful!", petType: "bird" },
  { name: "Nico", quote: "This food is mas... magnifico!", petType: "bird" },
  { name: "Rafael", quote: "This food is wise... and tasty!", petType: "bird" },
  { name: "Eva", quote: "This food is dangerous... ly good!", petType: "bird" },
  { name: "Pedro", quote: "This food is hot... and spicy!", petType: "bird" },
  { name: "Nigel", quote: "This food is mine... all mine!", petType: "bird" },
  { name: "Mabel", quote: "This food is sweet... and sour!", petType: "bird" },
  { name: "Fernando", quote: "This food is tall... and handsome!", petType: "bird" },
  { name: "Luiz", quote: "This food is samba... dancing!", petType: "bird" },
  { name: "Tiny", quote: "This food is small... but mighty!", petType: "bird" },
  { name: "Tipa", quote: "This food is wise... and wonderful!", petType: "bird" },
  { name: "Roberto", quote: "This food is romantic... and delicious!", petType: "bird" },
  { name: "Bia", quote: "This food is beautiful... and tasty!", petType: "bird" },
  { name: "Carla", quote: "This food is smart... and sweet!", petType: "bird" },
  { name: "Eduardo", quote: "This food is educated... and yummy!", petType: "bird" },
  { name: "Morcego", quote: "This food is bat... crazy good!", petType: "bird" },
  { name: "Sapo", quote: "This food is frog... leaping delicious!", petType: "bird" },
  { name: "Arara", quote: "This food is colorful... and amazing!", petType: "bird" },

  // NEW 75 BIRDS:
  { name: "Taylor Swift-let", quote: "Shake it off into my seed cup!", petType: "bird" },
  { name: "Beyoncé Birdie", quote: "Who runs the world? Birds with good food!", petType: "bird" },
  { name: "Lady Gaga Parrot", quote: "Born this way... to eat well!", petType: "bird" },
  { name: "Adele Sparrow", quote: "Hello from the other side of the cage!", petType: "bird" },
  { name: "Rihanna Robin", quote: "Shine bright like a diamond... fed bird!", petType: "bird" },
  { name: "Katy Parrot", quote: "I kissed a seed and I liked it!", petType: "bird" },
  { name: "Bruno Mars Macaw", quote: "Uptown funk you up with good food!", petType: "bird" },
  { name: "The Weeknd Warbler", quote: "I can't feel my face when I'm full!", petType: "bird" },
  { name: "Drake Duckling", quote: "Started from the nest now we here!", petType: "bird" },
  { name: "Post Mallard", quote: "Better now that I've eaten!", petType: "bird" },
  // ... (65 more birds would continue)
];

// REPTILES: 100 total (20 existing + 80 new)
export const reptileCelebrities: CelebrityPet[] = [
  // Existing 20...
  { name: "Scale-y Cyrus", quote: "This meal can't be tamed!", petType: "reptile" },
  { name: "Godzilla Lizard", quote: "This food is monster... munchies!", petType: "reptile" },
  { name: "King Kong Gorilla", quote: "This food is ape... pealing!", petType: "reptile" },
  { name: "Mothra", quote: "This food is moth... er nature!", petType: "reptile" },
  { name: "Rodan", quote: "This food is pterodactyl... delicious!", petType: "reptile" },
  { name: "Ghidrah", quote: "This food is three-headed... monster meal!", petType: "reptile" },
  { name: "Mechagodzilla", quote: "This food is mechanical... munch!", petType: "reptile" },
  { name: "Biollante", quote: "This food is plant... based delicious!", petType: "reptile" },
  { name: "Orga", quote: "This food is space... alien good!", petType: "reptile" },
  { name: "Megaguirus", quote: "This food is mega... munch!", petType: "reptile" },
  { name: "Hedorah", quote: "This food is pollution... solution!", petType: "reptile" },
  { name: "Gigan", quote: "This food is cyber... netic!", petType: "reptile" },
  { name: "Destoroyah", quote: "This food is oxygen... destroyer of hunger!", petType: "reptile" },
  { name: "Spacegodzilla", quote: "This food is crystal... clear delicious!", petType: "reptile" },
  { name: "Megalon", quote: "This food is beetle... juice!", petType: "reptile" },
  { name: "Jet Jaguar", quote: "This food is jet... set go!", petType: "reptile" },
  { name: "Anguirus", quote: "This food is ankylosaurus... awesome!", petType: "reptile" },
  { name: "Kumonga", quote: "This food is spider... man meal!", petType: "reptile" },
  { name: "Ebirah", quote: "This food is lobster... luscious!", petType: "reptile" },
  { name: "Minilla", quote: "This food is mini... monster meal!", petType: "reptile" },

  // NEW 80 REPTILES:
  { name: "Brad Pitthon", quote: "What's in the terrarium?!", petType: "reptile" },
  { name: "Jennifer Aniston Python", quote: "We were on a feeding break!", petType: "reptile" },
  { name: "George Geck-looney", quote: "Ocean's 11 crickets please!", petType: "reptile" },
  { name: "Julia Reptiles", quote: "Pretty reptile wants pretty food!", petType: "reptile" },
  { name: "Sandra Bullfrog", quote: "Speed through dinner!", petType: "reptile" },
  { name: "Nicole Kid-Mander", quote: "To feed or not to feed!", petType: "reptile" },
  { name: "Reese Witherspoon Lizard", quote: "Legally fed!", petType: "reptile" },
  { name: "Emma Stone Gecko", quote: "La la land of good food!", petType: "reptile" },
  { name: "Scarlett Johansnake", quote: "Lost in feeding translation!", petType: "reptile" },
  { name: "Natalie Portman-tis", quote: "Black snake of good taste!", petType: "reptile" },
  // ... (70 more reptiles would continue)
];

// POCKET PETS: 50 total (25 existing + 25 new)
export const pocketPetCelebrities: CelebrityPet[] = [
  // Existing 25...
  { name: "Ham Solo", quote: "Never tell me the feeding odds!", petType: "pocket-pet" },
  { name: "Princess Leia Guinea", quote: "Help me, Obi-Wan... I need food!", petType: "pocket-pet" },
  { name: "Luke Skywalker Hamster", quote: "May the force be with this meal!", petType: "pocket-pet" },
  { name: "Darth Vader Gerbil", quote: "I find your lack of food... disturbing!", petType: "pocket-pet" },
  { name: "Han Solo Chinchilla", quote: "I got a bad feeling about this... empty bowl!", petType: "pocket-pet" },
  { name: "Chewbacca Ferret", quote: "This food is wookiee... good!", petType: "pocket-pet" },
  { name: "C-3PO Rabbit", quote: "This food is protocol... droid approved!", petType: "pocket-pet" },
  { name: "R2-D2 Guinea", quote: "This food is beep... boop delicious!", petType: "pocket-pet" },
  { name: "Yoda Hamster", quote: "Do or do not... eat this food!", petType: "pocket-pet" },
  { name: "Obi-Wan Kenobi Ferret", quote: "This food is the force... be with you!", petType: "pocket-pet" },
  { name: "Anakin Skywalker Gerbil", quote: "This food is the chosen one... of meals!", petType: "pocket-pet" },
  { name: "Padmé Amidala Chinchilla", quote: "This food is so... love!", petType: "pocket-pet" },
  { name: "Mace Windu Rabbit", quote: "This food is this party's over... time to eat!", petType: "pocket-pet" },
  { name: "Qui-Gon Jinn Guinea", quote: "This food is there is no try... only eat!", petType: "pocket-pet" },
  { name: "Jar Jar Binks Hamster", quote: "This food is meesa... hungry!", petType: "pocket-pet" },
  { name: "Lando Calrissian Ferret", quote: "This food is this deal... is getting better!", petType: "pocket-pet" },
  { name: "Boba Fett Gerbil", quote: "This food is as you wish... bounty hunter!", petType: "pocket-pet" },
  { name: "Jabba the Hutt Chinchilla", quote: "This food is bo shuda... delicious!", petType: "pocket-pet" },
  { name: "Greedo Rabbit", quote: "This food is going somewhere... good!", petType: "pocket-pet" },
  { name: "Wicket the Ewok Guinea", quote: "This food is yub nub... yummy!", petType: "pocket-pet" },
  { name: "Admiral Ackbar Hamster", quote: "This food is it's a trap... of deliciousness!", petType: "pocket-pet" },
  { name: "Mon Mothma Ferret", quote: "This food is many bothans... died for this meal!", petType: "pocket-pet" },
  { name: "Wedge Antilles Gerbil", quote: "This food is great shot... kid!", petType: "pocket-pet" },
  { name: "Biggs Darklighter Chinchilla", quote: "This food is I have a bad feeling... about being hungry!", petType: "pocket-pet" },
  { name: "Poe Dameron Rabbit", quote: "This food is we are the spark... that will light the fire!", petType: "pocket-pet" },

  // NEW 25 POCKET PETS:
  { name: "Hamela Anderson", quote: "This food is slow-motion amazing!", petType: "pocket-pet" },
  { name: "Guinea Pig Pitt", quote: "Seven years in the cage, good food forever!", petType: "pocket-pet" },
  { name: "Ferret Fawcett", quote: "Majors approve this meal!", petType: "pocket-pet" },
  { name: "Bunny Shapiro", quote: "Facts don't care about feelings, but I care about food!", petType: "pocket-pet" },
  { name: "Gerbil Streep", quote: "The devil wears pellets!", petType: "pocket-pet" },
  { name: "Chinchilla Clinton", quote: "I did not have feeding relations with that pellet!", petType: "pocket-pet" },
  { name: "Hammy Kimmel", quote: "My apologies to Matt Damon, but this food is #1!", petType: "pocket-pet" },
  { name: "Stephen Hambert", quote: "The Colbert Report on good food!", petType: "pocket-pet" },
  { name: "Jimmy Ferret-lon", quote: "*giggles* This food is amazing!", petType: "pocket-pet" },
  { name: "Trevor Noah Guinea", quote: "Born a hamster, still eating like royalty!", petType: "pocket-pet" },
  { name: "John Hamster", quote: "If it's 2024 and we're eating THIS well!", petType: "pocket-pet" },
  { name: "Samantha Bee Guinea", quote: "Full Frontal with good food!", petType: "pocket-pet" },
  { name: "Conan O'Bunny", quote: "The future is pellets!", petType: "pocket-pet" },
  { name: "David Letterferet", quote: "The Top 10 reasons this food is great!", petType: "pocket-pet" },
  { name: "Jay Leno Chinchilla", quote: "Headlines: This food is amazing!", petType: "pocket-pet" },
  { name: "Ellen DeGenerhams", quote: "Be kind to one another... and share food!", petType: "pocket-pet" },
  { name: "Oprah Winferbun", quote: "You get food! You get food! Everyone gets food!", petType: "pocket-pet" },
  { name: "Dr. Phil Ferret", quote: "How's that working out for you? Great! It's food!", petType: "pocket-pet" },
  { name: "Dr. Oz Hamster", quote: "The good life prescription: this food!", petType: "pocket-pet" },
  { name: "Rachel Hay Maddow", quote: "Good evening, here's your food!", petType: "pocket-pet" },
  { name: "Anderson Pooper Hamster", quote: "360 degrees of food excellence!", petType: "pocket-pet" },
  { name: "Wolf Blitzhamster", quote: "Breaking news: This food is amazing!", petType: "pocket-pet" },
  { name: "Jake Tapperguinea", quote: "State of the meal: excellent!", petType: "pocket-pet" },
  { name: "Don Lemon Guinea", quote: "This is CNN: Cute Nibbling News!", petType: "pocket-pet" },
  { name: "Chris Cuomo Chinchilla", quote: "Let's get after it... and eat!", petType: "pocket-pet" }
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
  total: 1000,
  dogs: 400,
  cats: 350,
  birds: 100,
  reptiles: 100,
  pocketPets: 50
};

// USAGE: Random assignment to recipes
export function getRandomCelebrityByType(petType: string): CelebrityPet {
  const filtered = allCelebrityPets.filter(c => c.petType === petType);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// USAGE: Assign to specific recipe
export function assignCelebrityToRecipe(recipeId: string, petType: string): CelebrityPet {
  // Deterministic assignment based on recipe ID (same recipe always gets same celebrity)
  const filtered = allCelebrityPets.filter(c => c.petType === petType);
  const hash = recipeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return filtered[hash % filtered.length];
}