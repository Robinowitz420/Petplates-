'use client';

import React from 'react';
import { Shield, Award, Heart, CheckCircle } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: 'AAFCO Compliant',
      subtitle: 'Meets nutritional standards',
      color: 'text-green-400'
    },
    {
      icon: Award,
      title: 'WSAVA Guidelines',
      subtitle: 'Veterinary approved',
      color: 'text-blue-400'
    },
    {
      icon: Heart,
      title: 'All Pet Types',
      subtitle: 'Dogs, cats, birds, reptiles',
      color: 'text-orange-400'
    },
    {
      icon: CheckCircle,
      title: 'Science-Backed',
      subtitle: 'Evidence-based nutrition',
      color: 'text-green-400'
    }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 py-6">
      {badges.map((badge, idx) => {
        const Icon = badge.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-3 bg-surface-highlight border border-surface rounded-lg px-4 py-3 hover:border-orange-500/50 transition-colors"
          >
            <Icon className={`${badge.color} flex-shrink-0`} size={24} />
            <div>
              <div className="font-semibold text-white text-sm">{badge.title}</div>
              <div className="text-xs text-gray-400">{badge.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

