'use client';

import { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from './useMediaQuery';

interface UseAvailableHeightOptions {
  /**
   * Exclude header height from calculation
   * @default true
   */
  excludeHeader?: boolean;
  /**
   * Exclude filters sidebar height (on mobile/tablet where filters are above content)
   * @default false
   */
  excludeFilters?: boolean;
  /**
   * Additional offset in pixels to subtract
   * @default 0
   */
  offset?: number;
  /**
   * Reference to the container element (for calculating relative heights)
   */
  containerRef?: React.RefObject<HTMLElement>;
}

/**
 * Hook to calculate available viewport height for content
 * Accounts for navbar, header, filters, and padding
 */
export function useAvailableHeight(options: UseAvailableHeightOptions = {}) {
  const {
    excludeHeader = true,
    excludeFilters = false,
    offset = 0,
    containerRef,
  } = options;

  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const filtersRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const calculateHeight = () => {
      if (typeof window === 'undefined') return;

      // Get navbar height from CSS variable
      const navbarHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--navbar-height')
          .replace('px', '') || '56'
      );

      // Get viewport height
      const viewportHeight = window.innerHeight;

      let height = viewportHeight - navbarHeight;

      // Subtract header height if needed
      if (excludeHeader) {
        if (!headerRef.current) {
          // Try to find header element
          headerRef.current = document.querySelector('header') as HTMLElement;
        }
        if (headerRef.current) {
          const headerHeight = headerRef.current.offsetHeight;
          height -= headerHeight;
        } else {
          // Fallback: estimate header height based on screen size
          const estimatedHeaderHeight = isMobile ? 140 : 160;
          height -= estimatedHeaderHeight;
        }
      }

      // Subtract filters height if needed (on mobile/tablet where filters are above)
      if (excludeFilters && (isMobile || isTablet)) {
        if (!filtersRef.current) {
          // Try to find filters element
          filtersRef.current = document.querySelector('[aria-label*="search"], [aria-label*="filter"]')?.closest('aside') as HTMLElement;
        }
        if (filtersRef.current) {
          const filtersHeight = filtersRef.current.offsetHeight;
          height -= filtersHeight;
        } else {
          // Fallback: estimate filters height
          const estimatedFiltersHeight = isMobile ? 200 : 180;
          height -= estimatedFiltersHeight;
        }
      }

      // Subtract padding/margins (main content area padding)
      // py-4 = 1rem top + 1rem bottom = 2rem = 32px
      // gap-4 = 1rem = 16px
      const paddingAndGaps = isMobile ? 48 : 64; // Account for padding and gaps
      height -= paddingAndGaps;

      // Subtract additional offset
      height -= offset;

      // If using container ref, calculate relative to container instead
      if (containerRef?.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerHeight = containerRect.height;
        const containerStyles = getComputedStyle(containerRef.current);
        const containerPadding = 
          (parseFloat(containerStyles.paddingTop) || 0) +
          (parseFloat(containerStyles.paddingBottom) || 0);
        height = containerHeight - containerPadding;
      }

      // Ensure minimum height
      const minHeight = 200;
      height = Math.max(height, minHeight);

      setAvailableHeight(height);
    };

    // Calculate on mount
    calculateHeight();

    // Recalculate on resize
    const handleResize = () => {
      calculateHeight();
    };

    window.addEventListener('resize', handleResize);
    
    // Recalculate when filters visibility might change
    const observer = new ResizeObserver(() => {
      calculateHeight();
    });

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }
    if (filtersRef.current) {
      observer.observe(filtersRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [excludeHeader, excludeFilters, offset, isMobile, isTablet, containerRef]);

  return availableHeight;
}
