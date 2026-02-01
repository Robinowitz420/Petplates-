import { Check, Calendar, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import HomePageClient from '@/components/HomePageClient';
import SocialProof, { TestimonialSection } from '@/components/SocialProof';
import TrustBadges from '@/components/TrustBadges';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: {
      canonical: '/',
    },
  };
}

export const dynamic = 'force-static';

export const revalidate = 3600;

const siteUrl = getSiteUrl();

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Paws & Plates',
  url: siteUrl,
  logo: absoluteUrl('/images/emojis/Mascots/HeroPics/newLogo.png'),
};

const whyCards = [
  {
    id: 'standards',
    title: 'AAFCO Approved',
    subtitle: 'All meals use AAFCO-aligned nutrition guardrails',
    hover:
      '**AAFCO** (Association of American Feed Control Officials) is a widely used reference framework for dog and cat nutrition. We use standards as planning guardrails to help you build balanced routines.',
    icon: Check,
  },
  {
    id: 'ordering',
    title: 'Easy Ordering',
    subtitle: 'Get every ingredient delivered or buy them with one click on Amazon',
    hover:
      'Source ingredients from **Major Pet Retailers** like **Amazon**, Chewy, Petco, Walmart, Ollie, The Farmer\'s Dog, Butternut Box, HolistaPet, plus affiliate networks like Skimlinks, Rakuten, CJ, and ShareASale.',
    icon: ShoppingCart,
  },
  {
    id: 'plans',
    title: 'Why Meal Prep?',
    subtitle: 'Fresh prep beats whatever comes in a bag—every single time.',
    hover:
      'Meal prepping keeps pets healthier with fresh ingredients tailored to their needs. Paws & Plates knows species, age, size, and health concerns, then auto-adjusts portions and links trusted products you can buy today.',
    icon: Calendar,
  },
];

const WhyUsSection = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto px-2">
    {whyCards.map((card) => {
      const Icon = card.icon;
      return (
        <div
          key={card.id}
          className="relative group text-center bg-surface rounded-xl shadow-lg border border-surface-highlight p-6 sm:p-8 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-surface-highlight rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-white/10">
            <Icon size={28} className="text-orange-400 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{card.title}</h3>
          <p className="text-sm sm:text-base text-gray-400">{card.subtitle}</p>
          <div className="absolute inset-0 bg-surface/95 px-3 sm:px-4 py-4 sm:py-6 text-xs sm:text-sm text-gray-200 flex items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 backdrop-blur-sm">
            <p className="leading-relaxed"><strong>{card.hover}</strong></p>
          </div>
        </div>
      );
    })}
  </div>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <header
        className="relative w-full border-b border-surface-highlight py-6 sm:py-8 bg-[#043136]"
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 sm:gap-6 text-center px-4">
          <div className="relative w-full max-w-[280px] sm:max-w-md md:max-w-3xl">
            <Image
              src="/images/emojis/Mascots/HeroPics/newLogo.png"
              alt="Paws & Plates - Meal prep made easy, for ALL your pets!"
              width={720}
              height={405}
              className="w-full h-auto object-contain"
              priority
              sizes="(max-width: 640px) 280px, (max-width: 768px) 448px, 768px"
            />
          </div>
          <div className="space-y-2 sm:space-y-3 px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Fresh meal prep for every pet in your home.
            </h1>
            <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Custom, species-specific nutrition plans that keep dogs, cats, birds,
              reptiles, and pocket pets thriving—without the overwhelm.
            </p>
            <p className="text-sm sm:text-base text-orange-200 font-semibold tracking-wide">
              Get custom meal plans → Shop ingredients in one click.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        <HomePageClient />

        {/* Trust Badges */}
        <section className="py-6 sm:py-8">
          <TrustBadges />
        </section>

        {/* Social Proof Section */}
        <section className="py-8 sm:py-12">
          <SocialProof />
        </section>

        <section className="py-8 sm:py-12 border-t border-surface-highlight">
          <h2 className="sr-only">Why Paws & Plates</h2>
          <WhyUsSection />
        </section>

        {/* Testimonials Section */}
        <section className="py-8 sm:py-12 border-t border-surface-highlight">
          <TestimonialSection />
        </section>
      </main>
    </div>
  );
}