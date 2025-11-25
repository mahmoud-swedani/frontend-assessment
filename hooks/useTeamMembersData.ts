/**
 * Unified hook for team members data
 * Conditionally uses mock or real API based on environment variable
 * 
 * This hook follows React's Rules of Hooks by always calling both hooks
 * unconditionally. The real API hook uses Apollo's `skip` option, and the
 * mock hook uses an internal skip flag to prevent unnecessary work.
 */

import { useTeamMembers } from './useTeamMembers';
import { useTeamMembersMock } from './useTeamMembersMock';
import { config } from '@/lib/config';

/**
 * Unified hook that conditionally uses mock or real API
 * 
 * Both hooks are always called to follow Rules of Hooks:
 * - useTeamMembers: Uses Apollo's `skip` option when mock API is enabled
 * - useTeamMembersMock: Uses internal skip flag when real API is enabled
 * 
 * This ensures React's hook order is consistent across renders.
 */
export function useTeamMembersData() {
  // Always call both hooks to follow Rules of Hooks
  const realApiResult = useTeamMembers();
  const mockApiResult = useTeamMembersMock();

  // Return the appropriate result based on configuration
  return config.useMockApi ? mockApiResult : realApiResult;
}

