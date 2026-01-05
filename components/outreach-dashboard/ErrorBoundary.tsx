'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#fee2e2',
          border: '4px solid #dc2626',
          padding: '2rem',
          fontFamily: 'monospace',
          color: '#991b1b'
        }}>
          <h1 style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '2rem' }}>
            🚨 Outreach Dashboard Error
          </h1>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Error Message:</strong>
            <pre style={{
              backgroundColor: '#fecaca',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginTop: '0.5rem',
              overflow: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </div>

          {this.state.errorInfo && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Stack Trace:</strong>
              <pre style={{
                backgroundColor: '#fecaca',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginTop: '0.5rem',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontSize: '0.8rem',
                maxHeight: '300px'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <strong>💡 Troubleshooting:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Check the browser Network tab for failed requests</li>
              <li>Check the browser Console tab for JavaScript errors</li>
              <li>Try refreshing the page</li>
              <li>Make sure the API routes are working: <code>/api/outreach/config</code></li>
            </ul>
          </div>

          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
