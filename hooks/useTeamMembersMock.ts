import { useState, useEffect, useCallback } from 'react';
import type { ApolloQueryResult } from '@apollo/client';
import { generateMockTeamMembers } from '@/utils/generateMockData';
import type { TeamMembersResponse } from '@/types/teamDirectory';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { config } from '@/lib/config';

/**
 * Mock hook for team members data
 * 
 * This hook simulates API behavior for development/testing.
 * When config.useMockApi is false, this hook skips all work
 * to follow Rules of Hooks (both hooks must be called).
 */
export function useTeamMembersMock() {
  const [mockData] = useState(() => generateMockTeamMembers(100));
  const {
    currentPage,
    pageSize,
    searchTerm,
    selectedRole,
    sortBy,
    sortOrder,
    viewMode,
    teamMembers,
    setTeamMembers,
    appendTeamMembers,
    setLoading,
    setError,
  } = useTeamDirectoryStore();

  const [loading, setLocalLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Skip all work if not using mock API (follows Rules of Hooks)
  const shouldSkip = !config.useMockApi;

  // Refetch function that actually triggers a data refresh
  const refetch = useCallback((): Promise<ApolloQueryResult<TeamMembersResponse>> => {
    if (shouldSkip) {
      return Promise.resolve({
        data: null,
        loading: false,
        networkStatus: 7,
        partial: false,
      } as unknown as ApolloQueryResult<TeamMembersResponse>);
    }

    // Trigger refetch by updating state (this will cause the effect to re-run)
    setRefetchTrigger((prev) => prev + 1);
    
    // Return a promise that resolves after data is fetched
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: null,
          loading: false,
          networkStatus: 7,
          partial: false,
        } as unknown as ApolloQueryResult<TeamMembersResponse>);
      }, 500);
    });
  }, [shouldSkip]);

  useEffect(() => {
    // Skip if not using mock API
    if (shouldSkip) {
      setLocalLoading(false);
      return;
    }

    setLocalLoading(true);
    setLoading(true);

    // Simulate API delay
    const timer = setTimeout(() => {
      let filtered = [...mockData];

      // Filter by role (if selected)
      if (selectedRole) {
        filtered = filtered.filter((m) => m.role === selectedRole);
      }

      // Filter by search term (AND logic: both role and search filters are applied when active)
      // Only apply search filter if searchTerm is a non-empty string
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.trim().toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.name.toLowerCase().includes(searchLower) ||
            m.email.toLowerCase().includes(searchLower)
        );
      }

      // Sort
      if (sortBy) {
        filtered.sort((a, b) => {
          const aVal = a[sortBy];
          const bVal = b[sortBy];
          const comparison = aVal.localeCompare(bVal);
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      }

      // Check if this is a direct navigation to a page > 1 in grid view
      // (no existing members means user navigated directly to this page)
      const isDirectNavigation = teamMembers.length === 0 && currentPage > 1 && viewMode === 'grid';
      
      if (isDirectNavigation) {
        // Load all pages from 1 to currentPage
        const allMembers: typeof filtered = [];
        for (let page = 1; page <= currentPage; page++) {
          const start = (page - 1) * pageSize;
          const end = start + pageSize;
          const pageData = filtered.slice(start, end);
          allMembers.push(...pageData);
        }

        const pagination = {
          currentPage,
          totalPages: Math.ceil(filtered.length / pageSize),
          totalCount: filtered.length,
          hasNextPage: (currentPage * pageSize) < filtered.length,
        };

        setTeamMembers(allMembers, pagination);
      } else {
        // Normal pagination: load only current page
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paginated = filtered.slice(start, end);

        const pagination = {
          currentPage,
          totalPages: Math.ceil(filtered.length / pageSize),
          totalCount: filtered.length,
          hasNextPage: end < filtered.length,
        };

        // For grid view with "Load More" (page > 1), append to existing members
        // For table view or first page, replace the array
        const shouldAppend = viewMode === 'grid' && currentPage > 1 && teamMembers.length > 0;
        
        if (shouldAppend) {
          appendTeamMembers(paginated, pagination);
        } else {
          setTeamMembers(paginated, pagination);
        }
      }
      
      setLocalLoading(false);
      setLoading(false);
      setError(null);
    }, 500);

    return () => clearTimeout(timer);
    // Zustand setters are stable references, mockData never changes
    // refetchTrigger is included to trigger refetches
    // teamMembers is included to detect direct navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchTerm, selectedRole, sortBy, sortOrder, viewMode, shouldSkip, refetchTrigger, teamMembers.length]);

  return {
    data: null,
    loading: shouldSkip ? false : loading,
    error: null,
    refetch,
  };
}

