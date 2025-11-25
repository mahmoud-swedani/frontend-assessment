'use client';

import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { RoleSelect } from './RoleSelect';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { delicatePulse, filterFeedback, highlightPulse, SPRING } from '@/lib/animations';
import { cn } from '@/lib/utils';
import type { TeamMemberRole } from '@/types/teamDirectory';

// Dynamically import RoleSelect with SSR disabled to prevent hydration mismatch
const DynamicRoleSelect = dynamic(
  () => import('./RoleSelect').then((mod) => ({ default: mod.RoleSelect })),
  {
    ssr: false,
    loading: () => (
      <div
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm'
        )}
        aria-label="Loading role filter"
      >
        <span className="text-muted-foreground">Filter by role</span>
        <svg
          className="h-4 w-4 opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    ),
  }
);

interface RoleFilterProps {
  className?: string;
}

export function RoleFilter({ className }: RoleFilterProps) {
  const t = useTranslations('teamDirectory');
  const selectedRole = useTeamDirectoryStore((state) => state.selectedRole);
  const setSelectedRole = useTeamDirectoryStore((state) => state.setSelectedRole);

  return (
    <motion.div
      variants={delicatePulse}
      className={cn('relative', className)}
    >
      <motion.div
        animate={selectedRole ? "animate" : undefined}
        variants={delicatePulse}
        transition={SPRING.gentle}
        className="absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}
        >
          <Filter className="h-4 w-4 text-primary transition-colors" aria-hidden="true" />
        </motion.div>
      </motion.div>
      <motion.div
        animate={selectedRole ? "animate" : "initial"}
        variants={filterFeedback}
        className="relative"
      >
        <DynamicRoleSelect
          value={selectedRole || 'all'}
          onValueChange={(value) => setSelectedRole(value === 'all' ? null : (value as TeamMemberRole))}
          className={cn(
            'h-9 w-full sm:w-[200px] md:w-full ps-11 transition-all duration-300 text-sm',
            selectedRole && 'border-primary/60 shadow-rose'
          )}
          ariaLabel={t('filters.roleFilter')}
          placeholder={t('filters.roleFilter')}
          allRolesLabel={t('filters.allRoles')}
        />
        {selectedRole && (
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

