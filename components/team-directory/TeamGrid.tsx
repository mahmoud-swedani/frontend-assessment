'use client';

import React, { memo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { TeamMemberCard } from './TeamMemberCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { staggerGrid, cardAppear, buttonLoading, loadingSpinner, SPRING, getMotionScaleTransition, getEasing } from '@/lib/animations';
import { useScrollManagement } from '@/hooks/useScrollManagement';
import { useAvailableHeight } from '@/hooks/useAvailableHeight';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const MemoizedTeamMemberCard = memo(TeamMemberCard);

// Load More Button Component with layoutId for smooth transitions
function LoadMoreButton({
  onClick,
  isLoading,
  position,
  itemsRemaining,
  pageSize,
}: {
  onClick: () => void;
  isLoading: boolean;
  position: 'top' | 'bottom';
  itemsRemaining?: number;
  pageSize: number;
}) {
  const t = useTranslations('teamDirectory');
  const [ripple, setRipple] = React.useState<{ x: number; y: number } | null>(null);

  // Calculate how many items will be loaded (min of itemsRemaining and pageSize)
  const itemsToLoad = itemsRemaining !== undefined 
    ? Math.min(itemsRemaining, pageSize) 
    : pageSize;

  // Button text with item count
  const buttonText = itemsRemaining !== undefined && itemsRemaining > 0
    ? t('loadMoreCount', { count: itemsToLoad })
    : t('loadMore');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y });
    setTimeout(() => setRipple(null), 600);
    onClick();
  };

  return (
    <motion.div
      layoutId="load-more-button"
      layout
      initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
      transition={getMotionScaleTransition('small', false, 'primary')}
      className={`flex justify-center ${position === 'top' ? 'pb-6' : 'pt-6'}`}
    >
      <motion.div {...buttonLoading}>
        <Button
          onClick={handleClick}
          disabled={isLoading}
          variant={isLoading ? "loading" : "default"}
          aria-label={isLoading ? t('loading') : buttonText}
          className="relative overflow-hidden group min-w-[140px]"
        >
          {isLoading ? (
            <>
              <motion.div
                variants={loadingSpinner}
                animate="animate"
                className="inline-flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{t('loading')}</span>
              </motion.div>
            </>
          ) : (
            <>
              <span className="relative z-10">{buttonText}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {ripple && (
                <motion.span
                  className="absolute rounded-full bg-white/40"
                  initial={{ 
                    x: ripple.x, 
                    y: ripple.y, 
                    width: 0, 
                    height: 0,
                    opacity: 0.8,
                  }}
                  animate={{ 
                    width: 300, 
                    height: 300,
                    x: ripple.x - 150,
                    y: ripple.y - 150,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}

interface TeamGridProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function TeamGrid({ scrollContainerRef }: TeamGridProps) {
  const t = useTranslations('teamDirectory');
  const prefersReducedMotion = useReducedMotion();
  const teamMembers = useTeamDirectoryStore((state) => state.teamMembers);
  const isLoading = useTeamDirectoryStore((state) => state.isLoading);
  const pagination = useTeamDirectoryStore((state) => state.pagination);
  const currentPage = useTeamDirectoryStore((state) => state.currentPage);
  const pageSize = useTeamDirectoryStore((state) => state.pageSize);
  const setCurrentPage = useTeamDirectoryStore((state) => state.setCurrentPage);
  const viewMode = useTeamDirectoryStore((state) => state.viewMode);

  // Track previous member IDs to identify new items for animation
  const previousMemberIdsRef = useRef<Set<string>>(new Set());
  // Track if we're currently loading new items (not first load)
  const isLoadingMoreRef = useRef(false);
  // Track when layout should be stable (after loading completes)
  const layoutStableRef = useRef(true);
  
  // Determine if this is the first load (no data loaded yet)
  // Button at top only when no data exists, otherwise always at bottom
  const isFirstLoad = teamMembers.length === 0;
  const showButtonAtTop = isFirstLoad && pagination?.hasNextPage;
  const showButtonAtBottom = !isFirstLoad && pagination?.hasNextPage;

  // Calculate remaining items
  const itemsRemaining = pagination?.totalCount 
    ? Math.max(0, pagination.totalCount - teamMembers.length)
    : undefined;

  // Get current member IDs
  const currentMemberIds = new Set(teamMembers.map(m => m.id));
  
  // Store previous IDs for this render (before updating ref)
  const previousIds = previousMemberIdsRef.current;
  
  // Track loading state changes to manage layout animations
  useEffect(() => {
    if (isLoading && !isFirstLoad) {
      // We're loading more items (not first load)
      isLoadingMoreRef.current = true;
      layoutStableRef.current = false;
    } else if (!isLoading && isLoadingMoreRef.current) {
      // Loading just completed, wait for layout to stabilize
      isLoadingMoreRef.current = false;
      // Use multiple RAF calls to ensure layout has stabilized
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          layoutStableRef.current = true;
        });
      });
    }
  }, [isLoading, isFirstLoad]);
  
  // Update ref for next render
  useEffect(() => {
    previousMemberIdsRef.current = new Set(teamMembers.map(m => m.id));
  }, [teamMembers]);

  // Scroll management: Only scroll to new items in grid view when loading more (not first load)
  useScrollManagement({
    scrollContainerRef,
    itemCount: teamMembers.length,
    isLoading,
    scrollToNewItems: viewMode === 'grid' && !isFirstLoad, // Only scroll in grid view after first load
    scrollBehavior: 'smooth',
  });

  const handleLoadMore = () => {
    if (pagination?.currentPage) {
      setCurrentPage(pagination.currentPage + 1);
    }
  };

  // Calculate available height for grid
  const availableHeight = useAvailableHeight({
    excludeHeader: true,
    excludeFilters: false,
    containerRef: scrollContainerRef as React.RefObject<HTMLElement>,
  });

  if (isLoading && teamMembers.length === 0) {
    return <LoadingSkeleton variant="grid" count={6} />;
  }

  return (
    <div 
      className="flex flex-col h-full min-h-0 px-4 md:px-6 lg:px-8 pt-4 md:pt-6 lg:pt-8 overflow-y-auto"
      style={availableHeight ? { height: availableHeight } : undefined}
      data-lenis-prevent
    >
      {/* Load More Button at Top (First Load Only) */}
      <AnimatePresence mode="wait">
        {showButtonAtTop && (
          <LoadMoreButton
            key="load-more-top"
            onClick={handleLoadMore}
            isLoading={isLoading}
            position="top"
            itemsRemaining={itemsRemaining}
            pageSize={pageSize}
          />
        )}
      </AnimatePresence>

      {/* Grid Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerGrid}
        className="w-full min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 [1300px]:grid-cols-4 gap-4 md:gap-6"
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      >
        <AnimatePresence>
          {teamMembers.map((member, index) => {
            // Determine if this is a new item (not in previous render)
            const isNewItem = !previousIds.has(member.id);
            
            // Use a stable unique key: member.id + index to ensure uniqueness
            // even if duplicates somehow exist (though deduplication should prevent this)
            const uniqueKey = `${member.id}-${index}`;
            
            return (
              <motion.div
                key={uniqueKey}
                data-item-index={index}
                initial={isNewItem ? { opacity: 0, y: 12 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                style={{
                  width: '100%',
                  minWidth: 0,
                }}
                transition={
                  isNewItem
                    ? getMotionScaleTransition('medium', false, 'primary')
                    : SPRING.elegant
                }
              >
                <MemoizedTeamMemberCard member={member} index={index} isNewItem={isNewItem} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Load More Button at Bottom (Subsequent Loads) */}
      <AnimatePresence mode="wait">
        {showButtonAtBottom && (
          <LoadMoreButton
            key="load-more-bottom"
            onClick={handleLoadMore}
            isLoading={isLoading}
            position="bottom"
            itemsRemaining={itemsRemaining}
            pageSize={pageSize}
          />
        )}
      </AnimatePresence>

      {/* Loading More Skeleton */}
      <AnimatePresence>
        {isLoading && teamMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={getMotionScaleTransition('small', false, 'primary')}
            className="pt-4"
          >
            <LoadingSkeleton variant="card" count={4} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

