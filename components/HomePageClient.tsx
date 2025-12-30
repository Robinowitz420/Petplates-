'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SignOutButton, useUser } from '@clerk/nextjs';

const QuickPreviewModal = dynamic(() => import('@/components/QuickPreviewModal'), {
  ssr: false,
});

const EmailCaptureModal = dynamic(() => import('@/components/EmailCaptureModal'), {
  ssr: false,
});

const ABTestDashboard = dynamic(() => import('@/components/ABTestDashboard'), {
  ssr: false,
});

export default function HomePageClient() {
  const { user, isLoaded } = useUser();

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [mountABDashboard, setMountABDashboard] = useState(false);

  const hasShownExitIntentRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const schedule = (cb: () => void) => {
      const w = window as any;

      if (typeof w.requestIdleCallback === 'function') {
        const id = w.requestIdleCallback(cb);
        return () => w.cancelIdleCallback?.(id);
      }

      const id = setTimeout(cb, 2000);
      return () => clearTimeout(id);
    };

    return schedule(() => setMountABDashboard(true));
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!isLoaded) return;

    if (user) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !hasShownExitIntentRef.current) {
        hasShownExitIntentRef.current = true;
        setShowEmailCapture(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [user, isLoaded]);

  return (
    <>
      <section className="text-center mb-12">
        {isLoaded && user ? (
          <>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Welcome Back, {user.firstName || 'Pet Owner'}!
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8">
              Fresh, vet-approved, and personalized nutrition for your beloved pets.
            </p>
            <SignOutButton>
              <button className="text-orange-400 hover:text-orange-300 font-medium">
                Log Out
              </button>
            </SignOutButton>
          </>
        ) : (
          <>
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
              <Link href="/sign-up" className="btn btn-lg btn-success">
                Create Free Account
              </Link>
            </div>

            {/* Value Prop Subheading */}
            <p className="text-gray-400 text-sm mt-4">
              🎯 View meals instantly • No signup required • Start shopping now
            </p>
          </>
        )}
      </section>

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
      {mountABDashboard && <ABTestDashboard />}
    </>
  );
}
