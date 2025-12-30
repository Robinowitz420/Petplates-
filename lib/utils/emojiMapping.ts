// lib/utils/emojiMapping.ts
// Smart emoji to image mapping based on actual grid content

/**
 * Based on NEW grid analysis (updated with latest uploads):
 * - amojis.png: 8x10 grid, 80 unique animal emojis (NEW - segmented as amojis_001.png through amojis_080.png)
 * - copilot_emojis: 10x11 grid, 110 emojis (more variety, includes symbols)
 * - emoji_grid: 7 grids, 64 each (some duplicates with amojis)
 * - best set: 4x4 grid, 16 ultra-minimalist icons (NEW - segmented with descriptive names)
 * 
 * Priority: best > amojis > copilot > emoji_grid
 * 
 * NEW Best set grid layout (4x4):
 * Row 1: Dog (best_dog.png), Cat (best_cat.png), Bird (best_bird.png), Lizard/Frog (best_reptile.png)
 * Row 2: Rabbit (best_rabbit.png), Hamster (best_hamster.png), Thumbs Up Left (best_thumbs_up_left.png), Thumbs Up Right (best_thumbs_up_right.png)
 * Row 3: Balance Scale (best_balance_scale.png), Warning (best_warning.png), Check Mark (best_check_mark.png), Trophy (best_trophy.png)
 * Row 4: Paw Prints (best_paw_prints.png), Star (best_star.png), Sparkle Single (best_sparkle_single.png), Sparkles Multiple (best_sparkles_multiple.png)
 */

// Primary pet emojis - using mascot images
export const PET_EMOJI_MAP: Record<string, string> = {
  // Main pet types - using mascot images
  '🐕': '/images/emojis/Mascots/Prep Puppy.jpg', // Dog - Prep Puppy mascot
  '🐶': '/images/emojis/Mascots/Prep Puppy.jpg', // Dog (alternative) - Prep Puppy mascot
  '🐈': '/images/emojis/Mascots/ProfessorPurffesor.jpg', // Cat - Professor Purrfessor mascot
  '🐱': '/images/emojis/Mascots/ProfessorPurffesor.jpg', // Cat (alternative) - Professor Purrfessor mascot
  '🦜': '/images/emojis/Mascots/RobinRed-Route.jpg', // Bird/Parrot - Robin Redroute mascot
  '🐦': '/images/emojis/Mascots/RobinRed-Route.jpg', // Bird (alternative) - Robin Redroute mascot
  '🦎': '/images/emojis/Mascots/SherlockShells.jpg', // Lizard/Frog - Sherlock Shells mascot
  '🐢': '/images/emojis/Mascots/SherlockShells.jpg', // Turtle (alternative) - Sherlock Shells mascot
  '🐰': '/images/emojis/Mascots/harvesthamster.jpg', // Rabbit - Harvest Hamster mascot
  '🐇': '/images/emojis/Mascots/harvesthamster.jpg', // Rabbit (alternative) - Harvest Hamster mascot
  
  // Pocket pet variations - using mascot images
  '🐹': '/images/emojis/Mascots/harvesthamster.jpg', // Hamster - Harvest Hamster mascot
  '🐭': '/images/emojis/amojis_038.png', // Mouse (not in best set, using amojis fallback - Row 5, position 8)
  '🦔': '/images/emojis/Mascots/harvesthamster.jpg', // Hedgehog (use hamster) - Harvest Hamster mascot
  '🦦': '/images/emojis/Mascots/harvesthamster.jpg', // Ferret/Otter (use hamster) - Harvest Hamster mascot
  
  // Additional animals - fallback to amojis for ones not in best set
  // Amojis grid (8x10, 80 icons) - various animals including:
  '🐻': '/images/emojis/amojis_011.png', // Bear (brown, standing on two legs) - Amojis grid Row 1, position 8
  '🐼': '/images/emojis/amojis_012.png', // Panda (black and white, facing left/right) - Amojis grid Row 1, position 9 or Row 2, positions 4-5
  '🦊': '/images/emojis/amojis_014.png', // Fox (orange, pointed ears, bushy tail) - Amojis grid Row 1, position 9 or Row 2, position 6
  '🐨': '/images/emojis/amojis_017.png', // Koala (grey, with leaf) - Amojis grid Row 3, position 1
  '🐸': '/images/emojis/Mascots/SherlockShells.jpg', // Frog (use reptile mascot) - Sherlock Shells mascot
  '🐟': '/images/emojis/amojis_026.png', // Fish (yellow, with fins) - Amojis grid Row 5, position 2
  '🐴': '/images/emojis/amojis_049.png', // Horse (yellow/grey/brown/orange, standing on four legs) - Amojis grid Row 6, position 9 or Row 7, positions 1,5,7,8,9
  '🦉': '/images/emojis/amojis_007.png', // Owl (black/brown, large white eyes) - Amojis grid Row 1, position 2 or Row 8, position 6
  
  // Paw prints - using best set (Row 4 of best grid)
  '🐾': '/images/emojis/best_paw_prints.png', // Paw Prints (three dark grey/black prints, diagonal arrangement) - Best grid Row 4, position 1
};

// Status/symbol emojis - using "best" set (ultra-minimalist, best quality)
// Best set grid positions: Row 2 (positions 3-4), Row 3 (positions 1-4), Row 4 (positions 2-4)
export const STATUS_EMOJI_MAP: Record<string, string> = {
  '⭐': '/images/emojis/best_star.png', // Star (five-pointed yellow) - Best grid Row 4, position 2
  '✨': '/images/emojis/best_sparkles_multiple.png', // Sparkles (multiple yellow four-pointed sparkles) - Best grid Row 4, position 4
  '✅': '/images/emojis/best_check_mark.png', // Check Mark (bold green) - Best grid Row 3, position 3
  '❌': '/images/emojis/copilot_emojis_071.png', // X Mark (not in best set, use copilot)
  '⚠️': '/images/emojis/best_warning.png', // Warning (yellow equilateral triangle with black exclamation mark) - Best grid Row 3, position 2
  '👍': '/images/emojis/best_thumbs_up_right.png', // Thumbs Up (yellow hand gesture, pointing right) - Best grid Row 2, position 4
  '👎': '/images/emojis/copilot_emojis_072.png', // Thumbs Down (not in best set, use copilot)
  '⚖️': '/images/emojis/Mascots/ProfessorPurffesor.jpg', // Balance Scale - Professor Purrfessor mascot (research, balance)
  '🏆': '/images/emojis/best_trophy.png', // Trophy (yellow cup with two handles) - Best grid Row 3, position 4
  // Additional celebration emojis used on site - using mascot images
  '🎉': '/images/emojis/Mascots/Prep Puppy.jpg', // Party Popper - Prep Puppy mascot (celebration)
  '🎊': '/images/emojis/Mascots/Prep Puppy.jpg', // Confetti - Prep Puppy mascot (celebration)
  '❤️': '/images/emojis/Mascots/Prep Puppy.jpg', // Red Heart - Prep Puppy mascot (warmth, care)
  '💚': '/images/emojis/Mascots/Prep Puppy.jpg', // Green Heart - Prep Puppy mascot (warmth, care)
  '💛': '/images/emojis/Mascots/Prep Puppy.jpg', // Yellow Heart - Prep Puppy mascot (warmth, care)
  '🎂': '/images/emojis/Mascots/Prep Puppy.jpg', // Birthday Cake - Prep Puppy mascot (celebration)
};

// Combined map
export const EMOJI_IMAGE_MAP: Record<string, string> = {
  ...PET_EMOJI_MAP,
  ...STATUS_EMOJI_MAP,
};

/**
 * Get image path for an emoji
 * Returns null if no mapping found (fallback to hash-based selection)
 */
export function getEmojiImagePath(emoji: string): string | null {
  return EMOJI_IMAGE_MAP[emoji] || null;
}

/**
 * Hash-based fallback for unmapped emojis
 * Uses amojis set (most consistent quality)
 */
export function getHashBasedEmojiImage(emoji: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < emoji.length; i++) {
    hash = ((hash << 5) - hash) + emoji.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use NEW amojis grid (80 images, most consistent)
  const imageNum = (Math.abs(hash) % 80) + 1;
  return `/images/emojis/amojis_${imageNum.toString().padStart(3, '0')}.png`;
}

/**
 * Mascot face emojis - head/bust portraits of the 5 Meal Masters mascots
 * Source: mascot_face_emojis-removebg-preview.png (5 mascot heads in a horizontal row)
 * 
 * Brand Bible Alignment:
 * - Puppy Prepper (Chef) - Light gold dog with chef hat
 * - Professor Purrfessor (Researcher) - Black cat with glasses
 * - Sherlock Shells (Explorer) - Green turtle with cap and monocle
 * - Farmer Fluff (Ingredient Provider) - Dark brown hamster
 * - Robin Redroute (Delivery Specialist) - Red bird with captain's hat and goggles
 *
 * Usage Guidelines (Strategic Mascot Usage):
 * ✅ GOOD: Meal creation tool, ingredient selection, compatibility scoring, error/success states, 
 *          loading screens, tooltips, achievements, homepage hero, empty states, onboarding,
 *          "ingredient discovered" moments, "new recipe unlocked" popups, delivery confirmations
 * ❌ AVOID: Educational nutritional text, legal/policy pages, checkout, payment, longform articles, 
 *          scientific explanations, body text paragraphs, navigation menus, critical flows
 */
export const MASCOT_FACE_EMOJI_MAP: Record<string, string> = {
  // Puppy Prepper - The Chef & Meal-Prep Lead
  // Position 1 (left): Yellow dog's head with friendly expression, small black eyes and nose/mouth, wearing puffy white chef's hat
  // Personality: Serious chef energy, impatient, slightly Gordon Ramsay; secretly soft-hearted
  // Color: Light gold
  'puppy-prepper': '/images/emojis/Mascots/Prep Puppy.jpg', // Official name from brand bible
  'barker': '/images/emojis/Mascots/Prep Puppy.jpg', // Legacy name (deprecated)
  'prepperpuppy': '/images/emojis/Mascots/Prep Puppy.jpg', // Alternative spelling
  
  // Professor Purrfessor - The Researcher & Recipe Tester
  // Position 2: Dark grey/black cat's head with large round white glasses covering eyes, small white triangular nose and mouth, pointed ears
  // Personality: Nerdy, anxious, brilliant, catastrophizes constantly
  // Color: Black/charcoal
  'professor-purrfessor': '/images/emojis/Mascots/ProfessorPurffesor.jpg', // Official name from brand bible
  'whiskers': '/images/emojis/Mascots/ProfessorPurffesor.jpg', // Legacy name (deprecated)
  
  // Sherlock Shells - Explorer & Risk Inspector
  // Position 3: Light green round creature's head (turtle/blob), single large black eye with white highlight, wearing dark orange cap with small brim, black monocle hanging from right eye
  // Personality: Soft-spoken, melancholy, overly thoughtful
  // Color: Green
  'sherlock-shells': '/images/emojis/Mascots/SherlockShells.jpg', // Official name from brand bible
  'scales': '/images/emojis/Mascots/SherlockShells.jpg', // Legacy name (deprecated)
  
  // Farmer Fluff - Ingredient Provider & Farm Manager
  // Position 4: Brown hamster's head, light brown face with darker brown outline for head and ears, small black eyes and nose/mouth
  // Personality: ADHD, upbeat, impulsive, very productive in bursts
  // Color: Dark brown
  'farmer-fluff': '/images/emojis/Mascots/harvesthamster.jpg', // Official name from brand bible
  'pip': '/images/emojis/Mascots/harvesthamster.jpg', // Legacy name (deprecated)
  'harvest-hamster': '/images/emojis/Mascots/harvesthamster.jpg', // Legacy name (deprecated)
  
  // Robin Redroute - Packaging & Delivery Specialist
  // Position 5 (right): Red bird's head with small yellow beak, wearing dark blue/black captain's hat with brim, round green goggles over eyes
  // Personality: Hyper, chatty, easily excited
  // Color: Red
  'robin-redroute': '/images/emojis/Mascots/RobinRed-Route.jpg', // Official name from brand bible
  'robin-red-route': '/images/emojis/Mascots/RobinRed-Route.jpg', // Alternative spelling
  'sunny': '/images/emojis/Mascots/RobinRed-Route.jpg', // Legacy name (deprecated)
};

/**
 * Get emoji image path with fallback
 */
export function getEmojiImage(emoji: string): string {
  return getEmojiImagePath(emoji) || getHashBasedEmojiImage(emoji);
}

/**
 * Get mascot face image path
 * Returns the image path for a mascot face identifier
 */
export function getMascotFaceImage(mascotName: string): string | null {
  const normalized = mascotName.toLowerCase().replace(/\s+/g, '-');
  return MASCOT_FACE_EMOJI_MAP[normalized] || null;
}

/**
 * Get mascot face image for a pet category
 * Maps pet types to their corresponding mascot images
 */
export function getMascotFaceForPetType(petType: string): string {
  const typeLower = (petType || '').toLowerCase();
  const typeToMascot: Record<string, string> = {
    'dogs': '/images/emojis/Mascots/Prep Puppy.jpg',
    'cats': '/images/emojis/Mascots/ProfessorPurffesor.jpg',
    'birds': '/images/emojis/Mascots/RobinRed-Route.jpg',
    'reptiles': '/images/emojis/Mascots/SherlockShells.jpg',
    'pocket-pets': '/images/emojis/Mascots/harvesthamster.jpg',
    // Handle singular forms
    'dog': '/images/emojis/Mascots/Prep Puppy.jpg',
    'cat': '/images/emojis/Mascots/ProfessorPurffesor.jpg',
    'bird': '/images/emojis/Mascots/RobinRed-Route.jpg',
    'reptile': '/images/emojis/Mascots/SherlockShells.jpg',
    'pocket-pet': '/images/emojis/Mascots/harvesthamster.jpg',
  };
  return typeToMascot[typeLower] || '/images/emojis/Mascots/Mascot-Emoji-Faces.png';
}

/**
 * Get full profile picture image for a pet type
 * Used for the large profile picture in profile cards (not thumbnails)
 * Maps to full-body character images based on pet type
 */
export function getProfilePictureForPetType(petType: string): string {
  const typeLower = (petType || '').toLowerCase();
  const typeToProfilePic: Record<string, string> = {
    'dogs': '/images/emojis/Mascots/PrepPuppy/PrepPuppyProfilePic.png',
    'cats': '/images/emojis/Mascots/Proffessor Purfessor/ProfessorPurrfesorProfilePic.jpg',
    'birds': '/images/emojis/Mascots/Robin Red-Route/RobinRedRouteProfilePic.jpg',
    'reptiles': '/images/emojis/Mascots/Sherlock Shells/SherlockShellsProfilePic.png',
    'turtles': '/images/emojis/Mascots/Sherlock Shells/SherlockShellsProfilePic.png',
    'pocket-pets': '/images/emojis/Mascots/Harvest Hamster/HarvestHamsterProfilePic.png',
    // Handle singular forms
    'dog': '/images/emojis/Mascots/PrepPuppy/PrepPuppyProfilePic.png',
    'cat': '/images/emojis/Mascots/Proffessor Purfessor/ProfessorPurrfesorProfilePic.jpg',
    'bird': '/images/emojis/Mascots/Robin Red-Route/RobinRedRouteProfilePic.jpg',
    'reptile': '/images/emojis/Mascots/Sherlock Shells/SherlockShellsProfilePic.png',
    'turtle': '/images/emojis/Mascots/Sherlock Shells/SherlockShellsProfilePic.png',
    'pocket-pet': '/images/emojis/Mascots/Harvest Hamster/HarvestHamsterProfilePic.png',
  };
  return typeToProfilePic[typeLower] || '/images/emojis/Mascots/Mascot-Emoji-Faces.png';
}

