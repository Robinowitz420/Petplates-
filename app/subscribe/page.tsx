'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';

export default function SubscribePage() {
  const [email, setEmail] = useState('');
  const [petType, setPetType] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send to your backend/email service
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="text-green-600 mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            You're Subscribed!
          </h2>
          <p className="text-gray-600 mb-6">
            Check your inbox for a welcome email with exclusive recipes and tips.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Subscribe to ThePetPantry
          </h1>
          <p className="text-xl text-primary-100">
            Get exclusive recipes, nutrition tips, and special offers
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Benefits */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What You'll Get
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-primary-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900">Weekly Recipe Updates</h3>
                <p className="text-gray-600">New recipes delivered to your inbox every week</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-primary-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900">Nutrition Tips</h3>
                <p className="text-gray-600">Expert advice on pet nutrition and health</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-primary-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900">Exclusive Discounts</h3>
                <p className="text-gray-600">Subscriber-only deals on meal plans</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-primary-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900">Early Access</h3>
                <p className="text-gray-600">Be first to try new recipes and features</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Subscribe Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="petType" className="block text-sm font-semibold text-gray-700 mb-2">
                What type of pet do you have?
              </label>
              <select
                id="petType"
                required
                value={petType}
                onChange={(e) => setPetType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select your pet type</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="reptile">Reptile</option>
                <option value="pocket-pet">Pocket Pet</option>
                <option value="multiple">Multiple Pets</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-lg"
            >
              Subscribe Now
            </button>

            <p className="text-sm text-gray-500 text-center">
              We respect your privacy. Unsubscribe anytime. No spam, we promise! 🐾
            </p>
          </form>
        </div>

        {/* Social Proof */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Join <strong>10,000+</strong> pet parents who trust ThePetPantry
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="w-6 h-6 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            4.9/5 average rating from our community
          </p>
        </div>
      </div>
    </div>
  );
}
