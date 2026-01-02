'use client';

import Link from 'next/link';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Paws & Plates',
  url: getSiteUrl(),
  logo: absoluteUrl('/images/emojis/Mascots/HeroPics/newLogo.png'),
};

const sections = [
  {
    title: 'What we collect',
    body: [
      'Account details (email, login provider)',
      'Pet info (name, weight, age, health concerns)',
      'Interaction data that helps improve meal recommendations',
      'We never collect precise addresses or financial data directly.',
    ],
  },
  {
    title: 'How we use data',
    body: [
      'To personalize meal plans',
      'To recommend ingredients and supplements',
      'To improve product features',
      'To show affiliate product links',
    ],
  },
  {
    title: 'Data sharing',
    body: [
      'We do not sell personal information.',
      'We may share anonymous, aggregated insights to improve pet nutrition research and product selection.',
    ],
  },
  {
    title: 'Your control',
    body: [
      'You may update or delete your data at any time.',
      'You can request permanent removal of your account and stored information.',
    ],
  },
  {
    title: 'Security & compliance',
    body: [
      'Industry-standard encryption and limited internal access protect user data.',
      'We follow CCPA and GDPR principles. Full legal language will be added before launch.',
    ],
  },
];

export default function PrivacyClientPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <Link href="/" className="text-orange-600 font-semibold hover:underline">
            ← Back to home
          </Link>
        </div>
        <header>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Plain-language, transparent, and built for trust.
          </p>
        </header>
        {sections.map((section) => (
          <section key={section.title} className="bg-surface rounded-2xl shadow p-6 border border-surface-highlight">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{section.title}</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-700">
              {section.body.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
