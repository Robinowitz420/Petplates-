// components/ErrorBoundaryWrapper.tsx
// Client component wrapper for ErrorBoundary

'use client';

import { ErrorBoundary } from './ErrorBoundary';

export default function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // In production, you might want to send to error tracking service
        // e.g., Sentry.captureException(error, { contexts: { react: errorInfo } });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

