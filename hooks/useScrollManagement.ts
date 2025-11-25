'use client';

import { useEffect, useRef } from 'react';

interface UseScrollManagementOptions {
  /**
   * Reference to the scroll container element
   */
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /**
   * Number of items currently in the list
   */
  itemCount: number;
  /**
   * Whether new items are being loaded
   */
  isLoading: boolean;
  /**
   * Whether to scroll to new items after they're loaded
   * @default true
   */
  scrollToNewItems?: boolean;
  /**
   * Scroll behavior for smooth scrolling
   * @default 'smooth'
   */
  scrollBehavior?: ScrollBehavior;
}

/**
 * Hook to manage scroll position when items are added to a list
 * Tracks when new items are added and optionally scrolls to them smoothly
 */
export function useScrollManagement({
  scrollContainerRef,
  itemCount,
  isLoading,
  scrollToNewItems = true,
  scrollBehavior = 'smooth',
}: UseScrollManagementOptions) {
  const previousItemCountRef = useRef(itemCount);
  const isLoadingRef = useRef(isLoading);
  const scrollPositionRef = useRef(0);

  // Track when loading starts to save scroll position
  useEffect(() => {
    if (isLoading && !isLoadingRef.current && scrollContainerRef.current) {
      // Save current scroll position when loading starts
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
    isLoadingRef.current = isLoading;
  }, [isLoading, scrollContainerRef]);

  // Handle scroll to new items when they're loaded
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const previousCount = previousItemCountRef.current;

    // New items were added (item count increased)
    if (itemCount > previousCount && !isLoading && scrollToNewItems) {
      // Wait for layout to stabilize before scrolling
      // Use multiple RAF calls to ensure DOM and layout have fully updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Additional delay to ensure animations have started
          setTimeout(() => {
            // Find the first new item using data-item-index attribute
            const firstNewItemIndex = previousCount;
            const firstNewItem = container.querySelector(
              `[data-item-index="${firstNewItemIndex}"]`
            ) as HTMLElement | null;

            if (firstNewItem) {
              // Get the current scroll position to preserve it if needed
              const currentScrollTop = container.scrollTop;
              
              // Scroll to first new item smoothly
              firstNewItem.scrollIntoView({
                behavior: scrollBehavior,
                block: 'nearest',
              });
              
              // If scroll didn't change much, it means item is already in view
              // In that case, preserve the user's scroll position
              requestAnimationFrame(() => {
                const newScrollTop = container.scrollTop;
                // If scroll jumped unexpectedly, restore previous position
                if (Math.abs(newScrollTop - currentScrollTop) > 100 && currentScrollTop > 0) {
                  container.scrollTo({
                    top: currentScrollTop,
                    behavior: 'auto',
                  });
                }
              });
            } else {
              // Fallback: Scroll to bottom of container
              container.scrollTo({
                top: container.scrollHeight,
                behavior: scrollBehavior,
              });
            }
          }, 50); // Small delay to let layout animations start
        });
      });
    }

    // Update previous count
    previousItemCountRef.current = itemCount;
  }, [itemCount, isLoading, scrollToNewItems, scrollBehavior, scrollContainerRef]);

  /**
   * Scroll to top of container
   */
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: scrollBehavior,
      });
    }
  };

  /**
   * Scroll to bottom of container
   */
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: scrollBehavior,
      });
    }
  };

  /**
   * Restore previous scroll position
   */
  const restoreScrollPosition = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollPositionRef.current,
        behavior: 'auto', // Instant restore
      });
    }
  };

  return {
    scrollToTop,
    scrollToBottom,
    restoreScrollPosition,
  };
}

