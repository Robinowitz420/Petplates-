import type { Metadata } from 'next';
import Link from 'next/link';

import MascotAvatar from '@/components/MascotAvatar';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: 'Homemade Cat Food for Kidney Disease (CKD): Nutrition Priorities & Safer Planning | Pet Plates',
  description:
    'CKD-friendly homemade cat food planning: nutrition priorities, common pitfalls, and how to plan more safely with your veterinarian.',
  alternates: {
    canonical: '/guides/cats/homemade-cat-food-for-kidney-disease',
  },
  openGraph: {
    title: 'Homemade Cat Food for Kidney Disease (CKD): Nutrition Priorities & Safer Planning | Pet Plates',
    description:
      'CKD-friendly homemade cat food planning: nutrition priorities, common pitfalls, and how to plan more safely with your veterinarian.',
    url: absoluteUrl('/guides/cats/homemade-cat-food-for-kidney-disease'),
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Paws & Plates',
  url: BASE_URL,
  logo: `${BASE_URL}/images/emojis/Mascots/HeroPics/newLogo.png`,
};

const faqItems = [
  {
    question: 'Can cats with kidney disease eat homemade food?',
    answer:
      'In some cases, yes—but CKD is a medical condition. If you’re considering homemade meals, coordinate with your veterinarian (and ideally a veterinary nutritionist) before changing diet.',
  },
  {
    question: 'What nutrients matter most for CKD cats?',
    answer:
      'CKD planning often prioritizes controlling key nutritional factors and avoiding extremes. Your veterinarian should set the priority targets for your cat’s stage and lab results.',
  },
  {
    question: 'Should CKD cats be on a prescription diet?',
    answer:
      'Many cats benefit from prescription diets. Whether homemade is appropriate depends on your cat’s condition, appetite, and your veterinarian’s guidance.',
  },
  {
    question: 'What are signs a CKD diet change isn’t going well?',
    answer:
      'If appetite drops, vomiting increases, weight loss accelerates, or behavior changes, pause diet changes and check in with your veterinarian.',
  },
  {
    question: 'Can I rotate proteins for a CKD cat?',
    answer:
      'Rotation is possible, but it should be slow and deliberate so you can observe response and keep the overall plan consistent. Confirm protein choices with your veterinarian.',
  },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Cats', item: `${BASE_URL}/species/cats` },
    { '@type': 'ListItem', position: 3, name: 'Guides', item: `${BASE_URL}/guides/cats` },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Homemade cat food for kidney disease (CKD): nutrition priorities and safer planning',
      item: `${BASE_URL}/guides/cats/homemade-cat-food-for-kidney-disease`,
    },
  ],
};

const faqPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function Page() {
  return (
    <div className="min-h-screen bg-transparent text-foreground py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-300 mb-3">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="text-orange-300 hover:text-orange-200">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li>
                <Link href="/species/cats" className="text-orange-300 hover:text-orange-200">
                  Cats
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li>
                <Link href="/guides/cats" className="text-orange-300 hover:text-orange-200">
                  Guides
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li className="text-white">CKD</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Homemade cat food for kidney disease (CKD): nutrition priorities and safer planning
          </h1>

          <p className="mt-4 text-gray-300">
            Quick answer: CKD changes the priorities. The safest approach is to plan conservatively and coordinate with your
            veterinarian—especially if your cat is on a prescription diet.
          </p>

          <div className="mt-5 rounded-xl border border-green-800/40 p-4 bg-surface-lighter text-sm text-gray-200">
            This page is educational and not veterinary advice. If your pet has symptoms or a condition, contact your veterinarian.
          </div>

          <div className="mt-6 bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <div className="flex items-start gap-4">
              <MascotAvatar mascot="professor-purrfessor" showLabel label="Professor Purfessor" />
              <div className="text-gray-200">
                <div className="font-semibold text-orange-300">Mascot owner: Professor Purfessor</div>
                <div className="mt-2">
                  Great question—conditions change the priorities more than the ingredients. The goal is to reduce risk and keep the
                  plan consistent enough to evaluate.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Quick answer: what matters most for CKD planning</h2>
            <p className="text-gray-200">
              Start with your veterinarian’s priorities. CKD is not a DIY-only situation; planning should be conservative and monitored.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">The big nutrition priorities (plain-language)</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Consistency beats constant experimentation.</li>
              <li>Avoid extremes and sudden shifts.</li>
              <li>Confirm targets and supplements with your veterinarian.</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Common homemade-diet mistakes in CKD</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Chasing online “miracle” foods.</li>
              <li>Changing too many variables at once.</li>
              <li>Skipping professional guidance when the condition is active.</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">How to use a plan safely alongside veterinary care</h2>
            <p className="text-gray-200">
              Use a plan as a consistency tool: stable ingredients, stable portions, and clear notes for your veterinarian. Don’t use it
              as a replacement for medical care.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Monitoring and “when to re-check with your vet”</h2>
            <p className="text-gray-200">
              If appetite changes, vomiting increases, weight drops, or energy changes, pause dietary experiments and contact your
              veterinarian.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">How Pet Plates supports CKD-aware planning (educational)</h2>
            <p className="text-gray-200">
              Pet Plates helps you structure and document meals. It does not diagnose or treat disease and should be used with veterinary
              oversight.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">FAQs</h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="border border-green-800/40 rounded-xl p-4 bg-surface-lighter">
                  <div className="font-semibold text-orange-300">{item.question}</div>
                  <div className="mt-2 text-gray-200">{item.answer}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Related resources</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/nutrition-guide" className="text-orange-300 hover:text-orange-200 font-medium">
                  Nutrition guide →
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/cats/can-cats-eat-tuna-every-day"
                  className="text-orange-300 hover:text-orange-200 font-medium"
                >
                  Can cats eat tuna every day? →
                </Link>
              </li>
              <li>
                <Link href="/guides/cats" className="text-orange-300 hover:text-orange-200 font-medium">
                  Browse cat guides →
                </Link>
              </li>
              <li>
                <Link href="/species/cats" className="text-orange-300 hover:text-orange-200 font-medium">
                  Cats hub →
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-orange-300 hover:text-orange-200 font-medium">
                  FAQ (what Pet Plates is and isn’t) →
                </Link>
              </li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Sources</h2>
            <ul className="space-y-2 text-gray-200">
              <li>University veterinary hospital resources</li>
              <li>VCA Animal Hospitals (CKD overviews)</li>
              <li>Your veterinarian’s individualized plan</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
