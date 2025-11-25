import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTeamMembersData } from '@/hooks/useTeamMembersData';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useTeamMembersMock } from '@/hooks/useTeamMembersMock';
import { config } from '@/lib/config';

// Mock dependencies
vi.mock('@/hooks/useTeamMembers');
vi.mock('@/hooks/useTeamMembersMock');
vi.mock('@/lib/config', () => ({
  config: {
    useMockApi: true,
  },
}));

describe('useTeamMembersData', () => {
  const mockRealApiResult = {
    data: { teamMembers: { data: [], pagination: null } },
    loading: false,
    error: null,
    refetch: vi.fn(),
  };

  const mockMockApiResult = {
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTeamMembers as any).mockReturnValue(mockRealApiResult);
    (useTeamMembersMock as any).mockReturnValue(mockMockApiResult);
  });

  it('should return mock API result when useMockApi is true', () => {
    (config as any).useMockApi = true;
    
    const { result } = renderHook(() => useTeamMembersData());

    expect(result.current).toEqual(mockMockApiResult);
  });

  it('should return real API result when useMockApi is false', () => {
    (config as any).useMockApi = false;
    
    const { result } = renderHook(() => useTeamMembersData());

    expect(result.current).toEqual(mockRealApiResult);
  });

  it('should call both hooks to follow Rules of Hooks', () => {
    renderHook(() => useTeamMembersData());

    expect(useTeamMembers).toHaveBeenCalled();
    expect(useTeamMembersMock).toHaveBeenCalled();
  });
});