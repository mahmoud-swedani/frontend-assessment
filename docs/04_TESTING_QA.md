# Testing and Quality Assurance

## Testing Strategy

**Multi-layered Testing Approach:**

1. **Unit Tests** (Vitest): Utilities, hooks, store logic (90%+ coverage target)
2. **Component Tests** (Vitest + React Testing Library): Component behavior and rendering
3. **E2E Tests** (Cypress): User workflows, filtering, pagination, view switching

**Test File Organization:**

- Unit tests: `__tests__/` directory mirroring source structure
- E2E tests: `e2e/` directory with feature-based test files
- Test utilities: `tests/setup/` for shared test configuration

**Coverage Targets:**

- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

## Test Results Summary

**Current Test Status**: ✅ All tests passing

**Overall Statistics:**
- **Test Files**: 17 passed (17)
- **Total Tests**: 133 passed (133)
- **Success Rate**: 100%

**Test Breakdown by Category:**

**Component Tests** (8 files, 55 tests)
- `__tests__/components/team-directory/TeamTable.test.tsx` - 8 tests
- `__tests__/components/team-directory/RoleFilter.test.tsx` - 4 tests
- `__tests__/components/team-directory/TeamFilters.test.tsx` - 7 tests
- `__tests__/components/team-directory/SearchInput.test.tsx` - 8 tests
- `__tests__/components/team-directory/ViewToggle.test.tsx` - 6 tests
- `__tests__/components/team-directory/TeamGrid.test.tsx` - 7 tests
- `__tests__/components/team-directory/EmptyState.test.tsx` - 7 tests
- `__tests__/components/team-directory/ErrorState.test.tsx` - 7 tests
- `__tests__/components/team-directory/TeamMemberCard.test.tsx` - 8 tests

**Hook Tests** (3 files, 20 tests)
- `__tests__/hooks/useDebounce.test.ts` - 6 tests
- `__tests__/hooks/useTeamMembersMock.test.ts` - 11 tests
- `__tests__/hooks/useTeamMembersData.test.ts` - 3 tests

**Store Tests** (1 file, 17 tests)
- `__tests__/stores/teamDirectoryStore.test.ts` - 17 tests

**Utility Tests** (1 file, 11 tests)
- `__tests__/utils/generateMockData.test.ts` - 11 tests

**Integration Tests** (2 files, 15 tests)
- `tests/integration/teamDirectoryFlow.test.tsx` - 7 tests
- `tests/integration/storeHookIntegration.test.tsx` - 8 tests

**Library Tests** (1 file, 8 tests)
- `__tests__/lib/utils.test.ts` - 8 tests

**Test Coverage:**
- All critical components have comprehensive test coverage
- Store logic fully tested with 17 test cases
- Hooks tested for various scenarios including edge cases
- Integration tests verify end-to-end workflows
- Utility functions have complete test coverage

## E2E Test Analysis (Cypress)

**Test Suite Overview:**

- **Location**: `e2e/filtering.cy.ts`, `e2e/pagination.cy.ts`, `e2e/team-directory.cy.ts`
- **Custom Commands**: Defined in `e2e/support/commands.ts`
  - `cy.searchTeamMembers(query)` - Search with debounce wait
  - `cy.filterByRole(role)` - Filter by role with dropdown handling
  - `cy.clearFilters()` - Clear all filters
  - `cy.clearRoleFilter()` - Clear role filter specifically

**Failing Test: "should handle rapid filter changes"**

**Test Location**: `e2e/filtering.cy.ts:169-200`

**Test Behavior:**

- Rapidly types "John" → "Jane" → "Bob" in search input
- Uses `{selectAll}` to avoid intermediate debounce triggers
- Waits for URL to update with `search=Bob`
- Expects either results or empty state to appear

**Root Cause Analysis: Cypress Synchronization Issues**

**Problem**: The test fails due to **debounce/API race conditions** when filters change rapidly:

1. **Debounce Timing**: 300ms debounce delay means rapid changes can queue multiple debounced updates
2. **API Call Race Conditions**: Multiple API calls may be in-flight simultaneously
3. **State Update Timing**: Store updates and URL synchronization happen asynchronously
4. **Fixed Waits Are Brittle**: Using `cy.wait(800)` doesn't guarantee UI is in a stable state

**Technical Explanation:**

- When user types rapidly: "John" (debounce starts) → "Jane" (debounce resets) → "Bob" (debounce resets)
- Each debounce triggers a store update → URL sync → API call
- If API calls complete out of order, stale data may display
- The test's fixed `cy.wait()` may check UI before the final API call completes
- The debounce mechanism cancels previous timers, but API calls already in-flight may complete after newer ones

**Recommended Robust Fix:**

Instead of fixed `cy.wait()`, use **explicit waiting for non-volatile UI state**:

```typescript
it('should handle rapid filter changes', () => {
  // Rapidly change filters
  cy.get('input[placeholder*="Search"]').type('{selectAll}John');
  cy.get('input[placeholder*="Search"]').type('{selectAll}Jane');
  cy.get('input[placeholder*="Search"]').type('{selectAll}Bob');
  
  // Verify input has correct value
  cy.get('input[placeholder*="Search"]').should('have.value', 'Bob');
  
  // Wait for URL to update (confirms debounce processed)
  cy.url({ timeout: 5000 }).should('include', 'search=Bob');
  
  // Wait for loading state to disappear (non-volatile UI state)
  cy.get('[data-testid="loading-skeleton"], [aria-busy="true"]').should('not.exist', { timeout: 10000 });
  
  // Wait for either results or empty state (stable final state)
  cy.get('body', { timeout: 10000 }).should(($body) => {
    const hasResults = $body.find('tbody tr, [role="article"]').length > 0;
    const hasEmptyState = $body.text().includes('No team members found');
    expect(hasResults || hasEmptyState).to.be.true;
  });
});
```

**Key Improvements:**

1. **Wait for Loading State Disappearance**: Ensures API call completed
2. **Check for Stable Final State**: Results or empty state (not loading)
3. **No Fixed Waits**: All waits are conditional on UI state
4. **Timeout Configuration**: Reasonable timeouts (10s) for slow networks

**Alternative Approach (More Robust):**

- Add `data-testid="team-members-loaded"` to the results container
- Set this attribute only after data fetch completes and renders
- Wait for this attribute instead of checking DOM content
- This provides a more reliable synchronization point

## Type Checking & Build Errors

**Type Checking Script:**

- **Command**: `npm run type-check` → `tsc --noEmit`
- **Purpose**: Type checking without emitting JavaScript files
- **Why It Stops at First Error**: TypeScript's default behavior is to report all errors, but the build process (`next build`) stops at the first error to prevent invalid builds

**Build Process:**

- `next build` runs TypeScript compilation
- Type errors cause build to fail immediately
- This prevents deploying broken code
- Type checking is separate from build, allowing developers to check types without building

**Ref Object Typing Issue:**

**Problem**: TypeScript requires explicit typing for ref objects, especially with React 19's stricter types.

**Example Error Pattern:**

```typescript
// ❌ Error: Type 'MutableRefObject<null>' is not assignable
const ref = useRef(null);

// ✅ Correct: Explicitly type the ref
const ref = useRef<HTMLDivElement>(null);
```

**Best Practice:**

- Always provide explicit generic type for `useRef<T>(null)`
- Use `HTMLInputElement`, `HTMLDivElement`, etc. based on target element
- For callback refs, use `RefCallback<T>` type
- This prevents runtime errors and improves type safety

**ignoreBuildErrors Option:**

**Location**: `next.config.ts`

**Usage** (not recommended for production):

```typescript
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Bypasses type checking
  },
};
```

**When to Use:**

- Temporary workaround during migration
- Prototyping phase
- **Never in production** - defeats purpose of TypeScript

**Recommended Approach:**

- Fix type errors properly
- Use `@ts-expect-error` with comments for known issues
- Gradually improve type coverage
- Run `npm run type-check` before committing

**Automated Protection:**

The project includes an automated check to prevent `ignoreBuildErrors` from being deployed:

- **Script**: `scripts/check-build-config.js` - Scans `next.config.ts` for `ignoreBuildErrors: true`
- **Pre-build Hook**: Automatically runs before every build (`prebuild` npm hook)
- **Pre-publish Hook**: Runs before publishing to npm (`prepublishOnly` hook)
- **Manual Check**: Run `npm run check:build-config` anytime
- **CI/CD Integration**: GitHub Actions workflow includes this check (`.github/workflows/ci.yml`)

If `ignoreBuildErrors` is detected, the build fails with a clear error message, preventing accidental deployment of code with disabled type checking.

---

**Next**: [Best Practices and Conventions](./05_CONVENTIONS.md) | **Previous**: [API & Data Layer (GraphQL)](./03_API_AND_DATA.md)

