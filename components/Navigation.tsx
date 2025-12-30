'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-surface border-b border-surface-highlight sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 relative">
              <Image
                src="/images/emojis/GREENPAW.jpeg"
                alt="Paws & Plates logo"
                fill
                className="object-contain rounded-md"
                sizes="40px"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">Paws & Plates</span>
              <span className="text-xs text-gray-400 -mt-1 leading-tight">Meal prep for ALL your pets!</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-gray-300 hover:text-orange-400 transition-colors">
              About
            </Link>
            <Link href="/blog" className="text-gray-300 hover:text-orange-400 transition-colors">
              Blog
            </Link>
            <Link href="/forum" className="text-gray-300 hover:text-orange-400 transition-colors">
              Community
            </Link>

            <Link href="/profile" className="text-gray-300 hover:text-orange-400 transition-colors">
              My Pets
            </Link>
            <Link
              href="/sign-in"
              className="btn btn-primary btn-md btn-ripple"
            >
              Sign In
            </Link>
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
              <Link href="/about" className="text-gray-300 hover:text-orange-400">
                About
              </Link>
              <Link href="/blog" className="text-gray-300 hover:text-orange-400">
                Blog
              </Link>
              <Link href="/forum" className="text-gray-300 hover:text-orange-400">
                Community
              </Link>

              <Link href="/profile" className="text-gray-300 hover:text-orange-400">
                My Pets
              </Link>
              <Link
                href="/sign-in"
                className="btn btn-primary btn-md btn-ripple"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}