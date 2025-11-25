import type { TeamMemberRole } from '@/types/teamDirectory';

export const ROLE_COLORS: Record<TeamMemberRole, string> = {
  Admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Agent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Creator: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

