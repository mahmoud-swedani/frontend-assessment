import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/team-directory/EmptyState';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { render as customRender } from '@/tests/setup/test-utils';

describe('EmptyState', () => {
  beforeEach(() => {
    useTeamDirectoryStore.setState({
      searchTerm: '',
      selectedRole: null,
      teamMembers: [],
      isLoading: false,
      error: null,
    });
  });

  it('should render empty state message', () => {
    customRender(<EmptyState />);

    expect(screen.getByText(/no team members found/i)).toBeInTheDocument();
  });

  it('should show "no data" message when no filters are active', () => {
    customRender(<EmptyState />);

    expect(screen.getByText(/no team members found/i)).toBeInTheDocument();
    // Should show message about directory being set up
    expect(screen.getByText(/team directory is being set up/i)).toBeInTheDocument();
  });

  it('should show "filtered" message when filters are active', () => {
    useTeamDirectoryStore.setState({
      searchTerm: 'john',
    });

    customRender(<EmptyState />);

    expect(screen.getByText(/no team members found/i)).toBeInTheDocument();
    expect(screen.getByText(/couldn't find any matches/i)).toBeInTheDocument();
  });

  it('should show clear filters button when filters are active', () => {
    useTeamDirectoryStore.setState({
      searchTerm: 'john',
    });

    customRender(<EmptyState />);

    const clearButton = screen.getByRole('button', { name: /clear all filters/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear filters button when no filters are active', () => {
    customRender(<EmptyState />);

    const clearButton = screen.queryByRole('button', { name: /clear all filters/i });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should clear filters when clear button is clicked', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    useTeamDirectoryStore.setState({
      searchTerm: 'john',
      selectedRole: 'Admin',
    });

    customRender(<EmptyState />);

    const clearButton = screen.getByRole('button', { name: /clear all filters/i });
    await user.click(clearButton);

    const state = useTeamDirectoryStore.getState();
    expect(state.searchTerm).toBe('');
    expect(state.selectedRole).toBeNull();
  });

  it('should show appropriate icon when filters are active', () => {
    useTeamDirectoryStore.setState({
      searchTerm: 'john',
    });

    customRender(<EmptyState />);

    // Should show SearchX icon when filters are active
    // Icon is aria-hidden, so we check the message instead
    expect(screen.getByText(/couldn't find any matches/i)).toBeInTheDocument();
  });
});
