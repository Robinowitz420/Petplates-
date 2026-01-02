'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

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
        <p className="text-gray-400 text-sm">
          🎯 View meals instantly • No signup required • Start shopping now
        </p>
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
