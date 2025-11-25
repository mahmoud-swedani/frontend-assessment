# Frontend Architecture Deep Dive

## Structure and Layers

**Folder Organization (Feature-based):**

```
team-directory/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Locale-based routing (en, ar)
│   │   ├── layout.tsx           # Locale layout with providers
│   │   ├── page.tsx             # Home page
│   │   └── team-directory/
│   │       ├── page.tsx         # Server component (metadata)
│   │       └── TeamDirectoryClient.tsx  # Client component
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn-ui base components
│   ├── team-directory/         # Feature-specific components
│   ├── providers/              # Context providers (Apollo, SmoothScroll)
│   └── ErrorBoundary.tsx       # Error boundary
├── stores/
│   └── teamDirectoryStore.ts   # Zustand store (single source of truth)
├── hooks/
│   ├── useTeamMembers.ts       # Apollo GraphQL hook
│   ├── useTeamMembersMock.ts   # Mock data hook
│   ├── useTeamMembersData.ts   # Unified hook (conditional)
│   └── useDebounce.ts          # Debounce utility (300ms)
├── graphql/
│   └── queries/
│       └── teamMembers.ts      # GraphQL query definition
├── types/
│   └── teamDirectory.ts        # TypeScript type definitions
├── lib/
│   ├── config.ts              # Environment configuration
│   ├── schemas/               # Zod validation schemas
│   └── utils.ts               # Utility functions
├── e2e/                       # Cypress E2E tests
│   ├── filtering.cy.ts        # Filter tests
│   ├── pagination.cy.ts      # Pagination tests
│   └── team-directory.cy.ts  # Main feature tests
└── __tests__/                 # Vitest unit tests
```

**Component Organization Logic:**

- **Feature-based**: Team directory components grouped in `components/team-directory/`
- **Reusable UI**: Base components in `components/ui/` (shadcn-ui pattern)
- **Server/Client Split**: Server components for metadata, client components for interactivity
- **Separation of Concerns**: Hooks for logic, stores for state, components for presentation

## State Management

**Global State (Zustand Store):**

- **Location**: `stores/teamDirectoryStore.ts`
- **State Structure**:
  - Data: `teamMembers[]`, `totalCount`, `pagination`
  - Filters: `searchTerm`, `selectedRole`
  - Pagination: `currentPage`, `pageSize`
  - Sorting: `sortBy`, `sortOrder`
  - UI: `isLoading`, `error`, `viewMode`
- **Persistence**: `viewMode` and `pageSize` persisted to localStorage via Zustand's `persist` middleware
- **Actions**: All state updates go through store actions (single source of truth)
- **DevTools**: Zustand DevTools enabled in development for debugging

**Component State:**

- Local UI state (e.g., drawer open/closed) managed with `useState`
- Form inputs use controlled components synced with Zustand store
- Debounced search: Local input state → debounced value → store update

**Form State:**

- Search input: Local state → 300ms debounce → Zustand store
- Role filter: Direct store update via select component
- URL synchronization: Bidirectional sync between URL params and store

## Routing Strategy

**Next.js App Router with Locale-based Routing:**

- **Pattern**: `app/[locale]/team-directory/page.tsx`
- **Locales**: `en` (default), `ar` (RTL support)
- **Internationalization**: next-intl handles locale detection and routing
- **URL Structure**: 
  - `/en/team-directory` (English)
  - `/ar/team-directory` (Arabic, RTL)
- **Query Parameters**: Filter state persisted in URL (`?search=John&role=Admin&page=2`)
- **Dynamic Segments**: Locale is a dynamic segment, enabling i18n routing

**URL Synchronization:**

- **Bidirectional Sync**: URL ↔ Zustand store
- **Initialization**: On mount, read URL params and populate store (one-time)
- **Updates**: Store changes update URL via `router.replace()` (prevents history pollution)
- **Race Condition Prevention**: Uses refs (`isInitialized`, `isSyncingRef`) to prevent loops
- **Implementation**: Located in `TeamDirectoryClient.tsx` with two-phase approach:
  1. Phase 1: Initialize store from URL (runs once)
  2. Phase 2: Sync store changes to URL (runs after initialization)

---

**Next**: [API & Data Layer (GraphQL)](./03_API_AND_DATA.md) | **Previous**: [Project Overview & Setup](./01_PROJECT_OVERVIEW.md)

