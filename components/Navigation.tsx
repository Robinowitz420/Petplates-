'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import AlphabetText from '@/components/AlphabetText';
import LogoFinal2 from '@/public/images/emojis/Mascots/HeroPics/LogoFinal2.png';
import MealPrepForAllYourPets from '@/public/images/emojis/Mascots/HeroPics/MealPrepForAllYourPets.png';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <nav className="bg-surface border-b border-surface-highlight sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-2">
          {/* Logo Section - Responsive */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            {/* Logo Image */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
              <Image
                src={LogoFinal2}
                alt="Paws & Plates mascot logo"
                fill
                className="object-contain pointer-events-none"
                sizes="(min-width: 640px) 64px, 48px"
                priority
              />
            </div>

            {/* Tagline Image - Hidden on very small screens */}
            <div className="hidden xs:block relative w-32 h-8 sm:w-44 sm:h-10 flex-shrink-0">
              <Image
                src={MealPrepForAllYourPets}
                alt="Meal prep for all your pets"
                fill
                className="object-contain pointer-events-none"
                sizes="(min-width: 640px) 176px, 128px"
                priority
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/about"
              className="group flex items-center border-2 border-orange-400 rounded-full px-4 py-1 transition-colors hover:bg-orange-500/10"
              aria-label="About"
            >
              <AlphabetText text="About" size={32} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
            </Link>
            <Link
              href="/creators"
              className="group flex items-center border-2 border-orange-400 rounded-full px-4 py-1 transition-colors hover:bg-orange-500/10"
              aria-label="Creators"
            >
              <AlphabetText text="Creators" size={32} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
            </Link>
            <Link
              href="/blog"
              className="group flex items-center border-2 border-orange-400 rounded-full px-4 py-1 transition-colors hover:bg-orange-500/10"
              aria-label="Blog"
            >
              <AlphabetText text="Blog" size={32} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
            </Link>
            <Link
              href="/forum"
              className="group flex items-center border-2 border-orange-400 rounded-full px-4 py-1 transition-colors hover:bg-orange-500/10"
              aria-label="Community"
            >
              <AlphabetText text="Community" size={32} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
            </Link>

            {hasMounted ? (
              <SignedIn>
                <Link
                  href="/profile"
                  className="group flex items-center border-2 border-orange-400 rounded-full px-4 py-1 transition-colors hover:bg-orange-500/10"
                  aria-label="My Pets"
                >
                  <AlphabetText text="My Pets" size={32} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
                </Link>
                {/* SEO Dashboard - Admin Only */}
                <Link
                  href="/seo-dashboard"
                  className="group flex items-center border-2 border-blue-400 rounded-full px-4 py-1 transition-colors hover:bg-blue-500/10"
                  aria-label="SEO Dashboard"
                  title="SEO Management Dashboard"
                >
                  <AlphabetText text="SEO" size={32} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                </Link>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-[42px] h-[42px]',
                    },
                  }}
                />
              </SignedIn>
            ) : null}
            {hasMounted ? (
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="btn btn-primary btn-md btn-ripple border-2 border-orange-400 rounded-full px-4 py-1 transition-colors hover:bg-orange-500/10"
                >
                  Sign In
                </Link>
              </SignedOut>
            ) : null}
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="btn btn-ghost btn-icon"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 pt-2">
            <div className="flex flex-col space-y-3">
              <Link
                href="/about"
                className="text-gray-300 hover:text-orange-400 border-2 border-orange-400 rounded-full px-6 py-3 text-center min-h-[44px] flex items-center justify-center"
                aria-label="About"
                onClick={() => setIsOpen(false)}
              >
                <AlphabetText text="About" size={32} />
              </Link>
              <Link
                href="/creators"
                className="text-gray-300 hover:text-orange-400 border-2 border-orange-400 rounded-full px-6 py-3 text-center min-h-[44px] flex items-center justify-center"
                aria-label="Creators"
                onClick={() => setIsOpen(false)}
              >
                <AlphabetText text="Creators" size={32} />
              </Link>
              <Link
                href="/blog"
                className="text-gray-300 hover:text-orange-400 border-2 border-orange-400 rounded-full px-6 py-3 text-center min-h-[44px] flex items-center justify-center"
                aria-label="Blog"
                onClick={() => setIsOpen(false)}
              >
                <AlphabetText text="Blog" size={32} />
              </Link>
              <Link
                href="/forum"
                className="text-gray-300 hover:text-orange-400 border-2 border-orange-400 rounded-full px-6 py-3 text-center min-h-[44px] flex items-center justify-center"
                aria-label="Community"
                onClick={() => setIsOpen(false)}
              >
                <AlphabetText text="Community" size={32} />
              </Link>
              {/* SEO Dashboard - Admin Only */}
              <Link
                href="/seo-dashboard"
                className="text-gray-300 hover:text-blue-400 border-2 border-blue-400 rounded-full px-6 py-3 text-center min-h-[44px] flex items-center justify-center"
                aria-label="SEO Dashboard"
                title="SEO Management Dashboard"
                onClick={() => setIsOpen(false)}
              >
                <AlphabetText text="SEO" size={32} />
              </Link>

              {hasMounted ? (
                <SignedIn>
                  <Link
                    href="/profile"
                    className="text-gray-300 hover:text-orange-400 border-2 border-orange-400 rounded-full px-6 py-3 text-center min-h-[44px] flex items-center justify-center"
                    aria-label="My Pets"
                    onClick={() => setIsOpen(false)}
                  >
                    <AlphabetText text="My Pets" size={32} />
                  </Link>
                  <div className="flex justify-center mt-2">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: 'w-[44px] h-[44px]',
                        },
                      }}
                    />
                  </div>
                </SignedIn>
              ) : null}
              {hasMounted ? (
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="btn btn-primary btn-md btn-ripple border-2 border-orange-400 rounded-full px-6 py-3 text-center min-h-[44px] flex items-center justify-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                </SignedOut>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}