'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Users, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { floating, fadeIn, scaleIn, hoverScale, SPRING, getMotionScaleTransition } from '@/lib/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function EmptyState() {
  const t = useTranslations('teamDirectory');
  const prefersReducedMotion = useReducedMotion();
  const clearFilters = useTeamDirectoryStore((state) => state.clearFilters);
  const hasActiveFilters = useTeamDirectoryStore(
    (state) => state.searchTerm || state.selectedRole
  );

  const Icon = hasActiveFilters ? SearchX : Users;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl border-2 border-primary/10 bg-card relative overflow-hidden shadow-soft"
      role="status"
      aria-live="polite"
    >
      {/* Soft gradient background */}
      <div className="absolute inset-0 gradient-mesh opacity-40" />
      <div className="absolute inset-0 bg-gradient-rose-lavender opacity-5" />
      
      <motion.div
        variants={scaleIn}
        className="relative mb-6"
      >
        <motion.div
          variants={floating}
          animate="animate"
          className="absolute inset-0 bg-muted rounded-full blur-2xl opacity-50"
        />
        <motion.div
          variants={floating}
          animate="animate"
          transition={{ delay: 0.2, duration: 3 }}
        >
          <Icon className="relative h-20 w-20 text-muted-foreground" aria-hidden="true" />
        </motion.div>
      </motion.div>
      
      <motion.h3
        variants={fadeIn}
        transition={prefersReducedMotion ? { duration: 0 } : { ...getMotionScaleTransition('small'), delay: 0.1 }}
        className="text-2xl font-semibold mb-3 text-foreground"
      >
        {t('emptyState.title')}
      </motion.h3>
      
      <motion.p
        variants={fadeIn}
        transition={prefersReducedMotion ? { duration: 0 } : { ...getMotionScaleTransition('small'), delay: 0.2 }}
        className="text-muted-foreground text-center mb-8 max-w-md text-base leading-relaxed"
      >
        {hasActiveFilters
          ? t('emptyState.filteredMessage')
          : t('emptyState.noDataMessage')}
      </motion.p>
      
      {hasActiveFilters && (
        <motion.div
          variants={fadeIn}
          transition={prefersReducedMotion ? { duration: 0 } : { ...getMotionScaleTransition('small'), delay: 0.3 }}
        >
          <motion.div
            whileHover={hoverScale}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={clearFilters} variant="default" size="lg" className="relative overflow-hidden group shadow-rose">
              {t('filters.clearFilters')}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

