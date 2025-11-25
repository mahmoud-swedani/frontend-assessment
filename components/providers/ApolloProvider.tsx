'use client';

import { useMemo } from 'react';
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, type NormalizedCacheObject } from '@apollo/client';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { Observable } from 'rxjs';
import { config } from '@/lib/config';
import type { TeamMembersResponse } from '@/types/teamDirectory';

/**
 * Type-safe Apollo Client with proper cache shape
 * This ensures type safety throughout the application
 */
type ApolloClientType = ApolloClient;

// Extend Window interface for Apollo Client singleton
declare global {
  interface Window {
    __APOLLO_CLIENT__?: ApolloClientType;
  }
}

/**
 * Creates the Apollo Link based on configuration
 * Returns a mock link if using mock API, otherwise returns HTTP link
 */
function createApolloLink(): ApolloLink {
  if (config.useMockApi) {
    // Mock link that immediately completes (no network request)
    return new ApolloLink((operation) => {
      return new Observable((subscriber) => {
        subscriber.complete();
      });
    });
  }

  // Real HTTP link for GraphQL endpoint
  try {
    return new HttpLink({
      uri: config.graphqlEndpoint,
      fetchOptions: { cache: 'no-store' },
    });
  } catch (error) {
    console.error('Failed to create Apollo HttpLink:', error);
    // Fallback to mock link if HTTP link creation fails
    return new ApolloLink((operation) => {
      return new Observable((subscriber) => {
        subscriber.error(new Error('Failed to initialize GraphQL client'));
      });
    });
  }
}

/**
 * Creates the InMemoryCache with type policies for team members
 * This ensures proper caching and merging of query results
 */
function createApolloCache(): InMemoryCache {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          teamMembers: {
            // Cache key arguments - different combinations create separate cache entries
            keyArgs: ['role', 'search', 'sortBy', 'sortOrder'],
            // Merge strategy: always replace with incoming data (no pagination merging)
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  });
}

/**
 * Creates an Apollo Client instance
 * 
 * Server-side: Creates a new client for each request to prevent state leakage
 * Client-side: Uses singleton pattern to reuse client across renders
 * 
 * @param isServerSide - Whether this is running on the server
 * @returns Apollo Client instance
 * @throws Error if client creation fails
 */
function createApolloClient(isServerSide: boolean): ApolloClientType {
  const link = createApolloLink();
  const cache = createApolloCache();

  try {
    const client = new ApolloClient({
      cache,
      link,
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
          errorPolicy: 'all',
        },
      },
      ssrMode: isServerSide, // Enable SSR mode only on server
    });

    return client;
  } catch (error) {
    console.error('Failed to create Apollo Client:', error);
    throw new Error('Failed to initialize Apollo Client. Please check your configuration.');
  }
}

/**
 * Gets or creates the Apollo Client instance
 * 
 * This function handles both server-side and client-side scenarios:
 * - Server: Always creates a new client (prevents state leakage between requests)
 * - Client: Uses singleton pattern (reuses client across renders, handles HMR)
 * 
 * @returns Apollo Client instance
 */
function getApolloClient(): ApolloClientType {
  const isServerSide = typeof window === 'undefined';

  // Server-side: always create new client
  if (isServerSide) {
    return createApolloClient(true);
  }

  // Client-side: use singleton pattern
  // Check if client already exists (handles HMR and prevents recreation)
  if (!window.__APOLLO_CLIENT__) {
    try {
      window.__APOLLO_CLIENT__ = createApolloClient(false);
    } catch (error) {
      console.error('Failed to create Apollo Client singleton:', error);
      // If singleton creation fails, try to create a non-singleton instance
      // This allows the app to continue functioning even if singleton fails
      return createApolloClient(false);
    }
  }

  return window.__APOLLO_CLIENT__;
}

/**
 * Apollo Provider component
 * 
 * Wraps the application with Apollo Client provider for GraphQL queries.
 * Handles both server-side and client-side rendering correctly.
 * 
 * @param children - React children to wrap with Apollo Provider
 */
export function ApolloProvider({ children }: { children: React.ReactNode }) {
  // Use useMemo to ensure client is only created once per component instance
  // This prevents recreation on every render while still handling SSR correctly
  const client = useMemo(() => {
    try {
      return getApolloClient();
    } catch (error) {
      console.error('Apollo Provider: Failed to get client:', error);
      // Return a minimal client to prevent app crash
      // In production, you might want to show an error boundary instead
      return createApolloClient(typeof window === 'undefined');
    }
  }, []);

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}

