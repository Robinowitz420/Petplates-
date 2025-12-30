'use client';

import Link from 'next/link';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Paws & Plates',
  url: 'https://paws-and-plates.vercel.app',
  logo: 'https://paws-and-plates.vercel.app/images/emojis/Mascots/HeroPics/newLogo.png',
};

const faqItems = [
  {
    question: 'What is Paws & Plates?',
    answer:
      'A tool that helps you build fresh, personalized meals for your pets based on species, age, breed, size, and health needs — along with links to reputable ingredients and supplements.',
  },
  {
    question: 'Do you sell food directly?',
    answer:
      'No. We guide you to evidence-based nutrition and help you purchase ingredients from trusted retailers and brands.',
  },
  {
    question: 'Are the meals veterinarian-approved?',
    answer:
      'Our guidelines follow AAFCO (dogs/cats) and established exotic-pet nutrition research. Expert review is underway as we expand.',
  },
  {
    question: 'Can I use this instead of my vet?',
    answer:
      'No. Paws & Plates is an educational and planning tool. Always consult your veterinarian when making major dietary changes.',
  },
  {
    question: 'Does the app calculate how much to feed?',
    answer:
      'Yes — portions automatically scale to your pet’s weight, life stage, and body-condition goals.',
  },
  {
    question: 'What species do you support?',
    answer: 'Dogs, cats, birds, reptiles, and small mammals — with more to come.',
  },
  {
    question: 'How much does it cost?',
    answer: 'The core meal-planning features are free. Optional premium features will be announced.',
  },
];

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

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-orange-600 font-semibold hover:underline">
            ← Back to home
          </Link>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">FAQ</h1>
        <p className="text-lg text-gray-600 mb-12">
          Answers to the most common questions about how Paws & Plates works.
        </p>
        <div className="space-y-6">
          {faqItems.map((item) => (
            <div key={item.question} className="bg-white rounded-2xl shadow p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">{item.question}</h2>
              <p className="text-gray-600 mt-2 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


