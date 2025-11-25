'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerTable, staggerGrid, rowAppear, cardAppear, fadeIn, skeletonFadeOut } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'table' | 'card' | 'grid' | 'table-row' | 'filter-bar';
  count?: number;
  preserveLayout?: boolean;
}

export function LoadingSkeleton({ 
  variant = 'table', 
  count = 5,
  preserveLayout = true 
}: LoadingSkeletonProps) {
  // Table Row Variant (compact) - matches table row structure
  // Mobile: h-[44px], Desktop: h-[48px]
  if (variant === 'table-row') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col h-full min-h-0 px-1"
        role="status"
        aria-label="Loading table rows"
      >
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border-2 border-primary/10 bg-card overflow-hidden shadow-soft">
          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto -mx-1 px-1">
            <div className="space-y-0 min-w-[600px]">
              {/* Table Header Skeleton */}
              <div className="flex gap-2 items-center h-10 md:h-12 px-2 border-b bg-muted/30 sticky top-0 z-10">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" preserveLayout={preserveLayout} />
                <Skeleton className="h-4 w-24 flex-shrink-0" preserveLayout={preserveLayout} />
                <Skeleton className="h-4 w-20 flex-shrink-0" preserveLayout={preserveLayout} />
                <Skeleton className="h-4 flex-1 max-w-[200px]" preserveLayout={preserveLayout} />
              </div>
              {/* Table Rows Skeleton */}
              {Array.from({ length: count }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={rowAppear}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                  className={cn(
                    "flex gap-2 items-center border-b border-primary/5",
                    "h-[44px] md:h-[48px]",
                    "px-2",
                    i % 2 === 0 ? "bg-background" : "bg-muted/20"
                  )}
                  style={{ minHeight: preserveLayout ? '44px' : undefined }}
                >
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0 animate-shimmer" preserveLayout={preserveLayout} />
                  <Skeleton className="h-4 flex-1 max-w-[200px] animate-shimmer" preserveLayout={preserveLayout} />
                  <Skeleton className="h-6 w-20 rounded-lg flex-shrink-0 animate-shimmer" preserveLayout={preserveLayout} />
                  <Skeleton className="h-4 w-40 md:w-48 flex-shrink-0 animate-shimmer" preserveLayout={preserveLayout} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Table Variant (full table)
  if (variant === 'table') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerTable}
        className="space-y-2"
        role="status"
        aria-label="Loading table"
      >
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            variants={rowAppear}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.1,
            }}
            className="flex gap-4 items-center px-3 py-2"
            style={{ minHeight: preserveLayout ? '64px' : undefined }}
          >
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0 animate-shimmer" preserveLayout={preserveLayout} />
            <Skeleton className="h-4 flex-1 max-w-[200px] animate-shimmer" preserveLayout={preserveLayout} />
            <Skeleton className="h-6 w-24 rounded-lg flex-shrink-0 animate-shimmer" preserveLayout={preserveLayout} />
            <Skeleton className="h-4 w-48 flex-shrink-0 animate-shimmer" preserveLayout={preserveLayout} />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Card Variant - matches TeamMemberCard structure exactly
  if (variant === 'card') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={staggerGrid}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 [1300px]:grid-cols-4 gap-4 md:gap-6 items-start"
        role="status"
        aria-label="Loading cards"
      >
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            variants={cardAppear}
            exit="exit"
            className="p-8 border-2 border-primary/10 rounded-2xl bg-card shadow-soft"
            style={{ minHeight: preserveLayout ? '240px' : undefined }}
          >
            <div className="flex flex-col items-center text-center">
              <Skeleton className="h-20 w-20 rounded-full mb-4 flex-shrink-0" preserveLayout={preserveLayout} />
              <Skeleton className="h-5 w-32 mb-2" preserveLayout={preserveLayout} />
              <Skeleton className="h-6 w-20 rounded-xl mb-4" preserveLayout={preserveLayout} />
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-4 rounded" preserveLayout={preserveLayout} />
                <Skeleton className="h-4 w-40" preserveLayout={preserveLayout} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Grid Variant - matches TeamMemberCard structure exactly
  if (variant === 'grid') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerGrid}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 [1300px]:grid-cols-4 gap-4 md:gap-6 items-start"
        role="status"
        aria-label="Loading grid"
      >
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            variants={cardAppear}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.1,
            }}
            className="p-8 border-2 border-primary/10 rounded-2xl bg-card shadow-soft"
            style={{ minHeight: preserveLayout ? '240px' : undefined }}
          >
            <div className="flex flex-col items-center text-center">
              <Skeleton className="h-20 w-20 rounded-full mb-4 flex-shrink-0 animate-shimmer" preserveLayout={preserveLayout} />
              <Skeleton className="h-5 w-32 mb-2 animate-shimmer" preserveLayout={preserveLayout} />
              <Skeleton className="h-6 w-20 rounded-xl mb-4 animate-shimmer" preserveLayout={preserveLayout} />
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-4 rounded animate-shimmer" preserveLayout={preserveLayout} />
                <Skeleton className="h-4 w-40 animate-shimmer" preserveLayout={preserveLayout} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Filter Bar Variant
  if (variant === 'filter-bar') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerGrid}
        className="flex gap-3 items-center"
        role="status"
        aria-label="Loading filters"
      >
        <motion.div variants={cardAppear}>
          <Skeleton className="h-9 flex-1 rounded-md" preserveLayout={preserveLayout} />
        </motion.div>
        <motion.div variants={cardAppear}>
          <Skeleton className="h-9 w-[200px] rounded-md" preserveLayout={preserveLayout} />
        </motion.div>
      </motion.div>
    );
  }

  return null;
}

