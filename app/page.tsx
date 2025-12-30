import Image from 'next/image';
import { Check, Calendar, ShoppingCart } from 'lucide-react';
import HomePageClient from '@/components/HomePageClient';
import SocialProof, { TestimonialSection } from '@/components/SocialProof';
import TrustBadges from '@/components/TrustBadges';

export const dynamic = 'force-static';

export const revalidate = 3600;

const whyCards = [
  {
    id: 'standards',
    title: 'AAFCO Approved',
    subtitle: 'All meals meet or exceed AAFCO + WSAVA nutritional standards',
    hover:
      '**AAFCO** (Association of American Feed Control Officials) and **WSAVA** (World Small Animal Veterinary Association) set the gold standard for pet nutrition. We build every meal to those benchmarks with guidance from pet health specialists so your pet stays balanced.',
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
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
    {whyCards.map((card) => {
      const Icon = card.icon;
      return (
        <div
          key={card.id}
          className="relative group text-center bg-surface rounded-xl shadow-lg border border-surface-highlight p-8 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Icon size={32} className="text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{card.title}</h3>
          <p className="text-gray-400">{card.subtitle}</p>
          <div className="absolute inset-0 bg-surface/95 px-4 py-6 text-sm text-gray-200 flex items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 backdrop-blur-sm">
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
      <header
        className="relative w-full border-b border-surface-highlight py-8 bg-[#043136]"
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 text-center">
          <div className="relative w-full max-w-3xl">
            <Image
              src="/images/emojis/Mascots/HeroPics/newLogo.png"
              alt="Paws & Plates - Meal prep made easy, for ALL your pets!"
              width={720}
              height={405}
              className="w-full h-auto object-contain"
              sizes="(max-width: 768px) 90vw, 720px"
              priority
              fetchPriority="high"
            />
          </div>
          <div className="space-y-3 px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Fresh, vet-approved meal prep for every pet in your home.
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Custom, species-specific nutrition plans that keep dogs, cats, birds,
              reptiles, and pocket pets thriving—without the overwhelm.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <HomePageClient />

        {/* Trust Badges */}
        <section className="py-8">
          <TrustBadges />
        </section>

        {/* Social Proof Section */}
        <section className="py-12">
          <SocialProof />
        </section>

        <section className="py-12 border-t border-surface-highlight">
          <WhyUsSection />
        </section>

        {/* Testimonials Section */}
        <section className="py-12 border-t border-surface-highlight">
          <TestimonialSection />
        </section>
      </main>
    </div>
  );
}