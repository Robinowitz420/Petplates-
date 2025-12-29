
export type PetType = 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';
export type PetCategory = 'dogs' | 'cats' | 'birds' | 'reptiles' | 'pocket-pets';

function canonicalizePetTypeInput(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
}

function warnUnknownPetType(context: string | undefined, original: unknown, normalized: string): void {
  if (process.env.NODE_ENV === 'production') return;
  const suffix = context ? ` (${context})` : '';
  console.warn(`Unknown pet type "${normalized}"${suffix}`, { original, normalized });
}

export function normalizePetType(type: unknown, context?: string): PetType {
  if (type == null) {
    warnUnknownPetType(context, type, 'null');
    return 'dog';
  }

  const str = canonicalizePetTypeInput(type);

  if (str === 'dogs' || str === 'dog') return 'dog';
  if (str === 'cats' || str === 'cat') return 'cat';
  if (str === 'birds' || str === 'bird') return 'bird';
  if (str === 'reptiles' || str === 'reptile') return 'reptile';

  if (
    str === 'pocket-pets' ||
    str === 'pocket-pet' ||
    str === 'pocket pets' ||
    str === 'pocket pet'
  ) {
    return 'pocket-pet';
  }

  warnUnknownPetType(context, type, str);
  return 'dog';
}

export function normalizePetCategory(type: unknown, context?: string): PetCategory {
  if (type == null) {
    warnUnknownPetType(context, type, 'null');
    return 'dogs';
  }

  const str = canonicalizePetTypeInput(type);

  if (str === 'dogs' || str === 'dog') return 'dogs';
  if (str === 'cats' || str === 'cat') return 'cats';
  if (str === 'birds' || str === 'bird') return 'birds';
  if (str === 'reptiles' || str === 'reptile') return 'reptiles';

  if (
    str === 'pocket-pets' ||
    str === 'pocket-pet' ||
    str === 'pocket pets' ||
    str === 'pocket pet'
  ) {
    return 'pocket-pets';
  }

  warnUnknownPetType(context, type, str);
  return 'dogs';
}

export function isPetType(type: unknown, target: PetType | PetCategory, context?: string): boolean {
  return normalizePetType(type, context) === normalizePetType(target, context);
}

export function toCategory(type: PetType): PetCategory {
  switch (type) {
    case 'dog':
      return 'dogs';
    case 'cat':
      return 'cats';
    case 'bird':
      return 'birds';
    case 'reptile':
      return 'reptiles';
    case 'pocket-pet':
      return 'pocket-pets';
  }
}

export function toType(category: PetCategory): PetType {
  switch (category) {
    case 'dogs':
      return 'dog';
    case 'cats':
      return 'cat';
    case 'birds':
      return 'bird';
    case 'reptiles':
      return 'reptile';
    case 'pocket-pets':
      return 'pocket-pet';
  }
}
