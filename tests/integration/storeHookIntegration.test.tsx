import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { useDebounce } from '@/hooks/useDebounce';
import type { TeamMember, TeamMemberRole } from '@/types/teamDirectory';

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value, // Return immediately for testing
}));

describe('Store + Hook Integration', () => {
  beforeEach(() => {
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

  it('should update store when search term changes', async () => {
    const { rerender } = renderHook(() => {
      const searchTerm = useTeamDirectoryStore((state) => state.searchTerm);
      const debounced = useDebounce(searchTerm, 300);
      const setSearchTerm = useTeamDirectoryStore((state) => state.setSearchTerm);
      
      // Simulate setting search term
      if (debounced && debounced !== searchTerm) {
        setSearchTerm(debounced);
      }
      
      return { searchTerm, debounced };
    });

    // Wrap store update and rerender in act()
    await act(async () => {
      useTeamDirectoryStore.getState().setSearchTerm('test');
      rerender(); // Triggers effect above which calls setSearchTerm again
    });

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.searchTerm).toBe('test');
      expect(state.currentPage).toBe(1); // Should reset to page 1
    });
  });

  it('should reset page when filters change', () => {
    useTeamDirectoryStore.getState().setCurrentPage(5);
    useTeamDirectoryStore.getState().setSelectedRole('Admin');

    const state = useTeamDirectoryStore.getState();
    expect(state.currentPage).toBe(1);
    expect(state.selectedRole).toBe('Admin');
  });

  it('should clear team members when filters change', () => {
    useTeamDirectoryStore.getState().setTeamMembers(
      [{ id: '1', name: 'Test', email: 'test@example.com', role: 'Admin', avatar: null }],
      { currentPage: 1, totalPages: 1, totalCount: 1, hasNextPage: false }
    );

    useTeamDirectoryStore.getState().setSearchTerm('new search');

    const state = useTeamDirectoryStore.getState();
    expect(state.teamMembers).toEqual([]);
  });

  it('should maintain filter state across view mode changes', () => {
    useTeamDirectoryStore.getState().setSearchTerm('test');
    useTeamDirectoryStore.getState().setSelectedRole('Admin');
    useTeamDirectoryStore.getState().setViewMode('grid');

    const state = useTeamDirectoryStore.getState();
    expect(state.viewMode).toBe('grid');
    expect(state.searchTerm).toBe('test');
    expect(state.selectedRole).toBe('Admin');
  });

  it('should reset pagination when page size changes', () => {
    useTeamDirectoryStore.getState().setCurrentPage(5);
    useTeamDirectoryStore.getState().setPageSize(20);

    const state = useTeamDirectoryStore.getState();
    expect(state.pageSize).toBe(20);
    expect(state.currentPage).toBe(1);
  });

  it('should update pagination when members are set', () => {
    const members: TeamMember[] = [
      { id: '1', name: 'Test 1', email: 'test1@example.com', role: 'Admin' as TeamMemberRole, avatar: null },
      { id: '2', name: 'Test 2', email: 'test2@example.com', role: 'Agent' as TeamMemberRole, avatar: null },
    ];

    const pagination = {
      currentPage: 1,
      totalPages: 5,
      totalCount: 50,
      hasNextPage: true,
    };

    useTeamDirectoryStore.getState().setTeamMembers(members, pagination);

    const state = useTeamDirectoryStore.getState();
    expect(state.teamMembers).toEqual(members);
    expect(state.pagination).toEqual(pagination);
    expect(state.totalCount).toBe(50);
  });

  it('should handle multiple filter combinations', () => {
    useTeamDirectoryStore.getState().setSearchTerm('john');
    useTeamDirectoryStore.getState().setSelectedRole('Admin');
    useTeamDirectoryStore.getState().setSorting('name', 'desc');
    useTeamDirectoryStore.getState().setCurrentPage(2);

    const state = useTeamDirectoryStore.getState();
    expect(state.searchTerm).toBe('john');
    expect(state.selectedRole).toBe('Admin');
    expect(state.sortBy).toBe('name');
    expect(state.sortOrder).toBe('desc');
    expect(state.currentPage).toBe(2);
  });

  it('should clear all filters correctly', () => {
    useTeamDirectoryStore.getState().setSearchTerm('test');
    useTeamDirectoryStore.getState().setSelectedRole('Admin');
    useTeamDirectoryStore.getState().setSorting('name', 'desc');
    useTeamDirectoryStore.getState().setCurrentPage(5);

    useTeamDirectoryStore.getState().clearFilters();

    const state = useTeamDirectoryStore.getState();
    expect(state.searchTerm).toBe('');
    expect(state.selectedRole).toBeNull();
    expect(state.sortBy).toBeNull();
    expect(state.sortOrder).toBe('asc');
    expect(state.currentPage).toBe(1);
  });
});
