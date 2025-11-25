import { useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import type { ApolloQueryResult } from '@apollo/client';
import { GET_TEAM_MEMBERS } from '@/graphql/queries/teamMembers';
import type { TeamMembersQueryVariables, TeamMembersResponse } from '@/types/teamDirectory';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { config } from '@/lib/config';
import { toast } from '@/lib/toast-store';
import { useTranslations } from 'next-intl';

const REQUEST_TIMEOUT = 30000; // 30 seconds

export function useTeamMembers() {
  const t = useTranslations('teamDirectory');
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownTimeoutWarningRef = useRef(false);

  // Always call useQuery to follow rules of hooks, but skip when using mock API
  const { data, loading, error, refetch } = useQuery<TeamMembersResponse>(GET_TEAM_MEMBERS, {
    variables: {
      page: currentPage,
      limit: pageSize,
      role: selectedRole || null,
      search: searchTerm || null,
      sortBy: sortBy || null,
      sortOrder,
    } as TeamMembersQueryVariables,
    skip: config.useMockApi, // Skip query when using mock API - this prevents the network request
  });

  // Track if we're loading multiple pages for direct navigation
  const isLoadingMultiplePagesRef = useRef(false);

  // Handle data updates
  useEffect(() => {
    if (!config.useMockApi && data?.teamMembers) {
      // Skip if we're in the middle of loading multiple pages (to avoid interference)
      if (isLoadingMultiplePagesRef.current) {
        return;
      }
      
      const isDirectNavigation = teamMembers.length === 0 && currentPage > 1 && viewMode === 'grid';
      
      if (isDirectNavigation) {
        // Start loading all pages from 1 to currentPage
        isLoadingMultiplePagesRef.current = true;
        
        // First, load page 1 (current data)
        setTeamMembers(data.teamMembers.data, data.teamMembers.pagination);
        setError(null);
        
        // Then sequentially load pages 2 through currentPage
        if (currentPage > 1) {
          const loadNextPage = async (page: number) => {
            if (page > currentPage) {
              isLoadingMultiplePagesRef.current = false;
              setLoading(false);
              return;
            }
            
            try {
              const result = await refetch({
                page,
                limit: pageSize,
                role: selectedRole || null,
                search: searchTerm || null,
                sortBy: sortBy || null,
                sortOrder,
              } as TeamMembersQueryVariables);
              
              if (result.data?.teamMembers) {
                appendTeamMembers(result.data.teamMembers.data, result.data.teamMembers.pagination);
                // Load next page
                await loadNextPage(page + 1);
              } else {
                isLoadingMultiplePagesRef.current = false;
                setLoading(false);
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to load page');
              isLoadingMultiplePagesRef.current = false;
              setLoading(false);
            }
          };
          
          // Start loading from page 2
          loadNextPage(2);
        } else {
          isLoadingMultiplePagesRef.current = false;
          setLoading(false);
        }
      } else {
        // Normal pagination: load only current page
        const shouldAppend = viewMode === 'grid' && currentPage > 1 && teamMembers.length > 0;
        
        if (shouldAppend) {
          appendTeamMembers(data.teamMembers.data, data.teamMembers.pagination);
        } else {
          setTeamMembers(data.teamMembers.data, data.teamMembers.pagination);
        }
        setError(null);
        isLoadingMultiplePagesRef.current = false;
      }
    }
    // Note: Zustand setters (setTeamMembers, appendTeamMembers, setError) are stable references
    // and don't need to be in dependencies, but including them makes the dependency explicit.
    // config.useMockApi is a constant but included for completeness.
    // refetch is stable from useQuery
  }, [data, viewMode, currentPage, teamMembers.length, setTeamMembers, appendTeamMembers, setError, setLoading, config.useMockApi, refetch, pageSize, selectedRole, searchTerm, sortBy, sortOrder]);

  // Handle errors
  useEffect(() => {
    if (!config.useMockApi && error) {
      setError(error.message);
    }
    // Note: Zustand setter (setError) is a stable reference.
    // config.useMockApi is a constant but included for completeness.
  }, [error, setError, config.useMockApi]);

  // Handle loading state
  useEffect(() => {
    if (!config.useMockApi) {
      setLoading(loading);
    }
    // Note: Zustand setter (setLoading) is a stable reference.
    // config.useMockApi is a constant but included for completeness.
  }, [loading, setLoading, config.useMockApi]);

  // Request timeout mechanism: Show warning if query takes longer than expected
  useEffect(() => {
    if (config.useMockApi || !loading) {
      // Clear timeout and reset warning flag if not loading
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      hasShownTimeoutWarningRef.current = false;
      return;
    }

    // Set timeout to show warning after REQUEST_TIMEOUT
    timeoutRef.current = setTimeout(() => {
      // Only show warning once per loading session
      if (!hasShownTimeoutWarningRef.current && loading) {
        hasShownTimeoutWarningRef.current = true;
        toast({
          variant: 'warning',
          title: t('errors.timeout.title', { defaultValue: 'Request taking longer than expected' }),
          description: t('errors.timeout.message', { 
            defaultValue: 'The request is taking longer than usual. Please check your connection or try again.',
          }),
          duration: 10000, // Show for 10 seconds
        });
      }
    }, REQUEST_TIMEOUT);

    // Cleanup timeout on unmount or when loading changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [loading, config.useMockApi, t]);

  // Create type-safe refetch function
  const createMockRefetch = (): Promise<ApolloQueryResult<TeamMembersResponse>> => {
    return Promise.resolve({
      data: null,
      loading: false,
      networkStatus: 7, // ready
      partial: false,
      dataState: 'partial',
    } as unknown as ApolloQueryResult<TeamMembersResponse>);
  };

  // Return no-op values when using mock API
  return { 
    data: config.useMockApi ? null : data, 
    loading: config.useMockApi ? false : loading, 
    error: config.useMockApi ? null : error, 
    refetch: config.useMockApi ? createMockRefetch : (refetch || createMockRefetch)
  };
}

