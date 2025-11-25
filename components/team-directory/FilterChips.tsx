'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { SPRING, getMotionScaleTransition } from '@/lib/animations';
import { tokens } from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function FilterChips() {
  const t = useTranslations('teamDirectory');
  const prefersReducedMotion = useReducedMotion();
  const searchTerm = useTeamDirectoryStore((state) => state.searchTerm);
  const selectedRole = useTeamDirectoryStore((state) => state.selectedRole);
  const sortBy = useTeamDirectoryStore((state) => state.sortBy);
  const sortOrder = useTeamDirectoryStore((state) => state.sortOrder);
  const setSearchTerm = useTeamDirectoryStore((state) => state.setSearchTerm);
  const setSelectedRole = useTeamDirectoryStore((state) => state.setSelectedRole);
  const setSorting = useTeamDirectoryStore((state) => state.setSorting);

  const hasActiveFilters = searchTerm || selectedRole || sortBy;

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (!hasActiveFilters) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : getMotionScaleTransition('medium')}
        className="mt-3 pt-3 border-t flex flex-wrap items-center gap-2 text-sm overflow-hidden"
      >
        <span className="text-muted-foreground font-medium text-xs">Active:</span>
        {searchTerm && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={prefersReducedMotion ? { duration: 0 } : getMotionScaleTransition('small', true)}
            whileHover={{ scale: 1.05, y: -2 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-rose-lavender/10 border border-primary/20 hover:bg-gradient-rose-lavender/20 hover:border-primary/40 hover:shadow-medium transition-all duration-300 shadow-soft text-xs relative overflow-hidden group/chip"
            role="button"
            tabIndex={0}
            aria-label={`Search filter: ${searchTerm}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/chip:translate-x-full transition-transform duration-1000 ease-in-out" />
            <Search className="h-3 w-3 relative z-10" aria-hidden="true" />
            <span className="truncate max-w-[120px] relative z-10">&quot;{searchTerm}&quot;</span>
            <motion.button
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClearSearch}
              className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full transition-colors -me-1 relative z-10"
              aria-label={`Remove search filter: ${searchTerm}`}
            >
              <X className="h-3 w-3" />
            </motion.button>
          </motion.span>
        )}
        {selectedRole && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={prefersReducedMotion ? { duration: 0 } : { ...getMotionScaleTransition('small', true), delay: tokens.motion.stagger.normal }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-rose-lavender/10 border border-primary/20 hover:bg-gradient-rose-lavender/20 hover:border-primary/40 hover:shadow-medium transition-all duration-300 shadow-soft text-xs relative overflow-hidden group/chip"
            role="button"
            tabIndex={0}
            aria-label={`Role filter: ${selectedRole}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/chip:translate-x-full transition-transform duration-1000 ease-in-out" />
            <Filter className="h-3 w-3 relative z-10" aria-hidden="true" />
            <span className="relative z-10">{selectedRole}</span>
            <motion.button
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedRole(null)}
              className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full transition-colors -me-1 relative z-10"
              aria-label={`Remove role filter: ${selectedRole}`}
            >
              <X className="h-3 w-3" />
            </motion.button>
          </motion.span>
        )}
        {sortBy && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={prefersReducedMotion ? { duration: 0 } : { ...getMotionScaleTransition('small', true), delay: tokens.motion.stagger.relaxed }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-rose-lavender/10 border border-primary/20 hover:bg-gradient-rose-lavender/20 hover:border-primary/40 hover:shadow-medium transition-all duration-300 shadow-soft text-xs relative overflow-hidden group/chip"
            role="button"
            tabIndex={0}
            aria-label={`Sort filter: ${sortBy} ${sortOrder}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/chip:translate-x-full transition-transform duration-1000 ease-in-out" />
            <ArrowUpDown className="h-3 w-3 relative z-10" aria-hidden="true" />
            <span className="capitalize relative z-10">{sortBy}</span>
            {sortOrder === 'asc' ? (
              <ArrowUp className="h-3 w-3 relative z-10" aria-hidden="true" />
            ) : (
              <ArrowDown className="h-3 w-3 relative z-10" aria-hidden="true" />
            )}
            <motion.button
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSorting(null, 'asc')}
              className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full transition-colors -me-1 relative z-10"
              aria-label={`Remove sort: ${sortBy} ${sortOrder}`}
            >
              <X className="h-3 w-3" />
            </motion.button>
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

