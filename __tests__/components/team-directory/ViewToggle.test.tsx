import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewToggle } from '@/components/team-directory/ViewToggle';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { render as customRender } from '@/tests/setup/test-utils';

describe('ViewToggle', () => {
  beforeEach(() => {
    useTeamDirectoryStore.setState({
      viewMode: 'table',
      teamMembers: [],
      currentPage: 1,
    });
  });

  it('should render both view options', async () => {
    customRender(<ViewToggle />);

    await waitFor(() => {
      expect(screen.getByText(/table/i)).toBeInTheDocument();
      expect(screen.getByText(/grid/i)).toBeInTheDocument();
    });
  });

  it('should show table view as selected by default', async () => {
    customRender(<ViewToggle />);

    await waitFor(() => {
      // Use getByLabelText - translations should work via NextIntlClientProvider in test-utils
      const tableButton = screen.getByLabelText(/switch to table view/i);
      expect(tableButton).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should switch to grid view when grid button is clicked', async () => {
    const user = userEvent.setup();
    customRender(<ViewToggle />);

    await waitFor(() => {
      const gridButton = screen.getByLabelText(/switch to grid view/i);
      expect(gridButton).toBeInTheDocument();
    });

    const gridButton = screen.getByLabelText(/switch to grid view/i);
    await user.click(gridButton);

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.viewMode).toBe('grid');
    });
  });

  it('should switch to table view when table button is clicked', async () => {
    const user = userEvent.setup();
    useTeamDirectoryStore.setState({ viewMode: 'grid' });

    customRender(<ViewToggle />);

    await waitFor(() => {
      const tableButton = screen.getByLabelText(/switch to table view/i);
      expect(tableButton).toBeInTheDocument();
    });

    const tableButton = screen.getByLabelText(/switch to table view/i);
    await user.click(tableButton);

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.viewMode).toBe('table');
    });
  });

  it('should update aria-selected when view changes', async () => {
    const user = userEvent.setup();
    customRender(<ViewToggle />);

    await waitFor(() => {
      const gridButton = screen.getByLabelText(/switch to grid view/i);
      expect(gridButton).toBeInTheDocument();
    });

    const gridButton = screen.getByLabelText(/switch to grid view/i);
    await user.click(gridButton);

    await waitFor(() => {
      expect(gridButton).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should have proper accessibility attributes', async () => {
    customRender(<ViewToggle />);

    await waitFor(() => {
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', expect.stringContaining('View mode'));
    });
  });
});

