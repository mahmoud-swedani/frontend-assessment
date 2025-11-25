import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { server } from './msw-handlers';

// Mock Next.js router
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/en/team-directory',
  };
});

// Mock next-intl - improved to use actual translations from messages
vi.mock('next-intl', async () => {
  const actual = await vi.importActual<typeof import('next-intl')>('next-intl');
  
  // Load actual messages for better test accuracy
  let messages: Record<string, any> = {};
  try {
    const enMessages = await import('@/messages/en.json');
    messages = enMessages.default;
  } catch (e) {
    // Fallback if messages can't be loaded
    console.warn('Could not load messages for tests:', e);
  }
  
  // Helper to get nested value from key path (e.g., "teamDirectory.viewToggle.table")
  const getNestedValue = (obj: any, path: string): any => {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  };

  return {
    ...actual,
    useTranslations: (namespace?: string) => {
      return (key: string, values?: Record<string, any>) => {
        // Build full key path: namespace.key
        const fullKey = namespace ? `${namespace}.${key}` : key;
        
        // Try to get translated value from messages
        let value: any;
        if (namespace && messages[namespace]) {
          // Look in namespace object first
          value = getNestedValue(messages[namespace], key);
        }
        
        // If not found, try full path
        if (value === undefined) {
          value = getNestedValue(messages, fullKey);
        }
        
        // Fallback to key if not found
        const result = value !== undefined ? String(value) : fullKey;
        
        // Interpolate values if provided
        if (values && typeof result === 'string') {
          let interpolated = result;
          Object.entries(values).forEach(([k, v]) => {
            interpolated = interpolated.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
          });
          return interpolated;
        }
        
        return result;
      };
    },
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock Next.js Image component
vi.mock('next/image', () => {
  // Factory function to access React at runtime
  return {
    default: function MockImage(props: any) {
      // Import React dynamically in the mock
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const React = require('react') as typeof import('react');
      
      // Strip Next.js Image-specific props that React doesn't recognize on DOM elements
      const {
        unoptimized,
        blurDataURL,
        placeholder,
        priority,
        quality,
        sizes,
        fill,
        loader,
        onLoad,
        onError,
        onLoadingComplete,
        ...domProps
      } = props;
      
      return React.createElement('img', {
        ...domProps,
        'data-testid': props['data-testid'] || 'mock-image',
        // Add data attributes for props that might be useful in tests
        'data-unoptimized': unoptimized ? 'true' : undefined,
      });
    },
  };
});

// Mock framer-motion to avoid animation delays in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  const React = require('react');
  
  // Create motion components that strip framer-motion props before passing to DOM
  const createMotionComponent = (tag: string) => {
    return React.forwardRef((props: any, ref: any) => {
      // Strip framer-motion specific props to avoid React warnings
      const {
        initial,
        animate,
        exit,
        variants,
        transition,
        whileHover,
        whileTap,
        whileFocus,
        whileDrag,
        layout,
        layoutId,
        layoutDependency,
        layoutRoot,
        drag,
        dragConstraints,
        dragElastic,
        dragMomentum,
        dragPropagation,
        dragDirectionLock,
        dragTransition,
        onDrag,
        onDragStart,
        onDragEnd,
        ...domProps
      } = props;
      
      return React.createElement(tag, { ...domProps, ref });
    });
  };

  return {
    ...actual,
    motion: {
      div: createMotionComponent('div'),
      button: createMotionComponent('button'),
      span: createMotionComponent('span'),
      a: createMotionComponent('a'),
      h1: createMotionComponent('h1'),
      h2: createMotionComponent('h2'),
      h3: createMotionComponent('h3'),
      p: createMotionComponent('p'),
      tr: createMotionComponent('tr'),
      td: createMotionComponent('td'),
      th: createMotionComponent('th'),
      section: createMotionComponent('section'),
      article: createMotionComponent('article'),
      ul: createMotionComponent('ul'),
      li: createMotionComponent('li'),
      header: createMotionComponent('header'),
      main: createMotionComponent('main'),
      aside: createMotionComponent('aside'),
      nav: createMotionComponent('nav'),
      footer: createMotionComponent('footer'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
    useSpring: () => ({ get: () => 0 }),
    useTransform: () => 0,
    useInView: () => true,
  };
});

// Mock window.matchMedia for prefersReducedMotion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Polyfill for hasPointerCapture (needed for Radix UI in jsdom)
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn();
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn();
}

// Polyfill for scrollIntoView (needed for Radix UI Select in jsdom)
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// Polyfill for ResizeObserver (needed for useAvailableHeight hook in jsdom)
if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'undefined') {
  (window as any).ResizeObserver = class ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe() {
      // Mock implementation - no-op in tests
    }
    unobserve() {
      // Mock implementation - no-op in tests
    }
    disconnect() {
      // Mock implementation - no-op in tests
    }
  };
}

// Also add to global for Node.js environment
if (typeof global !== 'undefined' && typeof (global as any).ResizeObserver === 'undefined') {
  (global as any).ResizeObserver = class ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe() {
      // Mock implementation - no-op in tests
    }
    unobserve() {
      // Mock implementation - no-op in tests
    }
    disconnect() {
      // Mock implementation - no-op in tests
    }
  };
}

// Setup MSW
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// Suppress console errors/warnings in tests unless explicitly testing them
const originalError = console.error;
const originalWarn = console.warn;

global.console = {
  ...console,
  error: (...args: any[]) => {
    const message = String(args[0] || '');
    
    // Suppress known warnings that don't affect test behavior
    if (message.includes('Warning: ReactDOM.render')) return;
    if (message.includes('Not implemented: HTMLFormElement.prototype.submit')) return;
    if (message.includes('Received `true` for a non-boolean attribute `unoptimized`')) return;
    if (message.includes('React does not recognize the `blurDataURL` prop')) return;
    if (message.includes('whileHover') || message.includes('whileTap') || message.includes('whileFocus')) return;
    if (message.includes('layoutId') || message.includes('layout')) return;
    
    originalError(...args);
  },
  warn: (...args: any[]) => {
    const message = String(args[0] || '');
    
    // Suppress known warnings
    if (message.includes('componentWillReceiveProps')) return;
    if (message.includes('unoptimized') || message.includes('blurDataURL')) return;
    if (message.includes('whileHover') || message.includes('whileTap')) return;
    
    originalWarn(...args);
  },
};
