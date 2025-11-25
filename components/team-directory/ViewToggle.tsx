'use client';

import { useState, useEffect } from 'react';
import { Table2, Grid3x3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { hoverScale, SPRING, getEasing, getMotionScaleTransition } from '@/lib/animations';
import { cn } from '@/lib/utils';

export function ViewToggle() {
  const t = useTranslations('teamDirectory');
  const viewMode = useTeamDirectoryStore((state) => state.viewMode);
  const setViewMode = useTeamDirectoryStore((state) => state.setViewMode);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same structure to prevent layout shift
    return (
      <div
        className="inline-flex gap-0.5 sm:gap-1 border-2 border-primary/10 rounded-lg sm:rounded-xl p-1 sm:p-1.5 bg-muted/30"
        role="tablist"
        aria-label="View mode selector"
      >
        <button
          role="tab"
          aria-selected={true}
          aria-controls="team-directory-content"
          className={cn(
            'inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'bg-background text-foreground shadow-sm'
          )}
          disabled
        >
          <Table2 className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t('viewToggle.table')}</span>
        </button>
        <button
          role="tab"
          aria-selected={false}
          aria-controls="team-directory-content"
          className={cn(
            'inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
          disabled
        >
          <Grid3x3 className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t('viewToggle.grid')}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative inline-flex gap-0.5 sm:gap-1 border-2 border-primary/10 rounded-lg sm:rounded-xl p-1 sm:p-1.5 bg-muted/30 shadow-soft"
      role="tablist"
      aria-label="View mode selector"
    >
      {/* Sliding background indicator with rose gradient */}
      <motion.div
        layoutId="view-toggle-indicator"
        className="absolute inset-y-1 sm:inset-y-1.5 rounded-md sm:rounded-lg bg-gradient-rose-lavender shadow-rose"
        initial={false}
        transition={SPRING.elegant}
        style={{
          insetInlineStart: viewMode === 'table' ? '4px' : 'calc(50% + 2px)',
          width: 'calc(50% - 4px)',
        }}
      />

      <motion.button
        onClick={() => setViewMode('table')}
        role="tab"
        aria-selected={viewMode === 'table'}
        aria-controls="team-directory-content"
        whileHover={hoverScale}
        whileTap={{ scale: 0.98 }}
        transition={SPRING.gentle}
        className={cn(
          'relative z-10 inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          viewMode === 'table'
            ? 'text-primary-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label={t('viewToggle.switchToTable')}
      >
        <motion.div
          animate={viewMode === 'table' ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.6, ease: getEasing('gentle') }}
        >
          <Table2 className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
        </motion.div>
        <span className="hidden sm:inline">{t('viewToggle.table')}</span>
      </motion.button>
      
      <motion.button
        onClick={() => setViewMode('grid')}
        role="tab"
        aria-selected={viewMode === 'grid'}
        aria-controls="team-directory-content"
        whileHover={hoverScale}
        whileTap={{ scale: 0.98 }}
        transition={SPRING.gentle}
        className={cn(
          'relative z-10 inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          viewMode === 'grid'
            ? 'text-primary-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label={t('viewToggle.switchToGrid')}
      >
        <motion.div
          animate={viewMode === 'grid' ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.6, ease: getEasing('gentle') }}
        >
          <Grid3x3 className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
        </motion.div>
        <span className="hidden sm:inline">{t('viewToggle.grid')}</span>
      </motion.button>
    </div>
  );
}

