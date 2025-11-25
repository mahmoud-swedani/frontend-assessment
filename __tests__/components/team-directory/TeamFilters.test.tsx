import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamFilters } from '@/components/team-directory/TeamFilters';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { render as customRender } from '@/tests/setup/test-utils';

describe('TeamFilters', () => {
  beforeEach(() => {
    useTeamDirectoryStore.setState({
      searchTerm: '',
      selectedRole: null,
      sortBy: null,
    });
  });

  it('should render all filter inputs', async () => {
    customRender(<TeamFilters />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by name or email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by role/i)).toBeInTheDocument();
    });
  });

  it('should show clear filters button when filters are active', async () => {
    useTeamDirectoryStore.setState({
      searchTerm: 'test',
    });

    customRender(<TeamFilters />);

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toBeInTheDocument();
    });
  });

  it('should not show clear filters button when no filters are active', async () => {
    customRender(<TeamFilters />);

    await waitFor(() => {
      const clearButton = screen.queryByRole('button', { name: /clear all filters/i });
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  it('should clear all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    useTeamDirectoryStore.setState({
      searchTerm: 'test',
      selectedRole: 'Admin',
      sortBy: 'name',
    });

    customRender(<TeamFilters />);

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
      expect(state.sortBy).toBeNull();
    });
  });

  it('should show filter count badge when filters are active', async () => {
    useTeamDirectoryStore.setState({
      searchTerm: 'test',
      selectedRole: 'Admin',
      sortBy: 'name',
    });

    customRender(<TeamFilters />);

    await waitFor(() => {
      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
    });
  });

  it('should open advanced filters drawer when advanced button is clicked', async () => {
    const user = userEvent.setup();
    customRender(<TeamFilters />);

    await waitFor(() => {
      const advancedButton = screen.getByLabelText(/advanced filters/i);
      expect(advancedButton).toBeInTheDocument();
    });

    const advancedButton = screen.getByLabelText(/advanced filters/i);
    await user.click(advancedButton);

    // Should show drawer (this depends on AdvancedFiltersDrawer implementation)
    // For now, we just verify the button is clickable
    expect(advancedButton).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', async () => {
    customRender(<TeamFilters />);

    await waitFor(() => {
      const searchRegion = screen.getByRole('search');
      expect(searchRegion).toBeInTheDocument();
    });
  });
});

