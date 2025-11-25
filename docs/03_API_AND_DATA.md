# API & Data Layer (GraphQL)

## Data Fetching Strategy

**Data Fetching Strategy:**

- **Primary**: Apollo Client with GraphQL (`useTeamMembers` hook)
- **Fallback**: Mock API (`useTeamMembersMock` hook)
- **Unified Hook**: `useTeamMembersData` conditionally uses mock or real API based on `NEXT_PUBLIC_USE_MOCK_API`

**API Layer Location:**

- **GraphQL Query**: `graphql/queries/teamMembers.ts`
- **Apollo Hook**: `hooks/useTeamMembers.ts`
- **Mock Hook**: `hooks/useTeamMembersMock.ts`
- **Configuration**: `lib/config.ts` (environment-based API selection)

**Data Flow:**

1. User interaction (filter/search/pagination)
2. Zustand store updates
3. URL params sync (for shareability)
4. Apollo hook fetches with new parameters
5. Store receives data and updates `teamMembers` array
6. Components re-render with new data

**Mock Data:**

- Generated in `utils/generateMockData.ts`
- Simulates GraphQL response structure
- Supports filtering, sorting, pagination
- Limited to 100 members in mock mode

## GraphQL Schema Definition

**TeamMember Type Structure:**

```graphql
type TeamMember {
  id: String!          # Unique identifier
  name: String!        # Full name of team member
  email: String!       # Email address
  role: TeamMemberRole! # Role: Admin, Agent, or Creator
  avatar: String       # Avatar image URL (nullable)
}

enum TeamMemberRole {
  Admin
  Agent
  Creator
}

type PaginationInfo {
  currentPage: Int!    # Current page number (1-indexed)
  totalPages: Int!     # Total number of pages
  totalCount: Int!     # Total number of team members
  hasNextPage: Boolean! # Whether more pages exist
}

type TeamMembersResponse {
  data: [TeamMember!]! # Array of team members
  pagination: PaginationInfo!
}
```

**Main Query: `GetTeamMembers`**

```graphql
query GetTeamMembers(
  $page: Int!          # Page number (required)
  $limit: Int!         # Items per page (required)
  $role: String        # Filter by role (optional)
  $search: String      # Search term for name/email (optional)
  $sortBy: String      # Sort field: "name" or "role" (optional)
  $sortOrder: String   # Sort direction: "asc" or "desc" (optional)
) {
  teamMembers(
    page: $page
    limit: $limit
    role: $role
    search: $search
    sortBy: $sortBy
    sortOrder: $sortOrder
  ) {
    data {
      id
      name
      email
      role
      avatar
    }
    pagination {
      currentPage
      totalPages
      totalCount
      hasNextPage
    }
  }
}
```

**Query Variables:**
- `page`: Integer, required. Starting from 1
- `limit`: Integer, required. Number of items per page (typically 10, 20, or 50)
- `role`: String, optional. Values: "Admin", "Agent", "Creator", or null
- `search`: String, optional. Searches in name and email fields
- `sortBy`: String, optional. Values: "name", "role", or null
- `sortOrder`: String, optional. Values: "asc", "desc" (default: "asc")

## Authentication/Authorization

**Current Implementation:**

The application currently operates in a **demo/assessment mode** without authentication requirements:

- **No Access Tokens**: The GraphQL API does not require authentication tokens in the current implementation
- **Public Access**: All team member data is publicly accessible (suitable for internal tools)
- **Apollo Client Configuration**: No authorization headers are configured

**Apollo Client Setup:**

The Apollo Client is configured in `components/providers/ApolloProvider.tsx`:

```typescript
// Current implementation (no auth)
const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: config.graphqlEndpoint,
    fetchOptions: { cache: 'no-store' },
  }),
  // No headers configured for authentication
});
```

**Future Authentication Implementation:**

For production use with authentication, the implementation would be:

```typescript
// Example: Future implementation with auth
import { setContext } from '@apollo/client/link/context';

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken(); // Get token from storage/cookie
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const client = new ApolloClient({
  cache,
  link: authLink.concat(httpLink),
});
```

**Security Considerations:**

- **Environment Variables**: API endpoints should be configured via environment variables
- **Token Storage**: If implemented, tokens should be stored securely (httpOnly cookies recommended)
- **HTTPS Only**: All API communication should use HTTPS in production
- **CORS Configuration**: Backend should properly configure CORS for allowed origins

---

**Next**: [Testing and Quality Assurance](./04_TESTING_QA.md) | **Previous**: [Frontend Architecture Deep Dive](./02_ARCHITECTURE_FE.md)

