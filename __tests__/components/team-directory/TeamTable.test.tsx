import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamTable } from '@/components/team-directory/TeamTable';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import type { TeamMember } from '@/types/teamDirectory';
import { render as customRender } from '@/tests/setup/test-utils';

// Mock hooks
vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: () => false, // Desktop by default
}));

vi.mock('@/hooks/useAvailableHeight', () => ({
  useAvailableHeight: () => 600,
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

vi.mock('@/hooks/useScrollAnimation', () => ({
  useFadeInOnScroll: () => ({ ref: { current: null }, isInView: true }),
}));

describe('TeamTable', () => {
  const mockMembers: TeamMember[] = [
    { id: '1', name: 'Alice Admin', email: 'alice@example.com', role: 'Admin', avatar: null },
    { id: '2', name: 'Bob Agent', email: 'bob@example.com', role: 'Agent', avatar: null },
    { id: '3', name: 'Charlie Creator', email: 'charlie@example.com', role: 'Creator', avatar: null },
  ];

  const mockPagination = {
    currentPage: 1,
    totalPages: 1,
    totalCount: 3,
    hasNextPage: false,
  };

  beforeEach(() => {
    useTeamDirectoryStore.setState({
      teamMembers: [],
      isLoading: false,
      currentPage: 1,
      pageSize: 10,
      pagination: null,
      sortBy: null,
      sortOrder: 'asc',
    });
  });

  it('should render table with data', async () => {
    useTeamDirectoryStore.setState({
      teamMembers: mockMembers,
      pagination: mockPagination,
    });

    const scrollRef = { current: null } as React.RefObject<HTMLDivElement | null>;
    customRender(<TeamTable scrollContainerRef={scrollRef} />);

    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument();
      expect(screen.getByText('Bob Agent')).toBeInTheDocument();
      expect(screen.getByText('Charlie Creator')).toBeInTheDocument();
    });
  });

  it('should render table headers', async () => {
    useTeamDirectoryStore.setState({
      teamMembers: mockMembers,
      pagination: mockPagination,
    });

    const scrollRef = { current: null } as React.RefObject<HTMLDivElement | null>;
    customRender(<TeamTable scrollContainerRef={scrollRef} />);

    await waitFor(() => {
      expect(screen.getByText(/name/i)).toBeInTheDocument();
      expect(screen.getByText(/role/i)).toBeInTheDocument();
      expect(screen.getByText(/email/i)).toBeInTheDocument();
    });
  });

  it('should sort by name when name header is clicked', async () => {
    const user = userEvent.setup();
    useTeamDirectoryStore.setState({
      teamMembers: mockMembers,
      pagination: mockPagination,
    });

    const scrollRef = { current: null } as React.RefObject<HTMLDivElement | null>;
    customRender(<TeamTable scrollContainerRef={scrollRef} />);

    await waitFor(() => {
      const nameHeader = screen.getByRole('button', { name: /name/i });
      expect(nameHeader).toBeInTheDocument();
    });

    const nameHeader = screen.getByRole('button', { name: /name/i });
    await user.click(nameHeader);

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.sortBy).toBe('name');
      expect(state.sortOrder).toBe('asc');
    });
  });

  it('should toggle sort order when same header is clicked twice', async () => {
    const user = userEvent.setup();
    useTeamDirectoryStore.setState({
      teamMembers: mockMembers,
      pagination: mockPagination,
      sortBy: 'name',
      sortOrder: 'asc',
    });

    const scrollRef = { current: null } as React.RefObject<HTMLDivElement | null>;
    customRender(<TeamTable scrollContainerRef={scrollRef} />);

    await waitFor(() => {
      const nameHeader = screen.getByRole('button', { name: /name/i });
      expect(nameHeader).toBeInTheDocument();
    });

    const nameHeader = screen.getByRole('button', { name: /name/i });
    await user.click(nameHeader);

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.sortOrder).toBe('desc');
    });
  });

  it('should render pagination controls when multiple pages exist', async () => {
    useTeamDirectoryStore.setState({
      teamMembers: mockMembers,
      pagination: {
        currentPage: 1,
        totalPages: 3,
        totalCount: 30,
        hasNextPage: true,
      },
    });

    const scrollRef = { current: null } as React.RefObject<HTMLDivElement | null>;
    customRender(<TeamTable scrollContainerRef={scrollRef} />);

    await waitFor(() => {
      expect(screen.getByText(/page/i)).toBeInTheDocument();
      expect(screen.getByText(/of/i)).toBeInTheDocument();
    });
  });

  it('should navigate to next page when next button is clicked', async () => {
    const user = userEvent.setup();
    useTeamDirectoryStore.setState({
      teamMembers: mockMembers,
      pagination: {
        currentPage: 1,
        totalPages: 3,
        totalCount: 30,
        hasNextPage: true,
      },
    });

    const scrollRef = { current: null } as React.RefObject<HTMLDivElement | null>;
    customRender(<TeamTable scrollContainerRef={scrollRef} />);

    await waitFor(() => {
      const nextButton = screen.getByLabelText(/next page/i);
      expect(nextButton).toBeInTheDocument();
    });

    const nextButton = screen.getByLabelText(/next page/i);
    await user.click(nextButton);

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.currentPage).toBe(2);
    });
  });

  it('should show loading skeleton when loading', () => {
    useTeamDirectoryStore.setState({
      isLoading: true,
      teamMembers: [],
    });

    const scrollRef = { current: null } as React.RefObject<HTMLDivElement | null>;
    customRender(<TeamTable scrollContainerRef={scrollRef} />);

    // When loading, TeamTable shows a status role with loading skeleton, not a table
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });

  it('should show empty message when no data', async () => {
    useTeamDirectoryStore.setState({
      teamMembers: [],
      isLoading: false,
      pagination: mockPagination,
    });

    const scrollRef = { current: null } as React.RefObject<HTMLDivElement | null>;
    customRender(<TeamTable scrollContainerRef={scrollRef} />);

    await waitFor(() => {
      // TeamTable uses t('table.noResults') which translates to "No results."
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

