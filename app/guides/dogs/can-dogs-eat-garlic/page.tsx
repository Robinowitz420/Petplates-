import type { Metadata } from 'next';
import Link from 'next/link';

import MascotAvatar from '@/components/MascotAvatar';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: 'Can Dogs Eat Garlic? Toxicity, Symptoms, and What To Do | Pet Plates',
  description:
    'Is garlic toxic to dogs? Learn why it’s risky, symptoms to watch for, and what to do if your dog ate garlic.',
  alternates: {
    canonical: '/guides/dogs/can-dogs-eat-garlic',
  },
  openGraph: {
    title: 'Can Dogs Eat Garlic? Toxicity, Symptoms, and What To Do | Pet Plates',
    description:
      'Is garlic toxic to dogs? Learn why it’s risky, symptoms to watch for, and what to do if your dog ate garlic.',
    url: absoluteUrl('/guides/dogs/can-dogs-eat-garlic'),
  },
};

const faqItems = [
  {
    question: 'Is garlic toxic to dogs?',
    answer:
      'Garlic is widely considered risky for dogs. If ingestion happened, treat it seriously and contact your veterinarian for guidance—especially if symptoms appear.',
  },
  {
    question: 'How much garlic is dangerous for dogs?',
    answer:
      'Risk depends on the amount, the form (powder vs fresh), and your dog’s size. If you’re not sure how much was eaten, call your vet and share the product label if available.',
  },
  {
    question: 'What are signs of garlic poisoning in dogs?',
    answer:
      'Possible signs can include stomach upset, weakness, or changes in behavior. If you see symptoms, seek veterinary guidance promptly.',
  },
  {
    question: 'What should I do if my dog ate garlic bread?',
    answer:
      'Don’t wait for internet certainty. Contact your veterinarian or an emergency clinic and provide details on the amount, ingredients (garlic powder, butter), and timing.',
  },
  {
    question: 'Are garlic supplements safe for dogs?',
    answer:
      'Avoid self-prescribing supplements. If a supplement is being considered for a specific reason, discuss it with your veterinarian first.',
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
      name: 'Can dogs eat garlic? (and what to do if they already did)',
      item: `${BASE_URL}/guides/dogs/can-dogs-eat-garlic`,
    },
  ],
};

const faqPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function Page() {
  return (
    <div className="min-h-screen bg-transparent text-foreground py-10">
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
              <li className="text-white">Can dogs eat garlic?</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Can dogs eat garlic? (and what to do if they already did)
          </h1>

          <p className="mt-4 text-gray-300">
            Quick answer: treat garlic as risky for dogs. Risk depends on dose and form, so the safest move is to confirm with a
            veterinarian—especially if your dog is small or showing symptoms.
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
            <h2 className="text-xl font-bold text-orange-400 mb-4">Quick answer: is garlic safe for dogs?</h2>
            <p className="text-gray-200">
              No. Garlic is commonly considered unsafe for dogs. If ingestion occurred, don’t minimize it—verify next steps with your
              veterinarian.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Why garlic is risky (what makes it a concern)</h2>
            <ul className="space-y-2 text-gray-200">
              <li>Different forms can concentrate risk (powdered seasonings can be more concentrated than fresh).</li>
              <li>Smaller dogs have less margin for error.</li>
              <li>Garlic often shows up alongside other risky ingredients (butter, salt, onion-family foods).</li>
            </ul>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">What symptoms to watch for</h2>
            <p className="text-gray-200">
              Watch for stomach upset and any unusual behavior or weakness. If symptoms appear, treat it as a time-sensitive problem.
            </p>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">What to do if your dog ate garlic</h2>
            <div className="text-gray-200 space-y-3">
              <p>
                If you suspect toxicity or a severe reaction, contact a veterinarian or emergency clinic immediately. Online lists are
                not faster than professional care.
              </p>
              <div className="rounded-xl border border-green-800/40 p-4 bg-surface-lighter text-sm text-gray-200">
                This page is educational and not veterinary advice. If your pet has symptoms or a condition, contact your veterinarian.
              </div>
              <ul className="space-y-2">
                <li>Save the label (garlic powder vs fresh garlic matters).</li>
                <li>Estimate the amount and timing as best you can.</li>
                <li>Don’t attempt “home fixes” without veterinary guidance.</li>
              </ul>
            </div>
          </section>

          <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
            <h2 className="text-xl font-bold text-orange-400 mb-4">Safer flavor alternatives for dog meals</h2>
            <p className="text-gray-200">If you want food your dog actually wants to eat, pick low-risk options and keep it simple.</p>
            <ul className="mt-3 space-y-2 text-gray-200">
              <li>Use plain, unseasoned ingredients.</li>
              <li>Use pet-safe aromatics only when confirmed safe for dogs.</li>
              <li>Keep a consistent base routine and rotate intentionally.</li>
            </ul>
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
                <Link href="/guides/dogs/homemade-dog-food-for-pancreatitis" className="text-orange-300 hover:text-orange-200 font-medium">
                  Homemade dog food for pancreatitis →
                </Link>
              </li>
              <li>
                <Link href="/guides/dogs" className="text-orange-300 hover:text-orange-200 font-medium">
                  Browse all dog guides →
                </Link>
              </li>
              <li>
                <Link href="/species/dogs" className="text-orange-300 hover:text-orange-200 font-medium">
                  Dogs hub →
                </Link>
              </li>
              <li>
                <Link href="/nutrition-guide" className="text-orange-300 hover:text-orange-200 font-medium">
                  Nutrition guide (standards & safety context) →
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
              <li>ASPCA Animal Poison Control</li>
              <li>Pet Poison Helpline</li>
              <li>VCA Animal Hospitals</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
