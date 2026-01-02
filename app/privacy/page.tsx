import { Metadata } from 'next';
import { absoluteUrl } from '@/lib/siteUrl';
import PrivacyClientPage from './client';

export const metadata: Metadata = {
  title: 'Privacy Policy - Paws & Plates',
  description: 'Our privacy policy explains what data we collect, how we use it, and how we protect your information.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy - Paws & Plates',
    description: 'Plain-language, transparent, and built for trust.',
    url: absoluteUrl('/privacy'),
  },
};

export default function PrivacyPage() {
  return <PrivacyClientPage />;
}


