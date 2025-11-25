export type TeamMemberRole = 'Admin' | 'Agent' | 'Creator';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  avatar: string | null;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
}

export interface TeamMembersResponse {
  teamMembers: {
    data: TeamMember[];
    pagination: PaginationInfo;
  };
}

export interface TeamMembersQueryVariables {
  page: number;
  limit: number;
  role?: TeamMemberRole | null;
  search?: string | null;
  sortBy?: 'name' | 'role';
  sortOrder?: 'asc' | 'desc';
}

