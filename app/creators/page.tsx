import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/siteUrl';
import CreatorsClient from './CreatorsClient';

export const metadata: Metadata = {
  title: 'Creators We Love - Paws & Plates',
  description:
    'Pet nutrition & care creators we recommend following — plus why we think their content is useful.',
  alternates: {
    canonical: '/creators',
  },
  openGraph: {
    title: 'Creators We Love - Paws & Plates',
    description:
      'Pet nutrition & care creators we recommend following — plus why we think their content is useful.',
    url: absoluteUrl('/creators'),
  },
};

export default function CreatorsPage() {
  return <CreatorsClient />;
}
