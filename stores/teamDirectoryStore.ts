import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { TeamMember, TeamMemberRole, PaginationInfo } from '@/types/teamDirectory';

interface TeamDirectoryState {
  // Data
  teamMembers: TeamMember[];
  totalCount: number;
  pagination: PaginationInfo | null;
  
  // Filters
  searchTerm: string;
  selectedRole: TeamMemberRole | null;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  
  // Sorting
  sortBy: 'name' | 'role' | null;
  sortOrder: 'asc' | 'desc';
  
  // UI State
  isLoading: boolean;
  error: string | null;
  viewMode: 'table' | 'grid';
  
  // Actions
  setTeamMembers: (members: TeamMember[], pagination: PaginationInfo) => void;
  appendTeamMembers: (members: TeamMember[], pagination: PaginationInfo) => void;
  setSearchTerm: (term: string) => void;
  setSelectedRole: (role: TeamMemberRole | null) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSorting: (sortBy: 'name' | 'role' | null, sortOrder: 'asc' | 'desc') => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setViewMode: (mode: 'table' | 'grid') => void;
}

export const useTeamDirectoryStore = create<TeamDirectoryState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
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
        
        // Actions
        setTeamMembers: (members, pagination) =>
          set({ teamMembers: members, pagination, totalCount: pagination.totalCount }),
        appendTeamMembers: (members, pagination) =>
          set((state) => {
            // Create a Set of existing member IDs for O(1) lookup
            const existingIds = new Set(state.teamMembers.map(m => m.id));
            // Filter out any members that already exist (deduplicate)
            const newMembers = members.filter(m => !existingIds.has(m.id));
            return {
              teamMembers: [...state.teamMembers, ...newMembers],
              pagination,
              totalCount: pagination.totalCount,
            };
          }),
        setSearchTerm: (term) => set({ 
          searchTerm: term, 
          currentPage: 1,
          teamMembers: [], // Clear old data to prevent stale data display
          isLoading: true, // Show loading state immediately
        }),
        setSelectedRole: (role) => set({ 
          selectedRole: role, 
          currentPage: 1,
          teamMembers: [], // Clear old data to prevent stale data display
          isLoading: true, // Show loading state immediately
        }),
        setCurrentPage: (page) => set({ currentPage: page }),
        setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),
        setSorting: (sortBy, sortOrder) =>
          set({ sortBy, sortOrder, currentPage: 1 }),
        clearFilters: () =>
          set({
            searchTerm: '',
            selectedRole: null,
            currentPage: 1,
            sortBy: null,
            sortOrder: 'asc',
          }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setViewMode: (mode) => set((state) => {
          // Reset to page 1 and clear members when switching views
          if (state.viewMode !== mode) {
            return { viewMode: mode, currentPage: 1, teamMembers: [] };
          }
          return { viewMode: mode };
        }),
      }),
      {
        name: 'team-directory-storage',
        partialize: (state) => ({
          viewMode: state.viewMode,
          pageSize: state.pageSize,
        }),
      }
    ),
    { name: 'TeamDirectoryStore' }
  )
);

