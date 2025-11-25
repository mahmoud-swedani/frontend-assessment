import { describe, it, expect } from 'vitest';
import { generateMockTeamMembers } from '@/utils/generateMockData';
import type { TeamMemberRole } from '@/types/teamDirectory';

describe('generateMockData', () => {
  describe('generateMockTeamMembers', () => {
    it('should generate the specified number of team members', () => {
      const members = generateMockTeamMembers(10);

      expect(members).toHaveLength(10);
    });

    it('should generate members with all required fields', () => {
      const members = generateMockTeamMembers(5);

      members.forEach((member) => {
        expect(member).toHaveProperty('id');
        expect(member).toHaveProperty('name');
        expect(member).toHaveProperty('email');
        expect(member).toHaveProperty('role');
        expect(member).toHaveProperty('avatar');

        expect(typeof member.id).toBe('string');
        expect(typeof member.name).toBe('string');
        expect(typeof member.email).toBe('string');
        expect(typeof member.role).toBe('string');
        expect(member.avatar).toBeTruthy(); // Should have an avatar URL
      });
    });

    it('should generate unique IDs', () => {
      const members = generateMockTeamMembers(50);
      const ids = members.map((m) => m.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should generate valid email addresses', () => {
      const members = generateMockTeamMembers(10);

      members.forEach((member) => {
        expect(member.email).toMatch(/^user\d+@example\.com$/);
      });
    });

    it('should generate valid roles', () => {
      const validRoles: TeamMemberRole[] = ['Admin', 'Agent', 'Creator'];
      const members = generateMockTeamMembers(30);

      members.forEach((member) => {
        expect(validRoles).toContain(member.role);
      });
    });

    it('should distribute roles across members', () => {
      const members = generateMockTeamMembers(30);
      const roleCounts = members.reduce(
        (acc, member) => {
          acc[member.role] = (acc[member.role] || 0) + 1;
          return acc;
        },
        {} as Record<TeamMemberRole, number>
      );

      // With 30 members, we should have at least one of each role
      expect(roleCounts['Admin']).toBeGreaterThan(0);
      expect(roleCounts['Agent']).toBeGreaterThan(0);
      expect(roleCounts['Creator']).toBeGreaterThan(0);
    });

    it('should generate valid avatar URLs', () => {
      const members = generateMockTeamMembers(10);

      members.forEach((member) => {
        expect(member.avatar).toContain('dicebear.com');
        expect(member.avatar).toContain('seed=');
      });
    });

    it('should use default count of 50 when no count provided', () => {
      const members = generateMockTeamMembers();

      expect(members).toHaveLength(50);
    });

    it('should generate members with sequential IDs', () => {
      const members = generateMockTeamMembers(5);

      members.forEach((member, index) => {
        expect(member.id).toBe(`member-${index + 1}`);
      });
    });

    it('should handle zero count', () => {
      const members = generateMockTeamMembers(0);

      expect(members).toHaveLength(0);
    });

    it('should handle large counts', () => {
      const members = generateMockTeamMembers(1000);

      expect(members).toHaveLength(1000);
      expect(members[0]?.id).toBe('member-1');
      expect(members[999]?.id).toBe('member-1000');
    });
  });
});
