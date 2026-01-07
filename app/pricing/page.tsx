'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const PricingTable = dynamic(() => import('@clerk/nextjs').then((m) => m.PricingTable), {
  ssr: false,
});

const billingEnabled = process.env.NEXT_PUBLIC_CLERK_BILLING_ENABLED !== 'false';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-10">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-surface border border-surface-highlight rounded-2xl p-8">
          <h1 className="text-3xl font-extrabold mb-4">Paws & Plates Pro</h1>
          <p className="text-gray-300 mb-6">
            Pro removes usage limits and unlocks unlimited meal discovery for each pet.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/profile"
              className="inline-flex items-center justify-center rounded-lg border border-surface-highlight bg-surface-highlight/30 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-surface-highlight/40 transition-colors sr-only"
            >
              Back to My Pets
            </Link>

            <SignedOut>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-lg border border-orange-500/50 bg-orange-500/15 px-4 py-2 text-sm font-semibold text-orange-200 hover:bg-orange-500/20 transition-colors"
              >
                Sign in to upgrade
              </Link>
            </SignedOut>
          </div>

          <SignedIn>
            <div className="mt-8">
              {billingEnabled ? (
                <ErrorBoundary
                  fallback={
                    <div className="rounded-xl border border-surface-highlight bg-surface p-6">
                      <p className="text-gray-200 font-semibold">Billing isn’t enabled for this Clerk application yet.</p>
                      <p className="text-gray-300 mt-2">
                        Enable Clerk Billing in your Clerk Dashboard to show the upgrade options.
                      </p>
                      <a
                        className="mt-4 inline-flex items-center justify-center rounded-lg border border-orange-500/50 bg-orange-500/15 px-4 py-2 text-sm font-semibold text-orange-200 hover:bg-orange-500/20 transition-colors"
                        href="https://dashboard.clerk.com/last-active?path=billing/settings"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Clerk Billing settings
                      </a>
                    </div>
                  }
                >
                  <PricingTable />
                </ErrorBoundary>
              ) : (
                <div className="rounded-xl border border-surface-highlight bg-surface p-6">
                  <p className="text-gray-200 font-semibold">Billing isn’t enabled for this Clerk application yet.</p>
                  <p className="text-gray-300 mt-2">
                    Enable Clerk Billing in your Clerk Dashboard to show the upgrade options.
                  </p>
                  <a
                    className="mt-4 inline-flex items-center justify-center rounded-lg border border-orange-500/50 bg-orange-500/15 px-4 py-2 text-sm font-semibold text-orange-200 hover:bg-orange-500/20 transition-colors"
                    href="https://dashboard.clerk.com/last-active?path=billing/settings"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Clerk Billing settings
                  </a>
                </div>
              )}
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
