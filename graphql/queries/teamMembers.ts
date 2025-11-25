import { gql } from '@apollo/client';

export const GET_TEAM_MEMBERS = gql`
  query GetTeamMembers(
    $page: Int!
    $limit: Int!
    $role: String
    $search: String
    $sortBy: String
    $sortOrder: String
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
`;

