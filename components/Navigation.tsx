'use client';

import Link from 'next/link';
import { Menu, X, ChefHat } from 'lucide-react';
import { useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">ThePetPantry</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-primary-600 transition-colors">
              Blog
            </Link>
            <Link href="/forum" className="text-gray-700 hover:text-primary-600 transition-colors">
              Community
            </Link>
            
            {isLoaded && (
              <>
                {!isSignedIn ? (
                  <Link
                    href="/sign-in"
                    className="btn btn-primary btn-md btn-ripple"
                  >
                    Sign In
                  </Link>
                ) : (
                  <>
                    <Link href="/profile" className="text-gray-700 hover:text-primary-600 transition-colors">
                      My Pets
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                  </>
                )}
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn btn-ghost btn-icon"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <Link href="/about" className="text-gray-700 hover:text-primary-600">
                About
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-primary-600">
                Blog
              </Link>
              <Link href="/forum" className="text-gray-700 hover:text-primary-600">
                Community
              </Link>
              
              {isLoaded && (
                <>
                  {!isSignedIn ? (
                    <Link
                      href="/sign-in"
                      className="btn btn-primary btn-md btn-ripple"
                    >
                      Sign In
                    </Link>
                  ) : (
                    <>
                      <Link href="/profile" className="text-gray-700 hover:text-primary-600">
                        My Pets
                      </Link>
                      <UserButton afterSignOutUrl="/" />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}