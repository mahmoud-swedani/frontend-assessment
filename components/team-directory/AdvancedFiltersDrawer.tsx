'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RoleSelect } from './RoleSelect';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { drawerSlide, modalBackdrop, staggerContainer, staggerItem, SPRING } from '@/lib/animations';
import { useFocusManagement } from '@/hooks/useAccessibility';
import type { TeamMemberRole } from '@/types/teamDirectory';

const MAX_SEARCH_LENGTH = 100;

const sanitizeSearchInput = (value: string): string => {
  let sanitized = value
    .replace(/[<>\"'&]/g, '')
    .trim();
  
  if (sanitized.length > MAX_SEARCH_LENGTH) {
    sanitized = sanitized.substring(0, MAX_SEARCH_LENGTH);
  }
  
  return sanitized;
};

const getSortLabel = (value: string) => {
  switch (value) {
    case 'name-asc':
      return 'Name (A-Z)';
    case 'name-desc':
      return 'Name (Z-A)';
    case 'role-asc':
      return 'Role (A-Z)';
    case 'role-desc':
      return 'Role (Z-A)';
    default:
      return 'None';
  }
};

interface AdvancedFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedFiltersDrawer({ isOpen, onClose }: AdvancedFiltersDrawerProps) {
  const t = useTranslations('teamDirectory');
  const drawerRef = useRef<HTMLDivElement>(null);
  const { trapFocus } = useFocusManagement();
  
  const searchTerm = useTeamDirectoryStore((state) => state.searchTerm);
  const selectedRole = useTeamDirectoryStore((state) => state.selectedRole);
  const sortBy = useTeamDirectoryStore((state) => state.sortBy);
  const sortOrder = useTeamDirectoryStore((state) => state.sortOrder);
  const setSearchTerm = useTeamDirectoryStore((state) => state.setSearchTerm);
  const setSelectedRole = useTeamDirectoryStore((state) => state.setSelectedRole);
  const setSorting = useTeamDirectoryStore((state) => state.setSorting);

  const [localDrawerSearchTerm, setLocalDrawerSearchTerm] = useState(searchTerm);
  const [localDrawerRole, setLocalDrawerRole] = useState<string>(selectedRole || 'all');
  const [localDrawerSort, setLocalDrawerSort] = useState<string>(() => {
    if (sortBy && sortOrder) {
      return `${sortBy}-${sortOrder}`;
    }
    return 'none';
  });

  // Initialize drawer state when it opens
  useEffect(() => {
    if (isOpen) {
      setLocalDrawerSearchTerm(searchTerm);
      setLocalDrawerRole(selectedRole || 'all');
      if (sortBy && sortOrder) {
        setLocalDrawerSort(`${sortBy}-${sortOrder}`);
      } else {
        setLocalDrawerSort('none');
      }
    }
  }, [isOpen, searchTerm, selectedRole, sortBy, sortOrder]);

  // Focus trap when drawer is open
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      return trapFocus(drawerRef.current);
    }
    return undefined;
  }, [isOpen, trapFocus]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleApplyDrawerFilters = useCallback(() => {
    setSearchTerm(localDrawerSearchTerm);
    setSelectedRole(localDrawerRole === 'all' ? null : (localDrawerRole as TeamMemberRole));
    if (localDrawerSort === 'none') {
      setSorting(null, 'asc');
    } else {
      const [sortField, sortDir] = localDrawerSort.split('-');
      setSorting(sortField as 'name' | 'role', sortDir as 'asc' | 'desc');
    }
    onClose();
  }, [localDrawerSearchTerm, localDrawerRole, localDrawerSort, setSearchTerm, setSelectedRole, setSorting, onClose]);
  
  const handleClearDrawerFilters = useCallback(() => {
    setLocalDrawerSearchTerm('');
    setLocalDrawerRole('all');
    setLocalDrawerSort('none');
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalBackdrop}
            className="fixed inset-0 bg-background/80 z-[60]"
            style={{ backdropFilter: 'blur(16px)' }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={drawerRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={drawerSlide}
            className="fixed end-0 top-0 h-full w-full max-w-md bg-card border-s-2 border-primary/10 shadow-large z-[70] p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={t('filters.advancedFilters')}
            onClick={(e) => e.stopPropagation()}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div 
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold">{t('filters.advancedFilters')}</h2>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING.bouncy}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  aria-label={t('filters.closeAdvanced')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                variants={staggerItem}
                className="focus-within:scale-[1.01] transition-transform duration-300"
              >
                <label className="text-sm font-medium mb-2 block" htmlFor="drawer-search">
                  {t('filters.searchLabel')}
                </label>
                <Input
                  id="drawer-search"
                  type="text"
                  placeholder={t('filters.searchPlaceholder')}
                  value={localDrawerSearchTerm}
                  onChange={(e) => {
                    const sanitized = sanitizeSearchInput(e.target.value);
                    setLocalDrawerSearchTerm(sanitized);
                  }}
                  maxLength={MAX_SEARCH_LENGTH}
                  className="h-9 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60 transition-all"
                />
              </motion.div>
              
              <motion.div
                variants={staggerItem}
                className="focus-within:scale-[1.01] transition-transform duration-300"
              >
                <label className="text-sm font-medium mb-2 block" htmlFor="drawer-role">
                  {t('filters.roleFilter')}
                </label>
                <div id="drawer-role">
                  <RoleSelect
                    value={localDrawerRole}
                    onValueChange={(value) => setLocalDrawerRole(value)}
                    className="h-9 w-full focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60 transition-all"
                    ariaLabel={t('filters.roleFilter')}
                    placeholder={t('filters.roleFilter')}
                    allRolesLabel={t('filters.allRoles')}
                  />
                </div>
              </motion.div>
              
              <motion.div
                variants={staggerItem}
                className="focus-within:scale-[1.01] transition-transform duration-300"
              >
                <label className="text-sm font-medium mb-2 block" htmlFor="drawer-sort">
                  Sort by
                </label>
                <Select
                  value={localDrawerSort}
                  onValueChange={(value) => setLocalDrawerSort(value)}
                >
                  <SelectTrigger 
                    id="drawer-sort"
                    className="h-9 w-full focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60 transition-all" 
                    aria-label="Sort by"
                  >
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="role-asc">Role (A-Z)</SelectItem>
                    <SelectItem value="role-desc">Role (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
              
              {/* Active Filters Display */}
              {(localDrawerSearchTerm || (localDrawerRole && localDrawerRole !== 'all') || (localDrawerSort && localDrawerSort !== 'none')) && (
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2 text-muted-foreground">
                    {t('filters.activeFilters')}:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {localDrawerSearchTerm && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-rose-lavender/10 border border-primary/20 text-xs">
                        Search: &quot;{localDrawerSearchTerm}&quot;
                      </span>
                    )}
                    {localDrawerRole && localDrawerRole !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-rose-lavender/10 border border-primary/20 text-xs">
                        Role: {localDrawerRole}
                      </span>
                    )}
                    {localDrawerSort && localDrawerSort !== 'none' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-rose-lavender/10 border border-primary/20 text-xs">
                        Sort: {getSortLabel(localDrawerSort)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <motion.div 
                className="flex gap-2 pt-4 border-t"
                variants={staggerItem}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING.gentle}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    onClick={handleClearDrawerFilters}
                    className="w-full"
                  >
                    {t('filters.clearFilters')}
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING.gentle}
                  className="flex-1"
                >
                  <Button
                    onClick={handleApplyDrawerFilters}
                    className="w-full"
                  >
                    {t('filters.apply')}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

