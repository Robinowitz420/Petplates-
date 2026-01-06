'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { scoreWithSpeciesEngine } from '@/lib/utils/speciesScoringEngines';
import type { Recipe } from '@/lib/types';
import { actionNeededBeep } from '@/lib/utils/beep';
import { normalizePetType } from '@/lib/utils/petType';
import AlphabetText from '@/components/AlphabetText';

type ModalPet = {
  id: string;
  name?: string;
  type: unknown;
  breed?: string;
  age?: string | number;
  weight?: string | number;
  weightKg?: number;
  activityLevel?: unknown;
  healthConcerns?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
};

interface Props {
  recipe: Recipe;
  pet?: ModalPet | null;
  onClose?: () => void;
}

export default function RecipeScoreModal({ recipe, pet, onClose }: Props) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiExplain, setAiExplain] = useState<{
    summary: string;
    healthConcernNotes: Array<{ concern: string; note: string }>;
    weight: string;
    age: string;
    modelUsed?: string;
  } | null>(null);

  const scorePayload = useMemo(() => {
    if (!pet) return { overallScore: undefined };

    try {
      const scored = scoreWithSpeciesEngine(recipe, {
        id: pet.id,
        name: pet.name || 'Pet',
        type: normalizePetType(pet.type, 'RecipeScoreModal'),
        breed: pet.breed,
        age: typeof pet.age === 'string' ? parseFloat(pet.age) || 1 : (pet.age || 1),
        weight: (pet as any).weightKg || pet.weight || 10,
        activityLevel: (pet as any).activityLevel,
        healthConcerns: (pet as any).healthConcerns || [],
        dietaryRestrictions: (pet as any).dietaryRestrictions || [],
        allergies: (pet as any).allergies || [],
      } as any);

      return {
        overallScore: scored.overallScore,
        warnings: scored.warnings,
        strengths: scored.strengths,
      };
    } catch (error) {
      console.error('Error calculating compatibility:', error);
      return { overallScore: undefined };
    }
  }, [pet, recipe]);

  const recipePayload = useMemo(() => {
    return {
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      description: recipe.description,
      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map((i: any) => ({ name: i?.name, amount: i?.amount }))
        : [],
    };
  }, [recipe.id, recipe.name, recipe.category, recipe.description, recipe.ingredients]);

  const requestBody = useMemo(() => {
    if (!pet) return null;
    return JSON.stringify({
      pet,
      recipe: recipePayload,
      score: scorePayload,
    });
  }, [pet, recipePayload, scorePayload]);

  useEffect(() => {
    actionNeededBeep();
  }, []);

  useEffect(() => {
    if (!pet || !requestBody) return;
    let cancelled = false;

    setAiLoading(true);
    setAiError(null);
    setAiExplain(null);

    (async () => {
      try {
        const resp = await fetch('/api/compatibility/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        });

        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          throw new Error(text || `Request failed (${resp.status})`);
        }

        const data = (await resp.json()) as any;
        if (cancelled) return;
        setAiExplain({
          summary: String(data?.summary || ''),
          healthConcernNotes: Array.isArray(data?.healthConcernNotes)
            ? data.healthConcernNotes
                .map((item: any) => {
                  const concern = String(item?.concern || '').trim();
                  const note = String(item?.note || '').trim();
                  return concern && note ? { concern, note } : null;
                })
                .filter(Boolean)
            : [],
          weight: String(data?.weight || ''),
          age: String(data?.age || ''),
          modelUsed: typeof data?.modelUsed === 'string' ? data.modelUsed : undefined,
        });
      } catch (e) {
        if (cancelled) return;
        setAiError(e instanceof Error ? e.message : String(e));
      } finally {
        if (cancelled) return;
        setAiLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pet, requestBody]);

  const aiSummary = useMemo(() => String(aiExplain?.summary || '').trim(), [aiExplain]);
  const aiWeight = useMemo(() => String(aiExplain?.weight || '').trim(), [aiExplain]);
  const aiAge = useMemo(() => String(aiExplain?.age || '').trim(), [aiExplain]);

  const cleanMarkdownArtifacts = (value: string): string =>
    String(value || '')
      .replace(/^\s*#+\s*/gm, '')
      .replace(/\*\*/g, '');

  const healthConcernNotes = useMemo(() => {
    if (!pet) return [] as Array<{ concern: string; note: string }>;

    const petConcerns = Array.isArray((pet as any).healthConcerns)
      ? ((pet as any).healthConcerns as string[]).map((c) => String(c || '').trim()).filter(Boolean)
      : [];

    const notes = Array.isArray(aiExplain?.healthConcernNotes)
      ? aiExplain!.healthConcernNotes
          .map((n) => ({ concern: String(n?.concern || '').trim(), note: String(n?.note || '').trim() }))
          .filter((n) => n.concern && n.note)
      : [];

    return petConcerns.map((concern) => {
      const found = notes.find((n) => n.concern.toLowerCase() === concern.toLowerCase());
      return (
        found || {
          concern,
          note: 'No specific note available for this concern based on the current data. Consider confirming with your veterinarian.',
        }
      );
    });
  }, [aiExplain, pet]);

  const contentWrapperClass = aiLoading ? 'p-6 bg-surface' : 'p-6 bg-surface max-h-[75vh]';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 sm:px-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-6xl bg-surface rounded-xl shadow-2xl overflow-hidden border border-surface-highlight">
        <div className="flex items-center justify-between p-5 border-b border-surface-highlight bg-surface">
          <div className="flex flex-col">
            <AlphabetText text="Summary" size={64} className="mb-1 leading-none" />
            <span className="text-sm uppercase tracking-[0.2em] text-gray-400">Compatibility Details</span>
          </div>
          <button onClick={onClose} className="p-2 rounded text-gray-400 hover:bg-surface-highlight hover:text-white">
            <X />
          </button>
        </div>

        <div className={contentWrapperClass}>

          {aiLoading ? (
            <div className="flex flex-col items-center justify-center gap-6 py-12">
              <video
                src="/images/emojis/Mascots/Proffessor Purfessor/ClassAnimated.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '520px',
                  height: '520px',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  display: 'block',
                }}
                className="rounded-2xl border-2 border-surface-highlight shadow-2xl object-contain"
                aria-label="Professor Purfessor is analyzing this meal"
              />

              <div className="text-base text-gray-200 tracking-wide">Professor Purfessor is analyzing this meal…</div>
            </div>
          ) : aiError ? (
            <div className="mt-3 text-sm text-red-300/80">Unable to generate explanation right now.</div>
          ) : (aiSummary || aiWeight || aiAge || healthConcernNotes.length > 0) ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">

                <div className="flex justify-center lg:justify-start">
                  <Image
                    src="/images/emojis/Mascots/Proffessor Purfessor/ProfessorPurfessorClassroom.png"
                    alt="Professor Purfessor in classroom"
                    width={280}
                    height={280}
                    className="rounded-lg object-contain"
                    unoptimized
                  />
                </div>

                <div className="overflow-y-auto pr-2 max-h-[70vh] space-y-5 text-sm text-gray-300">
                  {aiSummary ? (
                    <div>
                      <div className="whitespace-pre-wrap">{cleanMarkdownArtifacts(aiSummary)}</div>
                    </div>
                  ) : null}

                  {healthConcernNotes.length > 0 ? (
                    <div>
                      <div className="text-gray-200 font-semibold mb-2">Health concerns</div>
                      <div className="space-y-3">
                        {healthConcernNotes.map((item) => (
                          <div key={item.concern} className="pl-4 border-l-2 border-surface-highlight/50">
                            <div className="text-gray-200 font-semibold capitalize">{item.concern}</div>
                            <div className="mt-1 text-gray-300 whitespace-pre-wrap">{cleanMarkdownArtifacts(item.note)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {aiWeight ? (
                    <div>
                      <div className="text-gray-200 font-semibold mb-2">Weight</div>
                      <div className="whitespace-pre-wrap">{cleanMarkdownArtifacts(aiWeight)}</div>
                    </div>
                  ) : null}

                  {aiAge ? (
                    <div>
                      <div className="text-gray-200 font-semibold mb-2">Age</div>
                      <div className="whitespace-pre-wrap">{cleanMarkdownArtifacts(aiAge)}</div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-gray-500">No explanation available.</div>
          )}
        </div>
      </div>
    </div>
  );
}