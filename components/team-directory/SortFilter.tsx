'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { delicatePulse, filterFeedback, highlightPulse, SPRING } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface SortFilterProps {
  className?: string;
}

export function SortFilter({ className }: SortFilterProps) {
  const sortBy = useTeamDirectoryStore((state) => state.sortBy);
  const sortOrder = useTeamDirectoryStore((state) => state.sortOrder);
  const setSorting = useTeamDirectoryStore((state) => state.setSorting);

  const getSortDisplayValue = useCallback(() => {
    if (!sortBy) return 'none';
    return `${sortBy}-${sortOrder}`;
  }, [sortBy, sortOrder]);

  return (
    <motion.div
      variants={delicatePulse}
      className={cn('relative', className)}
    >
      <motion.div
        animate={sortBy ? "animate" : undefined}
        variants={delicatePulse}
        transition={SPRING.gentle}
        className="absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowUpDown className="h-4 w-4 text-primary transition-colors" aria-hidden="true" />
        </motion.div>
      </motion.div>
      <motion.div
        animate={sortBy ? "animate" : "initial"}
        variants={filterFeedback}
        className="relative"
      >
        <Select
          value={getSortDisplayValue()}
          onValueChange={(value) => {
            if (value === 'none') {
              setSorting(null, 'asc');
            } else {
              const [sortField, sortDir] = value.split('-');
              setSorting(sortField as 'name' | 'role', sortDir as 'asc' | 'desc');
            }
          }}
        >
          <SelectTrigger
            className={cn(
              'h-9 w-full sm:w-[200px] md:w-full ps-11 transition-all duration-300 text-sm',
              sortBy && 'border-primary/60 shadow-rose'
            )}
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
        {sortBy && (
          <motion.div
            variants={highlightPulse}
            animate="animate"
            className="absolute inset-0 rounded-md pointer-events-none"
            style={{ zIndex: -1 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

