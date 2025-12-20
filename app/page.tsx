'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Calendar, ShoppingCart, ArrowRight, Sparkles } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/nextjs'; 
import { PetCategory } from '@/lib/types';
import QuickPreviewModal from '@/components/QuickPreviewModal';
import SocialProof, { TestimonialSection } from '@/components/SocialProof';
import EmailCaptureModal, { useExitIntent } from '@/components/EmailCaptureModal';
import ABTestDashboard from '@/components/ABTestDashboard';
import TrustBadges from '@/components/TrustBadges';

const getPetData = (userId: string) => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`pets_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

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
  const { user, isLoaded } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<PetCategory>('dogs');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  
  // Exit intent - show email capture when user tries to leave
  useExitIntent(() => {
    if (!user && !showEmailCapture) {
      setShowEmailCapture(true);
    }
  });
  
  // Get userId for purchase tracking
  const userId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('last_user_id') || '' : '');
  
  if (isLoaded && user?.id) {
    const pets = getPetData(user.id);
    const hasPets = pets.length > 0;
    
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="relative w-full border-b border-surface-highlight py-8" style={{ backgroundColor: '#043136' }}>
          <div className="max-w-4xl mx-auto relative w-full aspect-[16/9] h-[500px] md:h-[600px]">
            <Image
              src="/images/emojis/Mascots/HeroPics/LOGO.png"
              alt="Paws & Plates - Meal prep for All your pets"
              fill
              className="object-contain"
              priority
            />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Welcome Back, {user.firstName || 'Pet Owner'}!
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8">
              Fresh, vet-approved, and personalized nutrition for your beloved pets.
            </p>
          </section>
          
          <section className="py-12">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Why Paws & Plates?</h2>
            <WhyUsSection />
          </section>
        </main>

        <footer className="py-6 text-center text-sm text-gray-500 border-t border-surface-highlight">
          <SignOutButton>
            <button className="text-orange-400 hover:text-orange-300 font-medium">
              Log Out
            </button>
          </SignOutButton>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative w-full border-b border-surface-highlight py-8" style={{ backgroundColor: '#043136' }}>
        <div className="max-w-4xl mx-auto relative w-full aspect-[16/9] h-[250px] md:h-[300px]">
          <Image
            src="/images/emojis/Mascots/HeroPics/HeroBanner-v3.png"
            alt="Paws & Plates - Meal prep made easy, for ALL your pets!"
            fill
            className="object-contain"
            priority
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* PRIMARY CTA - See Examples (Drives Affiliate Clicks!) */}
            <button
              onClick={() => setShowPreviewModal(true)}
              className="btn btn-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-3 border-orange-400 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2"
            >
              <Sparkles size={24} />
              See Example Meals
              <ArrowRight size={20} />
            </button>
            
            {/* Secondary CTA */}
            <Link
              href="/sign-up"
              className="btn btn-lg btn-success"
            >
              Create Free Account
            </Link>
          </div>
          
          {/* Value Prop Subheading */}
          <p className="text-gray-400 text-sm mt-4">
            🎯 View meals instantly • No signup required • Start shopping now
          </p>
        </section>

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

      {/* Quick Preview Modal */}
      <QuickPreviewModal 
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
      />

      {/* Email Capture Modal (Exit Intent) */}
      <EmailCaptureModal
        isOpen={showEmailCapture}
        onClose={() => setShowEmailCapture(false)}
        petType="your pet"
        mealCount={5}
        trigger="exit-intent"
      />

      {/* A/B Test Dashboard (Admin) */}
      <ABTestDashboard />
    </div>
  );
}