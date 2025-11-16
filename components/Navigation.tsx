'use client';

import Link from 'next/link';
import { Menu, X, ChefHat } from 'lucide-react';
import { useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">PetPlates</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/recipes" className="text-gray-700 hover:text-primary-600 transition-colors">
              All Recipes
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
              About
            </Link>
            
            {!isSignedIn ? (
              <Link 
                href="/sign-in"
                className="px-6 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-primary-600 transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <>
                <Link href="/profile" className="text-gray-700 hover:text-primary-600 transition-colors">
                  My Profile
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <Link href="/recipes" className="text-gray-700 hover:text-primary-600">
                All Recipes
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600">
                About
              </Link>
              
              {!isSignedIn ? (
                <Link 
                  href="/sign-in"
                  className="px-6 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-primary-600"
                >
                  Sign In
                </Link>
              ) : (
                <>
                  <Link href="/profile" className="text-gray-700 hover:text-primary-600">
                    My Profile
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}