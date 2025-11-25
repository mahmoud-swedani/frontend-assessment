import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamMemberCard } from '@/components/team-directory/TeamMemberCard';
import type { TeamMember } from '@/types/teamDirectory';
import { render as customRender } from '@/tests/setup/test-utils';

describe('TeamMemberCard', () => {
  const mockMember: TeamMember = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=0',
  };

  it('should render member name', () => {
    customRender(<TeamMemberCard member={mockMember} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render member email', () => {
    customRender(<TeamMemberCard member={mockMember} />);

    const emailLink = screen.getByText('john@example.com');
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:john@example.com');
  });

  it('should render member role', () => {
    customRender(<TeamMemberCard member={mockMember} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should render avatar when provided', () => {
    customRender(<TeamMemberCard member={mockMember} />);

    const avatar = screen.getByAltText(/John Doe's avatar/i);
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', expect.stringContaining('dicebear.com'));
  });

  it('should render initial when avatar is null', () => {
    const memberWithoutAvatar: TeamMember = {
      ...mockMember,
      avatar: null,
    };

    customRender(<TeamMemberCard member={memberWithoutAvatar} />);

    // Should show initial (first letter of name)
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    customRender(<TeamMemberCard member={mockMember} />);

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('John Doe'));
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('should render email link with proper label', () => {
    customRender(<TeamMemberCard member={mockMember} />);

    const emailLink = screen.getByRole('link', { name: /email John Doe/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com');
  });

  it('should handle different roles', () => {
    const agentMember: TeamMember = {
      ...mockMember,
      role: 'Agent',
    };

    customRender(<TeamMemberCard member={agentMember} />);

    expect(screen.getByText('Agent')).toBeInTheDocument();
  });
});
