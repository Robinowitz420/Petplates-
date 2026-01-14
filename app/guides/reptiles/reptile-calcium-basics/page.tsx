import type { Metadata } from 'next';
import Link from 'next/link';

import MascotAvatar from '@/components/MascotAvatar';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: 'Reptile Calcium Basics: Why It Matters, Ca:P, and Common Mistakes | Pet Plates',
  description:
    'Reptile calcium basics explained simply: Ca:P, common mistakes, and how to build a safer, repeatable feeding routine.',
  alternates: {
    canonical: '/guides/reptiles/reptile-calcium-basics',
  },
  openGraph: {
    title: 'Reptile Calcium Basics: Why It Matters, Ca:P, and Common Mistakes | Pet Plates',
    description:
      'Reptile calcium basics explained simply: Ca:P, common mistakes, and how to build a safer, repeatable feeding routine.',
    url: absoluteUrl('/guides/reptiles/reptile-calcium-basics'),
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
    question: 'Do all reptiles need calcium supplements?',
    answer:
      'Needs vary by species, life stage, and setup. Use trusted species care resources and a qualified reptile care professional to confirm whether supplements are necessary.',
  },
  {
    question: 'What is a good calcium-to-phosphorus ratio?',
    answer:
      'Ca:P guidance is species-dependent. The safest approach is to use reputable reptile care guidance for your exact species and avoid extremes.',
  },
  {
    question: 'Can you give reptiles too much calcium?',
    answer:
      'Yes—over-supplementation can be a problem. Handle supplements carefully and follow trusted guidance rather than guesswork.',
  },
  {
    question: 'Why do reptiles stop eating greens?',
    answer:
      'There are many possible causes, including routine and husbandry issues. If appetite changes suddenly or persists, seek professional guidance.',
  },
  {
    question: 'When should I seek professional help about diet?',
    answer:
      'If you see appetite loss, weight loss, abnormal stools, lethargy, or repeated refusal of staples, seek professional guidance promptly.',
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
      name: 'Reptile calcium basics: why it matters and common feeding mistakes',
      item: `${BASE_URL}/guides/reptiles/reptile-calcium-basics`,
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
              <li className="text-white">Calcium basics</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Reptile calcium basics: why it matters and common feeding mistakes
          </h1>

          <p className="mt-4 text-gray-300">
            Quick answer: calcium planning is about consistency and avoiding extremes. Follow trusted species guidance, build a routine
            you can repeat, and seek professional guidance when unsure.
          </p>

          <div className="mt-6 bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <div className="flex items-start gap-4">
              <MascotAvatar mascot="professor-purrfessor" showLabel label="Professor Purfessor" />
              <div className="text-gray-200">
                <div className="font-semibold text-orange-300">Mascot owner: Professor Purfessor</div>
                <div className="mt-2">
                  For exotic pets, the internet is… enthusiast-heavy. We’ll stay conservative: aim for safe staples, introduce changes
                  slowly, and verify uncertain foods with a trusted species source.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Quick answer: the calcium fundamentals</h2>
            <p className="text-gray-200">The fundamentals are simple: consistent routine, correct setup, and conservative supplementation.</p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">The Ca:P idea (plain-language explanation)</h2>
            <p className="text-gray-200">
              Ca:P is a simplified way to think about calcium balance. The key takeaway is not a magic number—it’s avoiding chronic
              imbalance and using reputable species guidance.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Common mistakes that derail calcium balance</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Over-relying on one food type.</li>
              <li>Inconsistent supplementation.</li>
              <li>Ignoring husbandry and assuming the issue is only “ingredients.”</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Supplements: safe mindset and handling</h2>
            <p className="text-gray-200">
              Treat supplements like a precision tool, not a vibe. Follow trusted guidance, handle powders carefully, and avoid
              improvising.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">How to build a repeatable feeding routine</h2>
            <p className="text-gray-200">Pick staples first, then add planned variety one variable at a time.</p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">When to seek professional help</h2>
            <p className="text-gray-200">If symptoms persist, appetite changes, or you’re unsure—seek professional guidance.</p>
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
                  href="/guides/reptiles/can-bearded-dragons-eat-spinach"
                  className="text-orange-300 hover:text-orange-200 font-medium"
                >
                  Can bearded dragons eat spinach? →
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
              <li>Reputable reptile care resources</li>
              <li>Species-specific care resources</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
