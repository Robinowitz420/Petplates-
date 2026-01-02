import { Metadata } from 'next';
import { absoluteUrl } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Contact Us - Paws & Plates',
  description: 'Have a question about meal planning, partnerships, or support? We’re here to help. Contact the Paws & Plates team.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us - Paws & Plates',
    description: 'Get in touch with the Paws & Plates team for support, partnerships, or any questions about our meal planning services.',
    url: absoluteUrl('/contact'),
  },
};

import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-orange-600 font-semibold hover:underline">
            ← Back to home
          </Link>
        </div>
        <header>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Contact Us</h1>
          <p className="text-lg text-gray-600">
            Have a question about meal planning, partnerships, or support? We’re here to help.
          </p>
        </header>
        <section className="bg-white rounded-2xl shadow p-6 border border-gray-100 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Email</h2>
            <p className="text-gray-600">
              <a href="mailto:hello@petplates.co" className="text-orange-600 font-semibold hover:underline">
                hello@petplates.co
              </a>
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Response time</h2>
            <p className="text-gray-600">We typically respond within one business day.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Need immediate help?</h2>
            <p className="text-gray-600">
              Check our <Link href="/faq" className="text-orange-600 font-semibold hover:underline">FAQ</Link> or{' '}
              <Link href="/nutrition-guide" className="text-orange-600 font-semibold hover:underline">Nutrition Guide</Link>{' '}
              for quick answers.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}


