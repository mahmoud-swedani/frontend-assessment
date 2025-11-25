/**
 * Centralized configuration for environment variables
 * Prevents duplication and makes configuration easier to maintain
 */

export const config = {
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false',
  graphqlEndpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/api/graphql',
} as const;

