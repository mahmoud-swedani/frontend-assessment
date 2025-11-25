# Best Practices and Conventions

## Conventions

**File Naming:**

- **Components**: PascalCase (`TeamDirectoryClient.tsx`)
- **Hooks**: camelCase with `use` prefix (`useDebounce.ts`)
- **Utilities**: camelCase (`generateMockData.ts`)
- **Types**: camelCase (`teamDirectory.ts`)
- **Constants**: UPPER_SNAKE_CASE or camelCase (context-dependent)
- **Test Files**: Match source file name with `.test.ts` or `.spec.ts` suffix

**Component Structure:**

- **Server Components**: Default export, async if needed, metadata generation
- **Client Components**: `'use client'` directive, named exports
- **Component Organization**: 
  - Props interface at top
  - Hooks (state, effects)
  - Event handlers
  - Render logic
  - Sub-components at bottom if needed

**Import Order:**

1. React/Next.js imports
2. Third-party libraries
3. Internal components
4. Hooks and utilities
5. Types
6. Styles/constants

**Code Style:**

- TypeScript strict mode enabled
- ESLint with Next.js config
- Prefer functional components
- Use hooks for state and side effects
- Memoization for expensive computations
- Consistent formatting (handled by ESLint/Prettier if configured)

## Key Learnings/Known Issues

**1. Ref Object Typing Requirement**

- **Issue**: React 19 + TypeScript strict mode requires explicit ref typing
- **Solution**: Always type refs: `useRef<HTMLElementType>(null)`
- **Example**: `const scrollRef = useRef<HTMLDivElement>(null);`
- **Impact**: Prevents runtime errors and improves type safety
- **Common Error**: `Type 'MutableRefObject<null>' is not assignable to type 'RefObject<HTMLElement>'`

**2. ignoreBuildErrors Usage**

- **Purpose**: Bypass TypeScript errors during build (development only)
- **Risk**: Can hide real type errors, leading to runtime bugs
- **Best Practice**: Fix errors properly, use only as temporary workaround
- **Configuration**: Add to `next.config.ts` under `typescript.ignoreBuildErrors`
- **Alternative**: Use `@ts-expect-error` with explanatory comments for specific known issues

**3. Cypress Synchronization with Debounced Inputs**

- **Issue**: Fixed `cy.wait()` is brittle with async debounce + API calls
- **Solution**: Wait for non-volatile UI states (loading → loaded, URL updates)
- **Pattern**: Check for loading state disappearance, then verify final state
- **Best Practice**: Use data-testid attributes for reliable element selection
- **Common Pitfall**: Assuming fixed delays are sufficient for async operations

**4. URL-Store Synchronization**

- **Challenge**: Preventing infinite loops between URL params and store updates
- **Solution**: Use refs (`isInitialized`, `isSyncingRef`) to track sync state
- **Pattern**: One-way initialization from URL, then store → URL updates
- **Implementation**: Two-phase approach in `TeamDirectoryClient.tsx`
- **Key Insight**: Separate initialization phase from update phase prevents circular updates

**5. Apollo Client with Next.js App Router**

- **Note**: Uses experimental package `@apollo/experimental-nextjs-app-support`
- **Tradeoff**: May have breaking changes, but provides best SSR support
- **Fallback**: Client-side provider ensures compatibility
- **Consideration**: Monitor for stable release and migration path

**6. Zustand Persistence**

- **Pattern**: Only persist non-sensitive UI preferences (viewMode, pageSize)
- **Avoid**: Don't persist data arrays or filter state (use URL instead)
- **Rationale**: Data should come from API, filters should be shareable via URL
- **Implementation**: Uses `partialize` option to select which state to persist

**7. Mock API Strategy**

- **Approach**: Separate mock hook that simulates real API behavior
- **Benefit**: Enables development without backend
- **Limitation**: Doesn't test actual GraphQL integration
- **Best Practice**: Keep mock behavior aligned with real API structure
- **Switching**: Controlled via `NEXT_PUBLIC_USE_MOCK_API` environment variable

**8. Debounce Implementation**

- **Delay**: 300ms (industry standard for search)
- **Location**: `hooks/useDebounce.ts` (reusable hook)
- **Usage**: Local input state → debounced value → store update
- **Testing**: Account for debounce delay in E2E tests
- **Pattern**: Use `useDebounce` hook to delay expensive operations

**9. Error Handling Strategy**

- **Error Boundary**: Catches component errors at route level
- **Error State**: Displayed via `ErrorState` component with retry functionality
- **Error Types**: Network, server, and unknown errors handled differently
- **User Experience**: User-friendly error messages with retry options
- **Logging**: Errors logged to console (can be extended to error tracking service)

**10. Performance Optimization Patterns**

- **Memoization**: `React.memo` for expensive components, `useMemo` for computed values
- **Code Splitting**: Dynamic imports for optional features (grid view)
- **Selective Re-renders**: Zustand selectors prevent unnecessary updates
- **Image Optimization**: Next.js Image component with fallbacks
- **Scroll Optimization**: Lenis smooth scroll with performance considerations

## Contribution Guide

**Code Review Process:**

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Development Standards**:
   - Follow TypeScript strict mode guidelines
   - Write tests for new features
   - Ensure all tests pass: `npm run test`
   - Run type checking: `npm run type-check`
   - Run linter: `npm run lint`
   - Check build config: `npm run check:build-config`

3. **Commit Messages**:
   - Use conventional commit format
   - Examples:
     - `feat: add user profile page`
     - `fix: resolve pagination bug`
     - `docs: update API documentation`
     - `test: add unit tests for search component`

4. **Pull Request Requirements**:
   - **Title**: Clear, descriptive title
   - **Description**: 
     - What changes were made
     - Why the changes were necessary
     - How to test the changes
   - **Checklist**:
     - [ ] All tests pass
     - [ ] Type checking passes
     - [ ] Linting passes
     - [ ] Build succeeds
     - [ ] Code follows project conventions
     - [ ] Documentation updated (if needed)

5. **Review Process**:
   - At least one approval required
   - All CI checks must pass
   - Address review comments
   - Keep PR focused (one feature/fix per PR)

6. **Merge Process**:
   - Squash and merge (preferred) or rebase and merge
   - Delete feature branch after merge
   - Update documentation if needed

**Code Style Guidelines:**

- Follow existing code patterns
- Use TypeScript strict mode
- Write self-documenting code with clear variable names
- Add comments for complex logic
- Keep functions small and focused
- Use ESLint and Prettier (if configured)

**Testing Requirements:**

- New features must include tests
- Maintain 80%+ test coverage
- Include unit tests for utilities and hooks
- Include component tests for UI components
- Update E2E tests for user-facing changes

## Internationalization (I18n) Details

**Localization File Structure:**

Translation files are stored in the `messages/` directory:

```
messages/
├── en.json    # English translations
└── ar.json    # Arabic translations
```

**File Format:**

Each translation file follows a nested JSON structure:

```json
{
  "nav": {
    "brand": "Team Directory",
    "home": "Home"
  },
  "teamDirectory": {
    "metadata": {
      "title": "Team Directory",
      "description": "Browse and manage team members"
    },
    "filters": {
      "searchPlaceholder": "Search by name or email...",
      "roleFilter": "Filter by role"
    }
  }
}
```

**Adding a New Language:**

1. **Create Translation File**:
   ```bash
   # Create new locale file
   touch messages/fr.json  # Example: French
   ```

2. **Add Locale to Routing Configuration**:
   Edit `i18n/routing.ts`:
   ```typescript
   export const routing = defineRouting({
     locales: ['en', 'ar', 'fr'], // Add new locale
     defaultLocale: 'en'
   });
   ```

3. **Update Static Params**:
   Edit `app/[locale]/layout.tsx`:
   ```typescript
   export function generateStaticParams() {
     return [{ locale: 'en' }, { locale: 'ar' }, { locale: 'fr' }];
   }
   ```

4. **Translate Content**:
   - Copy structure from `en.json`
   - Translate all values to new language
   - Maintain same JSON structure
   - Test RTL support if needed (for RTL languages)

5. **Test Locale**:
   ```bash
   npm run dev
   # Navigate to /fr/team-directory
   ```

**Translation Best Practices:**

- **Use Namespaces**: Organize translations by feature/page
- **Keep Keys Descriptive**: Use clear, hierarchical keys
- **Avoid Hardcoded Text**: All user-facing text should be translatable
- **Context Matters**: Provide context for translators in comments (if supported)
- **RTL Support**: For RTL languages (Arabic, Hebrew), ensure proper layout mirroring
- **Pluralization**: Use proper pluralization rules for each language
- **Date/Time Formatting**: Use locale-aware formatting with `date-fns` or similar

**RTL Language Support:**

For right-to-left languages (e.g., Arabic):

1. **Layout Configuration**:
   - Tailwind CSS automatically handles RTL with `dir="rtl"`
   - Use logical properties (`start`, `end` instead of `left`, `right`)

2. **Conditional Styling**:
   ```typescript
   const isRTL = locale === 'ar';
   className={cn('ms-4', isRTL && 'me-4')}
   ```

3. **Testing RTL**:
   - Test all UI components in RTL mode
   - Verify text alignment
   - Check icon and image positioning
   - Validate form layouts

**Current Supported Locales:**

- **English (en)**: Default, LTR
- **Arabic (ar)**: Full translation, RTL

**Translation Maintenance:**

- Review translations regularly
- Update translations when UI changes
- Use translation management tools for large teams
- Keep translation files in sync with code changes

---

**Next**: [Deployment and Operations](./06_DEPLOYMENT_OPS.md) | **Previous**: [Testing and Quality Assurance](./04_TESTING_QA.md)

