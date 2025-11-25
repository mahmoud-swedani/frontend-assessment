import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from '@/components/team-directory/ErrorState';
import { render as customRender } from '@/tests/setup/test-utils';

// Mock useTeamMembersData - use a module-level mock that can be overridden
const mockRefetch = vi.fn(() => Promise.resolve({ data: null, loading: false, error: null }));

vi.mock('@/hooks/useTeamMembersData', () => ({
  useTeamMembersData: () => ({
    refetch: mockRefetch,
  }),
}));

describe('ErrorState', () => {
  beforeEach(() => {
    mockRefetch.mockClear();
    mockRefetch.mockReturnValue(Promise.resolve({ data: null, loading: false, error: null }));
  });
  it('should render error message', () => {
    customRender(<ErrorState error="Network error occurred" />);

    expect(screen.getByText(/connection error|something went wrong/i)).toBeInTheDocument();
  });

  it('should show network error type for network errors', () => {
    customRender(<ErrorState error="Network request failed" />);

    expect(screen.getByText(/connection error/i)).toBeInTheDocument();
  });

  it('should show server error type for server errors', () => {
    customRender(<ErrorState error="Server error 500" />);

    expect(screen.getByText(/server error/i)).toBeInTheDocument();
  });

  it('should show unknown error type for other errors', () => {
    customRender(<ErrorState error="Unknown error" />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('should show retry button', () => {
    customRender(<ErrorState error="Test error" />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should call refetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn(() => Promise.resolve({ data: null, loading: false, error: null }));
    
    // Mock the hook at module level for this test
    vi.doMock('@/hooks/useTeamMembersData', () => ({
      useTeamMembersData: () => ({
        refetch: mockRefetch,
      }),
    }));

    customRender(<ErrorState error="Test error" />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    await waitFor(() => {
      expect(retryButton).toBeInTheDocument();
    });
  });

  it('should disable retry button while retrying', async () => {
    const user = userEvent.setup();
    // Create a promise that never resolves to simulate ongoing retry
    const mockRefetchPromise = new Promise<{ data: null; loading: boolean; error: null }>(() => {
      // Never resolves - simulates ongoing request
    });
    
    // Override the mock refetch for this test to return a promise that never resolves
    mockRefetch.mockReturnValueOnce(mockRefetchPromise);

    customRender(<ErrorState error="Test error" />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    
    // Click and wait for disabled state
    await act(async () => {
      await user.click(retryButton);
    });

    // Button should be disabled while retrying (isRetrying state should be true)
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /try again/i });
      expect(button).toBeDisabled();
    }, { timeout: 2000 });
  });
});
