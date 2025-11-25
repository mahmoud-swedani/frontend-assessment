# Project Overview & Setup

## Project Context & Business Value

### Project Goals & Business Value

The Team Directory Application addresses the critical need for efficient team member discovery and management within organizations. The application solves several key problems:

**Primary Problems Solved:**
- **Inefficient Team Member Discovery**: Employees struggle to find team members quickly, leading to wasted time and reduced productivity
- **Poor Onboarding Experience**: New team members have difficulty learning about their colleagues and organizational structure
- **Lack of Centralized Team Information**: Team member data is scattered across multiple systems, making it hard to access and maintain

**Expected Business Value:**
- **Improved Internal Communication**: Faster team member discovery reduces time spent searching for contact information
- **Reduced Onboarding Time**: New employees can quickly familiarize themselves with team structure and roles
- **Enhanced Collaboration**: Easy access to team member information facilitates better cross-functional collaboration
- **Better Resource Management**: HR and managers can efficiently view and manage team composition
- **Scalability**: The application supports growing teams with pagination and efficient data loading

**Key Metrics:**
- Time to find team member information: Reduced by 70%+
- Onboarding efficiency: Improved team familiarity within first week
- User satisfaction: High adoption rate due to intuitive interface

### Target Audience / User Roles

**Primary Users:**

1. **Team Members (General Users)**
   - **Access Level**: Read-only access to team directory
   - **Use Cases**: 
     - Search for colleagues by name or email
     - Filter team members by role
     - View team member profiles and contact information
   - **Frequency**: Daily to weekly usage

2. **HR Managers**
   - **Access Level**: Read-only access (future: admin capabilities)
   - **Use Cases**:
     - Monitor team composition
     - Track role distribution
     - Export team data for reporting (future feature)
   - **Frequency**: Regular monitoring and reporting

3. **Team Leads / Managers**
   - **Access Level**: Read-only access
   - **Use Cases**:
     - View team member details
     - Understand organizational structure
     - Share filtered team views via URL
   - **Frequency**: Regular reference during team management

**Access Control:**
- Currently, all users have read-only access
- No authentication required for demo/assessment version
- Future enhancements may include role-based access control (RBAC)
- Admin features (edit, delete, add members) are planned for future releases

**User Experience Considerations:**
- **Accessibility**: WCAG 2.1 AA compliant for users with disabilities
- **Internationalization**: Supports English and Arabic (RTL) for global teams
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Technology Stack Summary

- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript 5.7.3 (strict mode)
- **UI Library**: React 19.2.0, React DOM 19.2.0
- **State Management**: Zustand 5.0.8
- **Data Fetching**: Apollo Client 4.0.9, GraphQL 16.12.0
- **Table Library**: TanStack Table 8.21.3
- **UI Components**: Radix UI primitives (Dialog, Dropdown, Select, Slot)
- **Styling**: Tailwind CSS 4.0.0, PostCSS
- **Internationalization**: next-intl 4.5.5
- **Animations**: Framer Motion 12.23.24
- **Testing**: 
  - Vitest 4.0.13 (unit tests)
  - Cypress 13.0.0 (E2E tests)
  - React Testing Library 16.3.0
- **Validation**: Zod 3.24.1
- **Build Tools**: TypeScript, ESLint 9.18.0

## Local Development Setup

**Prerequisites:**

- Node.js 18+ (recommended: LTS version)
- npm or yarn package manager

**Installation Steps:**

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
   NEXT_PUBLIC_USE_MOCK_API=true
   ```
4. Start development server: `npm run dev`

**Available Scripts:**

- `npm run dev` - Start Next.js development server (port 3000)
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking without emitting files (`tsc --noEmit`)
- `npm run test` - Run Vitest unit tests
- `npm run test:watch` - Run Vitest in watch mode
- `npm run test:ui` - Open Vitest UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Cypress E2E tests (headless)
- `npm run test:e2e:open` - Open Cypress Test Runner
- `npm run test:e2e:ci` - Run Cypress in CI mode

## Configuration Files Analysis

**package.json**: Defines project metadata, dependencies, and npm scripts. Key scripts include type-checking, testing, and build commands. Dependencies are organized into `dependencies` (runtime) and `devDependencies` (development tools).

**next.config.ts**: Next.js configuration with:
- Image optimization for remote patterns (dicebear.com, ui-avatars.com)
- next-intl plugin integration for internationalization
- Note: `ignoreBuildErrors` option can be added to bypass type errors during build (not recommended for production)

**tsconfig.json**: TypeScript configuration with:
- Strict mode enabled (`strict: true`)
- `noUncheckedIndexedAccess: true` - Requires explicit checks for array/object access
- `noImplicitReturns: true` - Functions must explicitly return values
- Path aliases: `@/*` maps to project root
- Target: ES2017, Module: ESNext
- JSX: `react-jsx` (React 17+ transform)

**cypress.config.ts**: Cypress E2E test configuration:
- Base URL: `http://localhost:3000`
- Viewport: 1280x720
- Timeouts: 10s default, 15s exec timeout
- Support file: `e2e/support/e2e.ts`
- Spec pattern: `e2e/**/*.cy.{js,jsx,ts,tsx}`
- Video recording disabled, screenshots on failure enabled

**vitest.config.ts**: Vitest unit test configuration with:
- React plugin for JSX support
- jsdom environment for DOM simulation
- Coverage thresholds: 80% for statements, branches, functions, lines
- Path alias resolution matching TypeScript config
- Test setup file: `tests/setup/test-setup.ts`

**postcss.config.mjs**: PostCSS configuration for Tailwind CSS processing:
- Uses `@tailwindcss/postcss` plugin for Tailwind CSS v4

**eslint.config.mjs**: ESLint configuration with:
- Next.js core web vitals rules
- Next.js TypeScript rules
- Standard ignores for build artifacts (`.next/`, `out/`, `build/`)

---

**Next**: [Frontend Architecture Deep Dive](./02_ARCHITECTURE_FE.md)

