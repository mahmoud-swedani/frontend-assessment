'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { slideUp, staggerItem, SPRING, getMotionScaleTransition } from '@/lib/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SearchInput } from './SearchInput';
import { RoleFilter } from './RoleFilter';
import { SortFilter } from './SortFilter';
import { FilterChips } from './FilterChips';
import { AdvancedFiltersDrawer } from './AdvancedFiltersDrawer';

export function TeamFilters() {
  const t = useTranslations('teamDirectory');
  const prefersReducedMotion = useReducedMotion();
  const [showAdvancedDrawer, setShowAdvancedDrawer] = useState(false);
  
  const searchTerm = useTeamDirectoryStore((state) => state.searchTerm);
  const selectedRole = useTeamDirectoryStore((state) => state.selectedRole);
  const sortBy = useTeamDirectoryStore((state) => state.sortBy);
  const clearFilters = useTeamDirectoryStore((state) => state.clearFilters);

  const handleClearAll = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const hasActiveFilters = searchTerm || selectedRole || sortBy;
  const filterCount = (searchTerm ? 1 : 0) + (selectedRole ? 1 : 0) + (sortBy ? 1 : 0);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUp}
      className="rounded-2xl border-2 border-primary/10 bg-card p-6 shadow-soft hover:shadow-medium hover:border-primary/20 transition-all duration-300"
      style={{ contain: 'layout style paint' }}
      role="search"
      aria-label={t('filters.searchLabel')}
    >
      <div className="flex flex-col sm:flex-row md:flex-col gap-3">
        {/* Search Input */}
        <motion.div variants={staggerItem}>
          <SearchInput />
        </motion.div>

        {/* Role Filter */}
        <motion.div variants={staggerItem}>
          <RoleFilter />
        </motion.div>

        {/* Sort Filter */}
        <motion.div variants={staggerItem}>
          <SortFilter />
        </motion.div>

        {/* Advanced Filters Button */}
        <motion.div variants={staggerItem} className="w-full sm:w-auto md:w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedDrawer(true)}
            className="h-9 w-full sm:w-auto md:w-full whitespace-nowrap"
            aria-label={t('filters.advancedFilters')}
          >
            <Settings2 className="h-4 w-4 me-2" aria-hidden="true" />
            {t('filters.advanced')}
            {filterCount > 0 && (
              <span className="ms-2 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                {filterCount}
              </span>
            )}
          </Button>
        </motion.div>

        {/* Clear Filters Button */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={prefersReducedMotion ? { duration: 0 } : getMotionScaleTransition('small', true)}
              className="w-full sm:w-auto md:w-full"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={SPRING.gentle}
              >
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="w-full sm:w-auto md:w-full whitespace-nowrap"
                  aria-label={t('filters.clearFilters')}
                >
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={SPRING.bouncy}
                  >
                    <X className="h-4 w-4 me-2" aria-hidden="true" />
                  </motion.div>
                  {t('filters.clearFilters')}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filters - Pill Style Chips */}
      <FilterChips />

      {/* Advanced Filter Drawer */}
      <AdvancedFiltersDrawer
        isOpen={showAdvancedDrawer}
        onClose={() => setShowAdvancedDrawer(false)}
      />
    </motion.div>
  );
}
