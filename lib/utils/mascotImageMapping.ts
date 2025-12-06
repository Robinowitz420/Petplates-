// lib/utils/mascotImageMapping.ts
// Maps recipe categories to mascot images in /images/emojis/Mascots/

/**
 * Get the mascot image path for a recipe category
 * @param category - Recipe category (dogs, cats, birds, reptiles, pocket-pets)
 * @returns Path to the mascot image for that category
 */
export function getMascotImageForCategory(category: string): string {
  const categoryLower = (category || '').toLowerCase();
  
  const categoryToMascot: Record<string, string> = {
    'dogs': '/images/emojis/Mascots/Prep Puppy.jpg',
    'cats': '/images/emojis/Mascots/ProfessorPurffesor.jpg',
    'birds': '/images/emojis/Mascots/RobinRed-Route.jpg',
    'reptiles': '/images/emojis/Mascots/SherlockShells.jpg',
    'pocket-pets': '/images/emojis/Mascots/harvesthamster.jpg',
    // Handle plural forms
    'dog': '/images/emojis/Mascots/Prep Puppy.jpg',
    'cat': '/images/emojis/Mascots/ProfessorPurffesor.jpg',
    'bird': '/images/emojis/Mascots/RobinRed-Route.jpg',
    'reptile': '/images/emojis/Mascots/SherlockShells.jpg',
    'pocket-pet': '/images/emojis/Mascots/harvesthamster.jpg',
  };
  
  return categoryToMascot[categoryLower] || '/images/emojis/Mascots/Mascot-Emoji-Faces.png';
}
