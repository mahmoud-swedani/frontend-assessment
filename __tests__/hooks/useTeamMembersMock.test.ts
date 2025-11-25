import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTeamMembersMock } from '@/hooks/useTeamMembersMock';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import * as configModule from '@/lib/config';
import * as mockDataModule from '@/utils/generateMockData';

// Mock the config module
vi.mock('@/lib/config', () => ({
  config: {
    useMockApi: true,
  },
}));

// Mock generateMockData
vi.mock('@/utils/generateMockData', () => ({
  generateMockTeamMembers: vi.fn(() => [
    { id: '1', name: 'John Admin', email: 'john@example.com', role: 'Admin', avatar: null },
    { id: '2', name: 'Jane Agent', email: 'jane@example.com', role: 'Agent', avatar: null },
    { id: '3', name: 'Bob Creator', email: 'bob@example.com', role: 'Creator', avatar: null },
    { id: '4', name: 'Alice Admin', email: 'alice@example.com', role: 'Admin', avatar: null },
    { id: '5', name: 'Charlie Agent', email: 'charlie@example.com', role: 'Agent', avatar: null },
  ]),
}));

describe('useTeamMembersMock', () => {
  beforeEach(() => {
    // Reset store
    useTeamDirectoryStore.setState({
      teamMembers: [],
      totalCount: 0,
      pagination: null,
      searchTerm: '',
      selectedRole: null,
      currentPage: 1,
      pageSize: 10,
      sortBy: null,
      sortOrder: 'asc',
      isLoading: false,
      error: null,
      viewMode: 'table',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return loading true initially when using mock API', () => {
    const { result } = renderHook(() => useTeamMembersMock());

    // Hook starts with loading: true, then loads data after delay
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should load mock data after delay', async () => {
    renderHook(() => useTeamMembersMock());

    // Hook uses setTimeout(..., 0), so wait for React to process the update
    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.teamMembers.length).toBeGreaterThan(0);
      expect(state.isLoading).toBe(false);
    }, { timeout: 2000 });
  });

  it('should filter by role', async () => {
    await act(async () => {
      useTeamDirectoryStore.getState().setSelectedRole('Admin');
    });

    renderHook(() => useTeamMembersMock());

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.teamMembers.length).toBeGreaterThan(0);
      expect(state.teamMembers.every((m) => m.role === 'Admin')).toBe(true);
    }, { timeout: 2000 });
  });

  it('should filter by search term', async () => {
    await act(async () => {
      useTeamDirectoryStore.getState().setSearchTerm('john');
    });

    renderHook(() => useTeamMembersMock());

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.teamMembers.length).toBeGreaterThan(0);
      expect(state.teamMembers.every((m) => 
        m.name.toLowerCase().includes('john') || 
        m.email.toLowerCase().includes('john')
      )).toBe(true);
    }, { timeout: 2000 });
  });

  it('should combine role and search filters', async () => {
    await act(async () => {
      useTeamDirectoryStore.getState().setSelectedRole('Admin');
      useTeamDirectoryStore.getState().setSearchTerm('john');
    });

    renderHook(() => useTeamMembersMock());

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      const members = state.teamMembers;
      expect(members.length).toBeGreaterThan(0);
      expect(members.every((m) => m.role === 'Admin')).toBe(true);
      expect(members.every((m) => 
        m.name.toLowerCase().includes('john') || 
        m.email.toLowerCase().includes('john')
      )).toBe(true);
    }, { timeout: 2000 });
  });

  it('should sort by name', async () => {
    await act(async () => {
      useTeamDirectoryStore.getState().setSorting('name', 'asc');
    });

    renderHook(() => useTeamMembersMock());

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      const members = state.teamMembers;
      expect(members.length).toBeGreaterThan(0);
      if (members.length > 1) {
        expect(members[0]?.name.localeCompare(members[1]?.name ?? '')).toBeLessThanOrEqual(0);
      }
    }, { timeout: 2000 });
  });

  it('should sort by role descending', async () => {
    await act(async () => {
      useTeamDirectoryStore.getState().setSorting('role', 'desc');
    });

    renderHook(() => useTeamMembersMock());

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      const members = state.teamMembers;
      expect(members.length).toBeGreaterThan(0);
      if (members.length > 1) {
        expect(members[0]?.role.localeCompare(members[1]?.role ?? '')).toBeGreaterThanOrEqual(0);
      }
    }, { timeout: 2000 });
  });

  it('should paginate data', async () => {
    await act(async () => {
      useTeamDirectoryStore.getState().setCurrentPage(1);
      useTeamDirectoryStore.getState().setPageSize(2);
    });

    renderHook(() => useTeamMembersMock());

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.teamMembers.length).toBeLessThanOrEqual(2);
      expect(state.pagination?.currentPage).toBe(1);
    }, { timeout: 2000 });
  });

  it('should append members in grid view when loading more', async () => {
    await act(async () => {
      useTeamDirectoryStore.getState().setViewMode('grid');
      useTeamDirectoryStore.getState().setPageSize(2);
    });

    // Load first page - hook renders inside renderHook which handles act()
    const { rerender } = renderHook(() => useTeamMembersMock());

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.teamMembers.length).toBe(2);
    }, { timeout: 2000 });

    // Load second page - wrap state update and rerender in act()
    await act(async () => {
      useTeamDirectoryStore.getState().setCurrentPage(2);
      rerender(); // Re-run hook with updated state
    });

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.teamMembers.length).toBe(4); // Should append
    }, { timeout: 2000 });
  });

  it('should skip work when mock API is disabled', () => {
    vi.spyOn(configModule, 'config', 'get').mockReturnValue({
      useMockApi: false,
      graphqlEndpoint: '/api/graphql',
    } as any);

    const { result } = renderHook(() => useTeamMembersMock());

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('should provide refetch function', async () => {
    const { result } = renderHook(() => useTeamMembersMock());

    expect(typeof result.current.refetch).toBe('function');

    // Wait for initial load
    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.teamMembers.length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    const initialCount = useTeamDirectoryStore.getState().teamMembers.length;

    // Wrap refetch call in act() since it triggers state updates
    let refetchPromise: Promise<any>;
    await act(async () => {
      refetchPromise = result.current.refetch();
      expect(refetchPromise).toBeInstanceOf(Promise);
    });

    // Wait for refetch to complete (state updates happen in setTimeout callback)
    await act(async () => {
      await refetchPromise!;
    });

    // Should have triggered a refetch (data should still be present)
    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.teamMembers.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });
});
