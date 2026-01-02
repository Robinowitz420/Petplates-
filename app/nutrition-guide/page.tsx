import { Metadata } from 'next';
import { absoluteUrl } from '@/lib/siteUrl';
import NutritionGuideClientPage from './client';

export const metadata: Metadata = {
  title: 'Nutrition Guide - Paws & Plates',
  description: 'Learn about the science-backed nutritional foundations and philosophy behind Paws & Plates meal plans.',
  alternates: {
    canonical: '/nutrition-guide',
  },
  openGraph: {
    title: 'Nutrition Guide - Paws & Plates',
    description: 'Our guide to pet nutrition, following AAFCO, NRC, and veterinarian standards.',
    url: absoluteUrl('/nutrition-guide'),
  },
};

export default function NutritionGuidePage() {
  return <NutritionGuideClientPage />;
}


