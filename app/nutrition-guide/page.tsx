'use client';

import Link from 'next/link';

const foundations = [
  'AAFCO nutrient profiles for growth, maintenance, and senior diets (dogs/cats)',
  'NRC (National Research Council) data for exotic species',
  'Veterinary guidance for balancing protein, fats, essential amino acids, minerals, vitamins, and calories',
  'Evidence-backed functional ingredients (joint care, skin, digestion, urinary health, metabolic support)',
];

const adjustments = [
  'Species-specific needs',
  'Breed tendencies',
  'Age and activity level',
  'Weight goals',
  'Medical considerations (allergies, joint support, etc.)',
];

export default function NutritionGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-orange-600 font-semibold hover:underline">
            ← Back to home
          </Link>
        </div>
        <header>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Nutrition Guide</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Paw & Plate uses peer-reviewed science, veterinary standards, and functional ingredients to
            keep every fresh meal nutritionally complete.
          </p>
        </header>

        <section className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our foundation</h2>
          <p className="text-gray-600 mb-4">
            We build meal templates using the following evidence-based references:
          </p>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            {foundations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key philosophy</h2>
          <p className="text-gray-600 mb-4">
            Nutrition isn’t one-size-fits-all. Every Paw & Plate meal starts balanced, then adapts to
            your pet’s unique context.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">We adjust for:</h3>
              <ul className="space-y-2 list-disc list-inside text-gray-700">
                {adjustments.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Non-negotiables</h3>
              <p className="text-gray-600">
                Every meal starts nutritionally complete. Functional modifications only add benefits —
                they never reduce baseline requirements.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


