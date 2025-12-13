// components/LoadingSpinner.tsx
// Reusable loading spinner component

'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export function LoadingSpinner({ 
  size = 'md', 
  message,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`} />
      {message && (
        <p className="text-gray-600 text-sm font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;

