export type SpeciesEngineKey = 'dog' | 'cat' | 'bird' | 'reptile' | 'pocket-pet';

export type Archetype = { name: string; description: string };

export type SpeciesEngineContext = {
  species: SpeciesEngineKey;
  petName: string;
  ageGroup: string;
  weightKg?: number;
  healthConcerns: string[];
  allergies: string[];
  bannedIngredients: string[];
  breed?: string;
  requestedCount: number;
  perfectPet: boolean;
};

export type RecipeCandidate = {
  name: string;
  ingredients: Array<{ name: string; amount: string }>;
};

export type CandidateIssueSummary = {
  name: string;
  score?: number;
  topIssues: string[];
};

export interface SpeciesEngine {
  buildPrompt(ctx: SpeciesEngineContext): string;
  buildRevisionPrompt(
    ctx: SpeciesEngineContext,
    failingCandidates: RecipeCandidate[],
    topIssuesByCandidate: CandidateIssueSummary[]
  ): string;
  getArchetypes(): Archetype[];
  getCompletenessMechanismRules(): string[];
  getTargetScoreThreshold(perfectPet: boolean): number;
}

import * as dog from './dog';
import * as cat from './cat';
import * as bird from './bird';
import * as reptile from './reptile';
import * as pocketPet from './pocketPet';

export function normalizeSpeciesEngineKey(species: string): SpeciesEngineKey {
  const s = String(species || '').trim().toLowerCase();
  if (s === 'dog' || s === 'dogs') return 'dog';
  if (s === 'cat' || s === 'cats') return 'cat';
  if (s === 'bird' || s === 'birds') return 'bird';
  if (s === 'reptile' || s === 'reptiles') return 'reptile';
  if (s === 'pocket-pet' || s === 'pocket-pets' || s === 'pocketpet') return 'pocket-pet';
  return 'dog';
}

export function getSpeciesEngine(species: string | SpeciesEngineKey): SpeciesEngine {
  const key = typeof species === 'string' ? normalizeSpeciesEngineKey(species) : species;
  switch (key) {
    case 'dog':
      return dog;
    case 'cat':
      return cat;
    case 'bird':
      return bird;
    case 'reptile':
      return reptile;
    case 'pocket-pet':
      return pocketPet;
    default:
      return dog;
  }
}

export function buildPrompt(ctx: Omit<SpeciesEngineContext, 'species'> & { species: string }): string {
  const engine = getSpeciesEngine(ctx.species);
  return engine.buildPrompt({ ...ctx, species: normalizeSpeciesEngineKey(ctx.species) });
}

export function buildRevisionPrompt(
  ctx: Omit<SpeciesEngineContext, 'species'> & { species: string },
  failingCandidates: RecipeCandidate[],
  topIssuesByCandidate: CandidateIssueSummary[]
): string {
  const engine = getSpeciesEngine(ctx.species);
  return engine.buildRevisionPrompt(
    { ...ctx, species: normalizeSpeciesEngineKey(ctx.species) },
    failingCandidates,
    topIssuesByCandidate
  );
}

export function getArchetypesForSpecies(species: string): Archetype[] {
  return getSpeciesEngine(species).getArchetypes();
}

export function getCompletenessMechanismRulesForSpecies(species: string): string[] {
  return getSpeciesEngine(species).getCompletenessMechanismRules();
}

export function getTargetScoreThresholdForSpecies(species: string, perfectPet: boolean): number {
  return getSpeciesEngine(species).getTargetScoreThreshold(perfectPet);
}
