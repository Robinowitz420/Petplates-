'use client';

import React, { useState } from 'react';
import { X, Mail, Download, Sparkles } from 'lucide-react';
import { Pet } from '@/lib/types';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  petType?: string;
  mealCount?: number;
  trigger?: 'exit-intent' | 'meal-view' | 'plan-generated';
}

export default function EmailCaptureModal({
  isOpen,
  onClose,
  petType = 'your pet',
  mealCount = 5,
  trigger = 'meal-view'
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Store email in localStorage for now (later: send to email service)
      if (typeof window !== 'undefined') {
        const leads = JSON.parse(localStorage.getItem('email_leads') || '[]');
        leads.push({
          email,
          petType,
          trigger,
          timestamp: new Date().toISOString(),
          mealCount
        });
        localStorage.setItem('email_leads', JSON.stringify(leads));
      }

      // TODO: Send to email service (Mailchimp, ConvertKit, etc.)
      // await fetch('/api/subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, petType, trigger })
      // });

      setIsSubmitted(true);
      
      // Close after 2 seconds
      setTimeout(() => {
        onClose();
        // Reset state after close animation
        setTimeout(() => {
          setIsSubmitted(false);
          setEmail('');
        }, 300);
      }, 2000);

    } catch (error) {
      console.error('Email capture error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-green-600 to-green-700 border-2 border-green-400 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">You're In!</h3>
          <p className="text-green-100">
            Check your email for your free meal plan PDF and exclusive tips!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border-2 border-orange-500/50 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Wait! Get Your Free Meal Plan
              </h2>
              <p className="text-orange-100 text-sm">
                Instant PDF + Weekly nutrition tips
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-3">
              Get {mealCount}+ Personalized Meal Recipes for {petType}
            </h3>
            
            {/* Benefits */}
            <div className="space-y-3 mb-6">
              {[
                '📧 Instant delivery to your inbox',
                '🥗 Vet-approved, nutritionally balanced',
                '🛒 Direct Amazon shopping links',
                '💰 100% FREE - No credit card required',
                '🎁 BONUS: Weekly nutrition tips'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="text-lg mt-0.5">{benefit.split(' ')[0]}</div>
                  <p className="text-gray-300 text-sm">
                    {benefit.split(' ').slice(1).join(' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-surface-highlight border-2 border-surface-highlight focus:border-orange-500 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all transform ${
                isSubmitting
                  ? 'bg-gray-600 cursor-wait text-gray-300 scale-95'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 border-3 border-green-400'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Download size={20} />
                  Get My Free Meal Plan
                </span>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            We respect your privacy. Unsubscribe anytime. No spam, ever.
          </p>
        </div>

        {/* Trust Footer */}
        <div className="bg-surface-lighter px-6 py-4 border-t border-surface-highlight">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-green-400">✓</span> 100% Free
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-400">✓</span> No Credit Card
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-400">✓</span> Instant Access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Exit intent detector hook
export function useExitIntent(onExitIntent: () => void) {
  React.useEffect(() => {
    let hasShown = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect mouse leaving viewport at top (exit intent)
      if (e.clientY <= 10 && !hasShown) {
        hasShown = true;
        onExitIntent();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [onExitIntent]);
}

