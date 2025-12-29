function stripParentheticals(value: string): string {
  return value.replace(/\([^)]*\)/g, ' ');
}

export function normalizeIngredientKey(value: string): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
}

export function normalizeIngredientQuery(value: string): string {
  const base = normalizeIngredientKey(value);
  const withoutParens = stripParentheticals(base).replace(/\s+/g, ' ').trim();
  const withoutDescriptors = withoutParens
    .replace(/\b(raw|cooked|fresh|frozen|minimal|mashed|boneless|lean)\b/g, ' ')
    .replace(/\b(tiny|small)\s+amounts\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return withoutDescriptors || base;
}
