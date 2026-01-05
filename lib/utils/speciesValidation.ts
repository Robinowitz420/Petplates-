export function validateSpeciesLanguageDetailed(
  analysis: string,
  species: string
): { isValid: boolean; errors: string[] } {
  const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const containsBlockedTerm = (haystackLower: string, termLower: string): boolean => {
    if (!termLower) return false;
    if (termLower.includes(' ')) return haystackLower.includes(termLower);
    const re = new RegExp(`\\b${escapeRegExp(termLower)}\\b`, 'i');
    return re.test(haystackLower);
  };

  const forbidden: Record<string, string[]> = {
    bird: [
      'paws',
      'fur',
      'coat',
      'fetch',
      'leash',
      'walks',
      'running',
      'grooming',
      'whiskers',
    ],
    reptile: [
      'paws',
      'fur',
      'coat',
      'whiskers',
      'fetch',
      'leash',
      'walks',
      'running',
      'feathers',
      'plumage',
      'beak',
      'flight',
      'perching',
      'singing',
    ],
    cat: ['fetch', 'walks on leash'],
    dog: ['feathers', 'plumage', 'beak', 'flight', 'flight muscles', 'perching', 'basking', 'shell', 'scales'],
    'pocket-pet': ['flying', 'flight', 'beak', 'plumage', 'feathers'],
  };

  const normalizedSpecies = String(species || '').toLowerCase().trim();
  const blocked = forbidden[normalizedSpecies] || [];
  const analysisLower = String(analysis || '').toLowerCase();
  const errors: string[] = [];

  for (const word of blocked) {
    const needle = String(word || '').toLowerCase().trim();
    if (containsBlockedTerm(analysisLower, needle)) {
      errors.push(`Forbidden word "${needle}" found for ${normalizedSpecies || 'pet'}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateSpeciesLanguage(analysis: string, species: string): boolean {
  return validateSpeciesLanguageDetailed(analysis, species).isValid;
}
