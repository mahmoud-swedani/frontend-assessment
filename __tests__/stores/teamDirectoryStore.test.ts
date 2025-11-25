import { describe, it, expect, beforeEach } from 'vitest';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import type { TeamMember, TeamMemberRole, PaginationInfo } from '@/types/teamDirectory';

describe('teamDirectoryStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
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

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const state = useTeamDirectoryStore.getState();

      expect(state.teamMembers).toEqual([]);
      expect(state.totalCount).toBe(0);
      expect(state.pagination).toBeNull();
      expect(state.searchTerm).toBe('');
      expect(state.selectedRole).toBeNull();
      expect(state.currentPage).toBe(1);
      expect(state.pageSize).toBe(10);
      expect(state.sortBy).toBeNull();
      expect(state.sortOrder).toBe('asc');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.viewMode).toBe('table');
    });
  });

  describe('setTeamMembers', () => {
    it('should set team members and pagination', () => {
      const members: TeamMember[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: null },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Agent', avatar: null },
      ];

      const pagination: PaginationInfo = {
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
  });

  describe('appendTeamMembers', () => {
    it('should append new members to existing ones', () => {
      const initialMembers: TeamMember[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: null },
      ];

      const newMembers: TeamMember[] = [
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Agent', avatar: null },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Creator', avatar: null },
      ];

      const pagination: PaginationInfo = {
        currentPage: 2,
        totalPages: 5,
        totalCount: 50,
        hasNextPage: true,
      };

      useTeamDirectoryStore.getState().setTeamMembers(initialMembers, pagination);
      useTeamDirectoryStore.getState().appendTeamMembers(newMembers, pagination);

      const state = useTeamDirectoryStore.getState();
      expect(state.teamMembers).toHaveLength(3);
      expect(state.teamMembers[0]).toEqual(initialMembers[0]);
      expect(state.teamMembers[1]).toEqual(newMembers[0]);
      expect(state.teamMembers[2]).toEqual(newMembers[1]);
    });

    it('should not append duplicate members', () => {
      const members: TeamMember[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: null },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Agent', avatar: null },
      ];

      const pagination: PaginationInfo = {
        currentPage: 1,
        totalPages: 5,
        totalCount: 50,
        hasNextPage: true,
      };

      useTeamDirectoryStore.getState().setTeamMembers(members, pagination);
      
      // Try to append the same members
      useTeamDirectoryStore.getState().appendTeamMembers(members, pagination);

      const state = useTeamDirectoryStore.getState();
      expect(state.teamMembers).toHaveLength(2); // Should not duplicate
    });
  });

  describe('setSearchTerm', () => {
    it('should update search term and reset to page 1', () => {
      useTeamDirectoryStore.getState().setCurrentPage(3);
      useTeamDirectoryStore.getState().setTeamMembers(
        [{ id: '1', name: 'John', email: 'john@example.com', role: 'Admin', avatar: null }],
        { currentPage: 3, totalPages: 5, totalCount: 50, hasNextPage: true }
      );

      useTeamDirectoryStore.getState().setSearchTerm('john');

      const state = useTeamDirectoryStore.getState();
      expect(state.searchTerm).toBe('john');
      expect(state.currentPage).toBe(1);
      expect(state.teamMembers).toEqual([]); // Should clear old data
      expect(state.isLoading).toBe(true); // Should show loading
    });
  });

  describe('setSelectedRole', () => {
    it('should update selected role and reset to page 1', () => {
      useTeamDirectoryStore.getState().setCurrentPage(3);

      useTeamDirectoryStore.getState().setSelectedRole('Admin');

      const state = useTeamDirectoryStore.getState();
      expect(state.selectedRole).toBe('Admin');
      expect(state.currentPage).toBe(1);
      expect(state.teamMembers).toEqual([]); // Should clear old data
      expect(state.isLoading).toBe(true); // Should show loading
    });

    it('should allow setting role to null', () => {
      useTeamDirectoryStore.getState().setSelectedRole('Admin');
      useTeamDirectoryStore.getState().setSelectedRole(null);

      const state = useTeamDirectoryStore.getState();
      expect(state.selectedRole).toBeNull();
    });
  });

  describe('setCurrentPage', () => {
    it('should update current page', () => {
      useTeamDirectoryStore.getState().setCurrentPage(5);

      const state = useTeamDirectoryStore.getState();
      expect(state.currentPage).toBe(5);
    });
  });

  describe('setPageSize', () => {
    it('should update page size and reset to page 1', () => {
      useTeamDirectoryStore.getState().setCurrentPage(3);
      useTeamDirectoryStore.getState().setPageSize(20);

      const state = useTeamDirectoryStore.getState();
      expect(state.pageSize).toBe(20);
      expect(state.currentPage).toBe(1);
    });
  });

  describe('setSorting', () => {
    it('should update sort by and sort order', () => {
      useTeamDirectoryStore.getState().setSorting('name', 'desc');

      const state = useTeamDirectoryStore.getState();
      expect(state.sortBy).toBe('name');
      expect(state.sortOrder).toBe('desc');
      expect(state.currentPage).toBe(1);
    });

    it('should allow setting sortBy to null', () => {
      useTeamDirectoryStore.getState().setSorting('name', 'asc');
      useTeamDirectoryStore.getState().setSorting(null, 'asc');

      const state = useTeamDirectoryStore.getState();
      expect(state.sortBy).toBeNull();
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters to initial state', () => {
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

  describe('setLoading', () => {
    it('should update loading state', () => {
      useTeamDirectoryStore.getState().setLoading(true);

      expect(useTeamDirectoryStore.getState().isLoading).toBe(true);

      useTeamDirectoryStore.getState().setLoading(false);

      expect(useTeamDirectoryStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should update error state', () => {
      useTeamDirectoryStore.getState().setError('Network error');

      expect(useTeamDirectoryStore.getState().error).toBe('Network error');

      useTeamDirectoryStore.getState().setError(null);

      expect(useTeamDirectoryStore.getState().error).toBeNull();
    });
  });

  describe('setViewMode', () => {
    it('should update view mode', () => {
      useTeamDirectoryStore.getState().setViewMode('grid');

      expect(useTeamDirectoryStore.getState().viewMode).toBe('grid');
    });

    it('should reset to page 1 and clear members when switching views', () => {
      useTeamDirectoryStore.getState().setCurrentPage(3);
      useTeamDirectoryStore.getState().setTeamMembers(
        [{ id: '1', name: 'John', email: 'john@example.com', role: 'Admin', avatar: null }],
        { currentPage: 3, totalPages: 5, totalCount: 50, hasNextPage: true }
      );

      useTeamDirectoryStore.getState().setViewMode('grid');

      const state = useTeamDirectoryStore.getState();
      expect(state.viewMode).toBe('grid');
      expect(state.currentPage).toBe(1);
      expect(state.teamMembers).toEqual([]);
    });

    it('should not reset if switching to the same view mode', () => {
      useTeamDirectoryStore.getState().setCurrentPage(3);
      const members: TeamMember[] = [{ id: '1', name: 'John', email: 'john@example.com', role: 'Admin' as TeamMemberRole, avatar: null }];
      useTeamDirectoryStore.getState().setTeamMembers(
        members,
        { currentPage: 3, totalPages: 5, totalCount: 50, hasNextPage: true }
      );

      useTeamDirectoryStore.getState().setViewMode('table');

      const state = useTeamDirectoryStore.getState();
      expect(state.viewMode).toBe('table');
      expect(state.currentPage).toBe(3);
      expect(state.teamMembers).toEqual(members);
    });
  });
});
