import { Suspense } from 'react';
import { Metadata } from 'next';
import { absoluteUrl } from '@/lib/siteUrl';
import ForumClientPage from './client';

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const category = searchParams?.category;

  if (category) {
    return {
      title: 'Pet Nutrition Community - Paws & Plates',
      description: 'Connect with fellow pet parents, share recipes, get advice from experts, and learn from real experiences in our supportive community.',
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: '/forum',
      },
      openGraph: {
        title: 'Pet Nutrition Community - Paws & Plates',
        description: 'Join the conversation about pet nutrition, recipes, and health.',
        url: absoluteUrl('/forum'),
      },
    };
  }

  return {
    title: 'Pet Nutrition Community - Paws & Plates',
    description: 'Connect with fellow pet parents, share recipes, get advice from experts, and learn from real experiences in our supportive community.',
    alternates: {
      canonical: '/forum',
    },
    openGraph: {
      title: 'Pet Nutrition Community - Paws & Plates',
      description: 'Join the conversation about pet nutrition, recipes, and health.',
      url: absoluteUrl('/forum'),
    },
  };
}

export default function ForumPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForumClientPage />
    </Suspense>
  );
}