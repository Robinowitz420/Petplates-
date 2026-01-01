import type { Metadata } from 'next';
import Link from 'next/link';

import MascotAvatar from '@/components/MascotAvatar';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: 'Can Bearded Dragons Eat Spinach? When to Avoid and Safer Greens | Pet Plates',
  description:
    'Can bearded dragons eat spinach? Learn why it’s often limited, what greens are safer staples, and how to rotate greens wisely.',
  alternates: {
    canonical: '/guides/reptiles/can-bearded-dragons-eat-spinach',
  },
  openGraph: {
    title: 'Can Bearded Dragons Eat Spinach? When to Avoid and Safer Greens | Pet Plates',
    description:
      'Can bearded dragons eat spinach? Learn why it’s often limited, what greens are safer staples, and how to rotate greens wisely.',
    url: absoluteUrl('/guides/reptiles/can-bearded-dragons-eat-spinach'),
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
    question: 'Is spinach bad for bearded dragons?',
    answer:
      'Spinach is often treated as a “limit” food rather than a staple. Use safer everyday greens as the base and rotate limited foods intentionally.',
  },
  {
    question: 'How often can bearded dragons eat spinach?',
    answer:
      'Frequency depends on the overall diet and what spinach replaces. If you use spinach, keep it occasional and prioritize safer staples most of the time.',
  },
  {
    question: 'What are the best greens for bearded dragons?',
    answer:
      'The best greens are the ones that work as repeatable staples and fit your dragon’s routine. Choose a few safe bases, then rotate variety carefully.',
  },
  {
    question: 'Can baby bearded dragons eat spinach?',
    answer:
      'Baby dragons have different needs and less margin for error. Keep the plan conservative and confirm your routine with trusted reptile care resources.',
  },
  {
    question: 'What if my bearded dragon refuses greens?',
    answer:
      'Don’t panic-switch ingredients daily. Try a slow approach: rotate one variable at a time, keep presentation consistent, and consult a reptile vet if appetite concerns persist.',
  },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Reptiles', item: `${BASE_URL}/species/reptiles` },
    { '@type': 'ListItem', position: 3, name: 'Guides', item: `${BASE_URL}/guides/reptiles` },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Can bearded dragons eat spinach? (and safer greens to use instead)',
      item: `${BASE_URL}/guides/reptiles/can-bearded-dragons-eat-spinach`,
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
                <Link href="/species/reptiles" className="text-orange-300 hover:text-orange-200">
                  Reptiles
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li>
                <Link href="/guides/reptiles" className="text-orange-300 hover:text-orange-200">
                  Guides
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li className="text-white">Spinach</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Can bearded dragons eat spinach? (and safer greens to use instead)
          </h1>

          <p className="mt-4 text-gray-300">
            Quick answer: spinach is often treated as a “limit” food. Use safer staples most of the time and rotate greens intentionally,
            not randomly.
          </p>

          <div className="mt-6 bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <div className="flex items-start gap-4">
              <MascotAvatar mascot="sherlock-shells" showLabel label="Sherlock Shells" />
              <div className="text-gray-200">
                <div className="font-semibold text-orange-300">Mascot owner: Sherlock Shells</div>
                <div className="mt-2">
                  Quick answer: if you’re unsure, treat it as unsafe until confirmed. Risk isn’t only the ingredient—it’s dose, form,
                  and what else it’s paired with.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Quick answer: where spinach fits (and where it doesn’t)</h2>
            <p className="text-gray-200">
              Spinach is not a reliable everyday staple for many keepers. Treat it as occasional, and build the routine around safer
              greens.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Why some greens are “limit” foods</h2>
            <p className="text-gray-200">
              Some greens can create nutritional tradeoffs depending on what they replace and how often they’re used. When in doubt,
              choose the safer staple.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Safer everyday greens to prioritize</h2>
            <p className="text-gray-200">
              Pick a small set of repeatable staples first, then rotate additional greens carefully. Consistency is part of safety.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">How to introduce a new green safely</h2>
            <p className="text-gray-200">
              Start small. Watch appetite and stool. If anything goes weird, pause the experiment and return to the last known-safe
              routine.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">What to do if your dragon won’t eat greens</h2>
            <p className="text-gray-200">
              Don’t change five variables in the same week. Keep routine stable, change one thing, and consult a reptile veterinarian if
              appetite is a concern.
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
            <h2 className="text-xl font-bold text-orange-400 mb-4">Next steps</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/guides/reptiles/reptile-calcium-basics"
                  className="text-orange-300 hover:text-orange-200 font-medium"
                >
                  Reptile calcium basics →
                </Link>
              </li>
              <li>
                <Link href="/guides/reptiles" className="text-orange-300 hover:text-orange-200 font-medium">
                  Browse reptile guides →
                </Link>
              </li>
              <li>
                <Link href="/species/reptiles" className="text-orange-300 hover:text-orange-200 font-medium">
                  Reptiles hub →
                </Link>
              </li>
              <li>
                <Link href="/nutrition-guide" className="text-orange-300 hover:text-orange-200 font-medium">
                  Nutrition guide →
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-orange-300 hover:text-orange-200 font-medium">
                  FAQ →
                </Link>
              </li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Sources</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Reptile veterinary resources</li>
              <li>Species-specific care resources</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
