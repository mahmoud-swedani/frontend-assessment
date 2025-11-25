import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '@/components/team-directory/SearchInput';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { render as customRender } from '@/tests/setup/test-utils';

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value, // Return value immediately for testing
}));

describe('SearchInput', () => {
  beforeEach(() => {
    useTeamDirectoryStore.setState({
      searchTerm: '',
      teamMembers: [],
      isLoading: false,
      error: null,
    });
  });

  it('should render search input', () => {
    customRender(<SearchInput />);

    const input = screen.getByPlaceholderText(/search by name or email/i);
    expect(input).toBeInTheDocument();
  });

  it('should update store when user types', async () => {
    const user = userEvent.setup();
    customRender(<SearchInput />);

    const input = screen.getByPlaceholderText(/search by name or email/i);
    await user.type(input, 'john');

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.searchTerm).toBe('john');
    });
  });

  it('should show clear button when input has value', async () => {
    const user = userEvent.setup();
    customRender(<SearchInput />);

    const input = screen.getByPlaceholderText(/search by name or email/i);
    await user.type(input, 'test');

    await waitFor(() => {
      const clearButton = screen.getByLabelText(/clear search/i);
      expect(clearButton).toBeInTheDocument();
    });
  });

  it('should clear input when clear button is clicked', async () => {
    const user = userEvent.setup();
    useTeamDirectoryStore.setState({ searchTerm: 'test' });

    customRender(<SearchInput />);

    const clearButton = screen.getByLabelText(/clear search/i);
    await user.click(clearButton);

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.searchTerm).toBe('');
    });
  });

  it('should clear input when Escape key is pressed', async () => {
    const user = userEvent.setup();
    customRender(<SearchInput />);

    const input = screen.getByPlaceholderText(/search by name or email/i);
    await user.type(input, 'test');
    await user.keyboard('{Escape}');

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.searchTerm).toBe('');
    });
  });

  it('should sanitize input', async () => {
    const user = userEvent.setup();
    customRender(<SearchInput />);

    const input = screen.getByPlaceholderText(/search by name or email/i);
    await user.type(input, '<script>alert("xss")</script>');

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      // Sanitization removes < > " ' & characters, but keeps valid text
      expect(state.searchTerm).not.toContain('<script>');
      expect(state.searchTerm).not.toContain('</script>');
      expect(state.searchTerm).not.toContain('"');
      expect(state.searchTerm).not.toContain("'");
      // "alert" is valid text, so it remains after removing script tags and quotes
      // The important thing is that script tags are removed
    });
  });

  it('should limit input length to MAX_SEARCH_LENGTH', async () => {
    const user = userEvent.setup();
    const longString = 'a'.repeat(150);
    
    customRender(<SearchInput />);

    const input = screen.getByPlaceholderText(/search by name or email/i);
    await user.type(input, longString);

    await waitFor(() => {
      const state = useTeamDirectoryStore.getState();
      expect(state.searchTerm.length).toBeLessThanOrEqual(100);
    });
  });

  it('should sync with store when store changes externally', async () => {
    customRender(<SearchInput />);

    // Wrap store update in act() since it triggers useEffect that updates component state
    await act(async () => {
      useTeamDirectoryStore.getState().setSearchTerm('external');
    });

    await waitFor(() => {
      const input = screen.getByPlaceholderText(/search by name or email/i) as HTMLInputElement;
      expect(input.value).toBe('external');
    });
  });
});
