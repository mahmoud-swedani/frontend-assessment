'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { delicatePulse, filterFeedback, highlightPulse, SPRING } from '@/lib/animations';
import { cn } from '@/lib/utils';

const MAX_SEARCH_LENGTH = 100;

/**
 * Sanitizes and validates search input
 */
const sanitizeSearchInput = (value: string): string => {
  let sanitized = value
    .replace(/[<>\"'&]/g, '')
    .trim();
  
  if (sanitized.length > MAX_SEARCH_LENGTH) {
    sanitized = sanitized.substring(0, MAX_SEARCH_LENGTH);
  }
  
  return sanitized;
};

interface SearchInputProps {
  className?: string;
}

export function SearchInput({ className }: SearchInputProps) {
  const t = useTranslations('teamDirectory');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const searchTerm = useTeamDirectoryStore((state) => state.searchTerm);
  const setSearchTerm = useTeamDirectoryStore((state) => state.setSearchTerm);
  
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);
  
  // Sync localSearchTerm with store when store changes (e.g., from URL params or external updates)
  // This ensures the input reflects the store state, but we only sync if it's different
  // to avoid interfering with user typing
  useEffect(() => {
    // Only sync if store changed externally (not from our debounce)
    // We check if the store value is different from both local and debounced to avoid loops
    if (searchTerm !== localSearchTerm && searchTerm !== debouncedSearchTerm) {
      setLocalSearchTerm(searchTerm);
    }
  }, [searchTerm]); // Only depend on searchTerm to avoid infinite loops
  
  // Update store when debounced value changes
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  // Keyboard shortcut: Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitized = sanitizeSearchInput(rawValue);
    setLocalSearchTerm(sanitized);
  };

  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm('');
    searchInputRef.current?.focus();
  }, []);

  return (
    <motion.div
      variants={delicatePulse}
      className={cn('flex-1 relative', className)}
    >
      <motion.div
        animate={localSearchTerm ? "animate" : undefined}
        variants={delicatePulse}
        transition={SPRING.gentle}
        className="absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}
        >
          <Search className="h-4 w-4 text-primary transition-colors" aria-hidden="true" />
        </motion.div>
      </motion.div>
      <motion.div
        animate={localSearchTerm ? "animate" : "initial"}
        variants={filterFeedback}
        className="relative"
      >
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={t('filters.searchPlaceholder')}
          value={localSearchTerm}
          onChange={handleSearchChange}
          maxLength={MAX_SEARCH_LENGTH}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleClearSearch();
            }
          }}
          className={cn(
            'h-9 ps-11 transition-all duration-300 text-sm',
            localSearchTerm && 'pe-11 border-primary/60 shadow-rose',
            !localSearchTerm && 'md:pe-24',
            'w-full focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:scale-[1.01]'
          )}
          aria-label={t('filters.searchLabel')}
          aria-describedby="search-description"
        />
        {localSearchTerm && (
          <motion.div
            variants={highlightPulse}
            animate="animate"
            className="absolute inset-0 rounded-md pointer-events-none"
            style={{ zIndex: -1 }}
          />
        )}
      </motion.div>
      {/* Keyboard shortcut hint */}
      <AnimatePresence>
        {!localSearchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none hidden md:flex items-center gap-1 text-xs text-muted-foreground"
          >
            <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-xs font-mono">
              {typeof window !== 'undefined' && navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-xs font-mono">
              K
            </kbd>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {localSearchTerm && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={SPRING.bouncy}
            type="button"
            onClick={handleClearSearch}
            className="absolute end-3 top-1/2 -translate-y-1/2 rounded-sm p-1 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={t('filters.clearSearch')}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
      <span id="search-description" className="sr-only">
        {t('filters.searchDescription')}
      </span>
    </motion.div>
  );
}

