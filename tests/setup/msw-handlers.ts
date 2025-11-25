import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { TeamMembersResponse } from '@/types/teamDirectory';
import { generateMockTeamMembers } from '@/utils/generateMockData';

// Generate mock data
const mockMembers = generateMockTeamMembers(100);

export const handlers = [
  http.post('*/graphql', async ({ request }) => {
    const body = await request.json() as {
      query: string;
      variables?: {
        page?: number;
        limit?: number;
        role?: string | null;
        search?: string | null;
        sortBy?: string | null;
        sortOrder?: string;
      };
    };

    // Handle GET_TEAM_MEMBERS query
    if (body.query.includes('teamMembers') || body.query.includes('GetTeamMembers')) {
      const {
        page = 1,
        limit = 10,
        role = null,
        search = null,
        sortBy = null,
        sortOrder = 'asc',
      } = body.variables || {};

      let filtered = [...mockMembers];

      // Filter by role
      if (role) {
        filtered = filtered.filter((m) => m.role === role);
      }

      // Filter by search term
      if (search && search.trim()) {
        const searchLower = search.trim().toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.name.toLowerCase().includes(searchLower) ||
            m.email.toLowerCase().includes(searchLower)
        );
      }

      // Sort
      if (sortBy) {
        filtered.sort((a, b) => {
          const aVal = a[sortBy as 'name' | 'role'];
          const bVal = b[sortBy as 'name' | 'role'];
          const comparison = String(aVal).localeCompare(String(bVal));
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      }

      // Paginate
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = filtered.slice(start, end);

      const response: TeamMembersResponse = {
        teamMembers: {
          data: paginated,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(filtered.length / limit),
            totalCount: filtered.length,
            hasNextPage: end < filtered.length,
          },
        },
      };

      return HttpResponse.json({ data: response });
    }

    // Default: return empty response for unknown queries
    return HttpResponse.json({ data: { teamMembers: { data: [], pagination: null } } });
  }),
];

export const server = setupServer(...handlers);
