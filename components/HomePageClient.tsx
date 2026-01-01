'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';

const QuickPreviewModal = dynamic(() => import('@/components/QuickPreviewModal'), {
  ssr: false,
});

const ABTestDashboard = dynamic(() => import('@/components/ABTestDashboard'), {
  ssr: false,
});

export default function HomePageClient() {
  const searchParams = useSearchParams();

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [mountABDashboard, setMountABDashboard] = useState(false);

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
    if (!searchParams) return;
    if (searchParams.get('demo') !== '1') return;
    setShowPreviewModal(true);
  }, [searchParams]);

  return (
    <>
      <section className="text-center mb-12">
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
      </section>

      <QuickPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
      />

      {/* A/B Test Dashboard (Admin) */}
      {mountABDashboard && <ABTestDashboard />}
    </>
  );
}
