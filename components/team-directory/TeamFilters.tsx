'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Settings2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { slideUp, staggerItem, SPRING, getMotionScaleTransition } from '@/lib/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SearchInput } from './SearchInput';
import { RoleFilter } from './RoleFilter';
import { SortFilter } from './SortFilter';
import { FilterChips } from './FilterChips';
import { AdvancedFiltersDrawer } from './AdvancedFiltersDrawer';

interface TeamFiltersProps {
  showAdvancedDrawer?: boolean;
  setShowAdvancedDrawer?: (show: boolean) => void;
}

export function TeamFilters({ showAdvancedDrawer: externalShowDrawer, setShowAdvancedDrawer: externalSetShowDrawer }: TeamFiltersProps = {}) {
  const t = useTranslations('teamDirectory');
  const prefersReducedMotion = useReducedMotion();
  const [internalShowAdvancedDrawer, setInternalShowAdvancedDrawer] = useState(false);
  
  // Use external drawer state if provided, otherwise use internal state
  const showAdvancedDrawer = externalShowDrawer !== undefined ? externalShowDrawer : internalShowAdvancedDrawer;
  const setShowAdvancedDrawer = externalSetShowDrawer || setInternalShowAdvancedDrawer;
  
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
      className="md:rounded-2xl md:border-2 md:border-primary/10 md:bg-card md:p-6 md:shadow-soft md:hover:shadow-medium md:hover:border-primary/20 transition-all duration-300"
      style={{ contain: 'layout style paint' }}
      role="search"
      aria-label={t('filters.searchLabel')}
    >
      {/* Mobile trigger - Hidden when drawer is managed externally */}
      {externalShowDrawer === undefined && (
        <div className="flex items-center justify-center md:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAdvancedDrawer(true)}
            className="relative h-11 w-11 rounded-full border-primary/30 shadow-soft"
            aria-label={t('filters.advancedFilters')}
            aria-haspopup="dialog"
          >
            <Filter className="h-5 w-5" aria-hidden="true" />
            {filterCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={prefersReducedMotion ? { duration: 0 } : getMotionScaleTransition('small', true)}
                className="absolute -top-1 -end-1 flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-xs font-semibold leading-none text-primary-foreground shadow-md z-10"
                style={{
                  background: 'radial-gradient(ellipse at center, oklch(0.7 0.12 15) 0%, oklch(0.7 0.12 15) 40%, transparent 70%)',
                }}
              >
                {filterCount}
              </motion.span>
            )}
          </Button>
        </div>
      )}

      <div className="hidden md:flex md:flex-col gap-3">
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
        <motion.div variants={staggerItem} className="w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedDrawer(true)}
            className="h-9 w-full whitespace-nowrap"
            aria-label={t('filters.advancedFilters')}
          >
            <Settings2 className="h-4 w-4 me-2" aria-hidden="true" />
            {t('filters.advanced')}
            {filterCount > 0 && (
              <span className="ms-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold leading-none">
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
              className="w-full"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={SPRING.gentle}
              >
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="w-full whitespace-nowrap"
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
      <div className="hidden md:block">
        <FilterChips />
      </div>

      {/* Advanced Filter Drawer */}
      <AdvancedFiltersDrawer
        isOpen={showAdvancedDrawer}
        onClose={() => setShowAdvancedDrawer(false)}
      />
    </motion.div>
  );
}
