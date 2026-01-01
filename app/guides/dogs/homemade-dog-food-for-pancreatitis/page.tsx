import type { Metadata } from 'next';
import Link from 'next/link';

import MascotAvatar from '@/components/MascotAvatar';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: 'Homemade Dog Food for Pancreatitis: Low‑Fat Planning Rules | Pet Plates',
  description:
    'A practical guide to pancreatitis-friendly homemade dog food: low-fat priorities, common mistakes, and safer planning rules.',
  alternates: {
    canonical: '/guides/dogs/homemade-dog-food-for-pancreatitis',
  },
  openGraph: {
    title: 'Homemade Dog Food for Pancreatitis: Low‑Fat Planning Rules | Pet Plates',
    description:
      'A practical guide to pancreatitis-friendly homemade dog food: low-fat priorities, common mistakes, and safer planning rules.',
    url: absoluteUrl('/guides/dogs/homemade-dog-food-for-pancreatitis'),
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
    question: 'Should dogs with pancreatitis eat a low-fat diet?',
    answer:
      'Often, reducing dietary fat is a common veterinary recommendation for pancreatitis management. Your veterinarian should set targets for your dog’s specific situation.',
  },
  {
    question: 'What ingredients are commonly avoided for pancreatitis?',
    answer:
      'High-fat ingredients and rich add-ins are commonly avoided. Keep the plan simple and confirm ingredient choices with your veterinarian.',
  },
  {
    question: 'Can I feed homemade food during a pancreatitis flare-up?',
    answer:
      'During a flare-up, follow your veterinarian’s instructions. Do not switch diets impulsively without medical guidance.',
  },
  {
    question: 'Are treats okay for dogs with pancreatitis?',
    answer:
      'Treats can derail a low-fat plan quickly. If you use treats, keep them planned, consistent, and aligned with your vet’s recommendations.',
  },
  {
    question: 'When should I ask my vet about a prescription diet?',
    answer:
      'If your dog has recurring flare-ups, weight loss, severe symptoms, or complex medical history, a prescription diet may be recommended by your veterinarian.',
  },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Dogs', item: `${BASE_URL}/species/dogs` },
    { '@type': 'ListItem', position: 3, name: 'Guides', item: `${BASE_URL}/guides/dogs` },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Homemade dog food for pancreatitis: low‑fat planning rules (without guesswork)',
      item: `${BASE_URL}/guides/dogs/homemade-dog-food-for-pancreatitis`,
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
                <Link href="/species/dogs" className="text-orange-300 hover:text-orange-200">
                  Dogs
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li>
                <Link href="/guides/dogs" className="text-orange-300 hover:text-orange-200">
                  Guides
                </Link>
              </li>
              <li className="text-gray-400">→</li>
              <li className="text-white">Pancreatitis</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Homemade dog food for pancreatitis: low‑fat planning rules (without guesswork)
          </h1>

          <p className="mt-4 text-gray-300">
            Quick answer: pancreatitis changes the priorities. Keep the plan simple, keep fat conservative, and coordinate with your
            veterinarian—especially during a flare-up.
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
                  Nutrition can feel like a hundred rules at once. Let’s simplify it into priorities: what matters most, what matters
                  next, and what’s optional noise.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Quick answer: the safest planning mindset</h2>
            <p className="text-gray-200">
              The safest mindset is risk reduction. Avoid dramatic ingredient swings, avoid rich add-ins, and treat your vet’s plan as
              the primary reference.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Pancreatitis-friendly priorities (what to aim for)</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Keep fat conservative and consistent (large spikes are the enemy).</li>
              <li>Prioritize a repeatable routine you can actually follow.</li>
              <li>Use simple ingredient lists so you can observe responses.</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Common mistakes that make flare-ups more likely</h2>
            <ul className="space-y-2 text-gray-200">
              <li>“Just one treat” turning into a fat-heavy day.</li>
              <li>Switching multiple ingredients at once (no way to identify triggers).</li>
              <li>Using heavily seasoned foods or rich leftovers.</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Reading labels and choosing ingredients (simple heuristics)</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Prefer simpler, unseasoned ingredients.</li>
              <li>Be cautious with oils, butter, skin-on meats, and fatty cuts.</li>
              <li>If you’re unsure, verify with your veterinarian before changing the plan.</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">When to pause and consult your vet (red flags)</h2>
            <p className="text-gray-200">
              If your dog is vomiting, not eating, seems painful, lethargic, or symptoms worsen—pause diet experiments and contact your
              veterinarian.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">
              How Pet Plates helps you plan meals (without replacing veterinary care)
            </h2>
            <p className="text-gray-200">
              Pet Plates is an educational planning tool. It can help you keep ingredients and routines organized, but it does not
              diagnose or treat disease.
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
                  Nutrition guide (standards context) →
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-orange-300 hover:text-orange-200 font-medium">
                  FAQ (what Pet Plates is and isn’t) →
                </Link>
              </li>
              <li>
                <Link href="/guides/dogs/can-dogs-eat-garlic" className="text-orange-300 hover:text-orange-200 font-medium">
                  Can dogs eat garlic? (safety example) →
                </Link>
              </li>
              <li>
                <Link href="/guides/dogs" className="text-orange-300 hover:text-orange-200 font-medium">
                  Browse dog guides →
                </Link>
              </li>
              <li>
                <Link href="/species/dogs" className="text-orange-300 hover:text-orange-200 font-medium">
                  Dogs hub →
                </Link>
              </li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Sources</h2>
            <ul className="space-y-2 text-gray-200">
              <li>VCA Animal Hospitals (pancreatitis overviews)</li>
              <li>University veterinary hospital resources</li>
              <li>Your veterinarian’s individualized plan</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
