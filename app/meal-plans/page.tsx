import { Metadata } from 'next';
import { absoluteUrl } from '@/lib/siteUrl';
import MealPlansClientPage from './client';

export const metadata: Metadata = {
  title: 'Meal Plans - Paws & Plates',
  description: 'Choose the perfect meal plan for your pet. We offer one-time meals and weekly plans for dogs, cats, birds, reptiles, and pocket pets.',
  alternates: {
    canonical: '/meal-plans',
  },
  openGraph: {
    title: 'Meal Plans - Paws & Plates',
    description: 'Choose the perfect meal plan for your pet, from one-time meals to weekly subscriptions.',
    url: absoluteUrl('/meal-plans'),
  },
};

export default function MealPlansPage() {
  return <MealPlansClientPage />;
}
