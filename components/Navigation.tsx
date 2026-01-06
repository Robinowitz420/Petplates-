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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-0.5">
          <Link href="/" className="flex items-center gap-3 sm:gap-4 -ml-[200px]">
            <div className="relative flex-shrink-0 w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] overflow-visible">
              <Image
                src={LogoFinal2}
                alt="Paws & Plates mascot logo"
                fill
                className="object-contain rounded-md scale-[1.6] origin-left"
                sizes="(min-width: 640px) 192px, 160px"
                priority
              />
            </div>

            <div className="relative flex-shrink-0 w-[140px] h-[36px] sm:w-[182px] sm:h-[48px] translate-x-[100px] sm:translate-x-[100px]">
              <Image
                src={MealPrepForAllYourPets}
                alt="Meal prep for all your pets"
                fill
                className="object-contain"
                sizes="(min-width: 640px) 260px, 200px"
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
                <UserButton afterSignOutUrl="/" />
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
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/about"
                className="text-gray-300 hover:text-orange-400 border-2 border-orange-400 rounded-full px-4 py-2"
                aria-label="About"
              >
                <AlphabetText text="About" size={32} />
              </Link>
              <Link
                href="/creators"
                className="text-gray-300 hover:text-orange-400 border-2 border-orange-400 rounded-full px-4 py-2"
                aria-label="Creators"
              >
                <AlphabetText text="Creators" size={32} />
              </Link>
              <Link
                href="/blog"
                className="text-gray-300 hover:text-orange-400 border-2 border-orange-400 rounded-full px-4 py-2"
                aria-label="Blog"
              >
                <AlphabetText text="Blog" size={32} />
              </Link>
              <Link
                href="/forum"
                className="text-gray-300 hover:text-orange-400 border-2 border-orange-400 rounded-full px-4 py-2"
                aria-label="Community"
              >
                <AlphabetText text="Community" size={32} />
              </Link>

              {hasMounted ? (
                <SignedIn>
                  <Link
                    href="/profile"
                    className="text-gray-300 hover:text-orange-400 border-2 border-orange-400 rounded-full px-4 py-2"
                    aria-label="My Pets"
                  >
                    <AlphabetText text="My Pets" size={32} />
                  </Link>
                  <div className="mt-2">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              ) : null}
              {hasMounted ? (
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="btn btn-primary btn-md btn-ripple border-2 border-orange-400 rounded-full px-4 py-2"
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