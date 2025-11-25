import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamDirectoryClient } from '@/app/[locale]/team-directory/TeamDirectoryClient';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { render as customRender } from '@/tests/setup/test-utils';
import type { TeamMember } from '@/types/teamDirectory';

// Increase timeout for integration tests that involve complex component rendering
const INTEGRATION_TEST_TIMEOUT = 15000;

// Mock hooks
vi.mock('@/hooks/useTeamMembersData', () => ({
  useTeamMembersData: () => ({
    refetch: vi.fn(() => Promise.resolve({ data: null, loading: false, error: null })),
  }),
}));

vi.mock('@/hooks/useScrollRestoration', () => ({
  useScrollRestoration: vi.fn(),
}));

// Mock useAvailableHeight to avoid ResizeObserver issues
vi.mock('@/hooks/useAvailableHeight', () => ({
  useAvailableHeight: () => 600, // Return a fixed height for tests
}));

// Mock toast function
vi.mock('@/lib/toast-store', () => ({
  toast: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en/team-directory',
  useSearchParams: () => new URLSearchParams(),
}));

describe('TeamDirectory Flow Integration', () => {
  const mockMembers: TeamMember[] = [
    { id: '1', name: 'Alice Admin', email: 'alice@example.com', role: 'Admin', avatar: null },
    { id: '2', name: 'Bob Agent', email: 'bob@example.com', role: 'Agent', avatar: null },
    { id: '3', name: 'Charlie Creator', email: 'charlie@example.com', role: 'Creator', avatar: null },
  ];

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

  it('should render team directory page', async () => {
    customRender(<TeamDirectoryClient />);

    await waitFor(() => {
      expect(screen.getByText(/team directory/i)).toBeInTheDocument();
    });
  });

  it('should display filters', async () => {
    customRender(<TeamDirectoryClient />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by name or email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by role/i)).toBeInTheDocument();
    });
  });

  it('should show empty state when no members', async () => {
    // Ensure store has no members and is not loading
    useTeamDirectoryStore.setState({
      teamMembers: [],
      isLoading: false,
      error: null,
      pagination: null,
      totalCount: 0,
    });

    customRender(<TeamDirectoryClient />);

    // Wait for component to render - check for either empty state title or message
    // First, wait for the main content area to appear
    await waitFor(() => {
      // Check that the main content area exists (has aria-label="Team members list")
      const mainContent = screen.queryByLabelText('Team members list');
      expect(mainContent).toBeInTheDocument();
    }, { timeout: 5000 });

    // Then check for empty state content
    await waitFor(() => {
      // Look for the EmptyState by role="status" or by text content
      const emptyState = screen.queryByRole('status');
      const title = screen.queryByText(/no team members found/i);
      const message = screen.queryByText(/team directory is being set up/i) ||
                      screen.queryByText(/couldn't find any matches/i);
      
      // At least one should be present
      expect(emptyState || title || message).toBeTruthy();
    }, { timeout: 10000 });
  }, INTEGRATION_TEST_TIMEOUT);

  it('should show error state when error occurs', () => {
    useTeamDirectoryStore.setState({
      error: 'Network error',
    });

    customRender(<TeamDirectoryClient />);

    expect(screen.getByText(/connection error|something went wrong/i)).toBeInTheDocument();
  });

  it('should update table when filters change', async () => {
    const user = userEvent.setup();
    
    // Set up store state with members
    useTeamDirectoryStore.setState({
      teamMembers: mockMembers,
      totalCount: 3,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 3,
        hasNextPage: false,
      },
      isLoading: false,
      viewMode: 'table',
      error: null,
      searchTerm: '',
      selectedRole: null,
      sortBy: null,
      sortOrder: 'asc',
    });

    customRender(<TeamDirectoryClient />);

    // Wait for filters to be available (they're always rendered in TeamFilters)
    await waitFor(() => {
      expect(screen.getByLabelText(/filter by role/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Filter by role - wait for filter to be available
    const roleFilter = await screen.findByLabelText(/filter by role/i, {}, { timeout: 5000 });
    await user.click(roleFilter);

    // Wait for dropdown options to appear and click Admin
    await waitFor(async () => {
      const adminOption = await screen.findByText(/admin/i, {}, { timeout: 5000 });
      await user.click(adminOption);
    }, { timeout: 10000 });

    // Store should be updated (actual filtering is tested in hook tests)
    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.selectedRole).toBe('Admin');
    }, { timeout: 5000 });
  }, INTEGRATION_TEST_TIMEOUT);

  it('should toggle between table and grid views', async () => {
    const user = userEvent.setup();
    useTeamDirectoryStore.setState({
      teamMembers: mockMembers,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 3,
        hasNextPage: false,
      },
    });

    customRender(<TeamDirectoryClient />);

    await waitFor(() => {
      const viewToggle = screen.getByLabelText(/switch to grid/i);
      expect(viewToggle).toBeInTheDocument();
    });

    const gridButton = screen.getByLabelText(/switch to grid/i);
    await user.click(gridButton);

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.viewMode).toBe('grid');
    });
  });

  it('should clear filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    useTeamDirectoryStore.setState({
      searchTerm: 'test',
      selectedRole: 'Admin',
    });

    customRender(<TeamDirectoryClient />);

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toBeInTheDocument();
    });

    const clearButton = screen.getByRole('button', { name: /clear all filters/i });
    await user.click(clearButton);

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.searchTerm).toBe('');
      expect(state.selectedRole).toBeNull();
    });
  });
});
