'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  translations?: {
    title: string;
    message: string;
    reload: string;
    reportError: string;
  };
  onError?: (error: Error, errorInfo: unknown) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error tracking service integration
 * In production, replace this with actual error tracking service (e.g., Sentry)
 */
const trackError = (error: Error, errorInfo: unknown) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  // In production, send to error tracking service
  // Example with Sentry:
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, {
  //     contexts: {
  //       react: {
  //         componentStack: errorInfo,
  //       },
  //     },
  //   });
  // }

  // You can also send to your own error tracking endpoint
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     error: {
  //       message: error.message,
  //       stack: error.stack,
  //       name: error.name,
  //     },
  //     errorInfo,
  //     url: window.location.href,
  //     userAgent: navigator.userAgent,
  //     timestamp: new Date().toISOString(),
  //   }),
  // }).catch(() => {
  //   // Silently fail if error tracking fails
  // });
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Track error using provided callback or default tracking
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      trackError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const translations = this.props.translations || {
        title: 'Something went wrong',
        message: 'An unexpected error occurred. Our team has been notified.',
        reload: 'Reload Page',
        reportError: 'Report Error',
      };

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold mb-2">{translations.title}</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            {this.state.error?.message || translations.message}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              {translations.reload}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

