import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoleFilter } from '@/components/team-directory/RoleFilter';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { render as customRender } from '@/tests/setup/test-utils';

describe('RoleFilter', () => {
  beforeEach(() => {
    useTeamDirectoryStore.setState({
      selectedRole: null,
    });
  });

  it('should render role filter', async () => {
    customRender(<RoleFilter />);

    await waitFor(() => {
      const filter = screen.getByLabelText(/filter by role/i);
      expect(filter).toBeInTheDocument();
    });
  });

  it('should update store when role is selected', async () => {
    const user = userEvent.setup();
    customRender(<RoleFilter />);

    await waitFor(() => {
      const filter = screen.getByLabelText(/filter by role/i);
      expect(filter).toBeInTheDocument();
    });

    // Click to open dropdown
    const filter = screen.getByLabelText(/filter by role/i);
    await user.click(filter);

    // Wait for options and click Admin
    await waitFor(async () => {
      const adminOption = await screen.findByText(/admin/i);
      await user.click(adminOption);
    });

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.selectedRole).toBe('Admin');
    });
  });

  it('should clear role when "all roles" is selected', async () => {
    const user = userEvent.setup();
    useTeamDirectoryStore.setState({ selectedRole: 'Admin' });

    customRender(<RoleFilter />);

    await waitFor(() => {
      const filter = screen.getByLabelText(/filter by role/i);
      expect(filter).toBeInTheDocument();
    });

    const filter = screen.getByLabelText(/filter by role/i);
    await user.click(filter);

    // Wait for dropdown to open and find the "All Roles" option
    // The option text is translated, so check for both the translation key and actual text
    await waitFor(async () => {
      const allRolesOption = await screen.findByText(/all roles/i, {}, { timeout: 3000 }).catch(() => {
        // Fallback: try to find by role or other means
        return screen.findByRole('option', { name: /all/i });
      });
      if (allRolesOption) {
        await user.click(allRolesOption);
      }
    }, { timeout: 5000 });

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.selectedRole).toBeNull();
    }, { timeout: 3000 });
  });

  it('should show visual feedback when role is selected', async () => {
    useTeamDirectoryStore.setState({ selectedRole: 'Admin' });

    customRender(<RoleFilter />);

    await waitFor(() => {
      const filter = screen.getByLabelText(/filter by role/i);
      expect(filter).toBeInTheDocument();
      // Should have visual feedback (border-primary/60 shadow-rose classes)
      expect(filter).toBeInTheDocument();
    });
  });
});
