import type { TeamMember, TeamMemberRole } from '@/types/teamDirectory';

const roles: TeamMemberRole[] = ['Admin', 'Agent', 'Creator'];
const firstNames = ['John', 'Jane', 'Ahmed', 'Fatima', 'David', 'Sarah', 'Mohammed', 'Aisha'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

export function generateMockTeamMembers(count: number = 50): TeamMember[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `member-${i + 1}`,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    email: `user${i + 1}@example.com`,
    role: roles[i % roles.length] as TeamMemberRole,
    // Use PNG format instead of SVG for better Next.js Image compatibility
    avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${i}`,
  }));
}

