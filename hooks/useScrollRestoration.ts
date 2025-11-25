'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const SCROLL_POSITION_KEY_PREFIX = 'scroll-position:';

/**
 * Hook to save and restore scroll position for a specific route
 * Saves scroll position in sessionStorage when navigating away
 * Restores scroll position when returning to the route
 */
export function useScrollRestoration(
  scrollContainerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean = true
) {
  const pathname = usePathname();
  const storageKey = `${SCROLL_POSITION_KEY_PREFIX}${pathname}`;
  const hasRestoredRef = useRef(false);
  const isSavingRef = useRef(false);

  // Restore scroll position on mount/route change
  useEffect(() => {
    if (!enabled || !scrollContainerRef.current || hasRestoredRef.current) return;

    const savedPosition = sessionStorage.getItem(storageKey);
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);
      if (!isNaN(position) && position > 0) {
        // Wait for DOM to be ready before restoring
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = position;
            hasRestoredRef.current = true;
          }
        });
      }
    }
  }, [pathname, storageKey, enabled, scrollContainerRef]);

  // Save scroll position on scroll
  useEffect(() => {
    if (!enabled || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;

    const handleScroll = () => {
      if (isSavingRef.current) return; // Prevent saving while restoring

      const scrollTop = container.scrollTop;
      if (scrollTop > 0) {
        // Throttle saves to avoid excessive writes
        sessionStorage.setItem(storageKey, scrollTop.toString());
      }
    };

    // Use passive listener for better performance
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, storageKey, enabled, scrollContainerRef]);

  // Save scroll position before navigation away
  useEffect(() => {
    if (!enabled || !scrollContainerRef.current) return;

    const handleBeforeUnload = () => {
      const container = scrollContainerRef.current;
      if (container && !isSavingRef.current) {
        const scrollTop = container.scrollTop;
        if (scrollTop > 0) {
          sessionStorage.setItem(storageKey, scrollTop.toString());
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname, storageKey, enabled, scrollContainerRef]);

  /**
   * Clear saved scroll position for current route
   */
  const clearSavedPosition = () => {
    sessionStorage.removeItem(storageKey);
  };

  /**
   * Reset restoration flag (useful when you want to restore again)
   */
  const resetRestoration = () => {
    hasRestoredRef.current = false;
  };

  return {
    clearSavedPosition,
    resetRestoration,
  };
}

