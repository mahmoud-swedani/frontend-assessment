# ✅ Frontend Developer Technical Assessment Submission: Team Directory Application

## 🌟 Overview

This repository contains my completed solution for the Frontend Developer Technical Assessment, focusing on the **Team Directory** feature. The application is built using modern **Next.js, TypeScript, Zustand, and TanStack Table**, demonstrating the ability to deliver a production-quality, paginated, filterable, and fully internationalized experience.

## 🌐 Live Demo

Explore the live application in action:

**👉 [Team Directory Live Demo](https://team-directory-delta.vercel.app/)**

## 📖 Documentation

**Quick Links:**

- **[📘 Documentation Guide](./docs/README.md)** - For full details, see the documentation README

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn

### Installation

This project is fully runnable after cloning the forked repository.

```bash
# 1. Clone the repository (using your fork URL)
git clone <repository-url>

# 2. Navigate to the project directory
cd <project-name>

# 3. Install dependencies
npm install
# or
yarn install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXT_PUBLIC_USE_MOCK_API=true
```

### Running the Application

The application defaults to the mock API for immediate use.

```bash
# Start development server
npm run dev
# or
yarn dev

# Run type checking
npm run type-check
# or
yarn type-check

# Run tests
npm run test
# or
yarn test

# Run E2E tests
npm run test:e2e
# or
yarn test:e2e
```

Visit:
- English: `http://localhost:3000/en/team-directory`
- Arabic: `http://localhost:3000/ar/team-directory`

---

## 💡 Technical Approach & Design Decisions

### 1. Architecture & Integration
- **Next.js App Router** for modern routing, server components, and SEO metadata via `next-intl`.
- **Mocked Data Layer** with `useTeamMembers` emulating GraphQL/Apollo Client, covering filtering, sorting, pagination, and error states.
- **Zustand Store** manages `activeFilters`, `paginationState`, and list data for decoupled state management.
- **TanStack Table v8** powers the tabular experience with custom cells (avatar, role badge), sorting, and pagination controls.

### 2. UI/UX Decisions
- **shadcn/ui (Radix)** components provide WCAG 2.1 AA accessible primitives styled with Tailwind.
- **Responsive/mobile-first** layout; the table supports horizontal scroll on narrow screens to preserve data density.
- **300 ms debounced search** improves perceived performance and avoids unnecessary rerenders.
- **Full i18n support** for English (LTR) and Arabic (RTL) via `next-intl` and Tailwind RTL configuration.

### 3. Tradeoffs & Known Limits
- **Client-side mock logic** handles filtering/sorting/pagination until a real GraphQL endpoint is available; implementation is isolated for easy replacement.
- **Testing focus** prioritized core utilities and hooks; not every UI surface has exhaustive unit coverage yet.

---

## 🏆 Advanced / Bonus Features

- **Dual View Modes:** Table view plus optional responsive card grid.
- **URL Query Params:** Persist filters and pagination for shareable links.

---

## 🔒 Tech Stack Highlights

| Category            | Technology                    |
|---------------------|--------------------------------|
| Framework           | Next.js (App Router)          |
| State Management    | Zustand                       |
| Table Library       | TanStack Table v8             |
| UI Components       | Radix UI / shadcn/ui          |
| Styling             | Tailwind CSS with RTL support |
| Internationalization| next-intl                     |

---

## 📚 Additional Resources

- **[Demo Guide](./docs/DEMO.md)** - Complete user guide and feature walkthrough
- **[Technical Documentation](./docs/README.md)** - Architecture, testing, deployment, and best practices
- **[Project Overview](./docs/01_PROJECT_OVERVIEW.md)** - Business context, user roles, and setup
- **[Frontend Architecture](./docs/02_ARCHITECTURE_FE.md)** - Code structure and patterns
- **[API & Data Layer](./docs/03_API_AND_DATA.md)** - GraphQL schema and data fetching
- **[Testing & QA](./docs/04_TESTING_QA.md)** - Testing strategy and results
- **[Best Practices](./docs/05_CONVENTIONS.md)** - Code conventions and contribution guide
- **[Deployment & Operations](./docs/06_DEPLOYMENT_OPS.md)** - CI/CD and production setup

---

## 📄 Submission Instructions

1. Push all code and this updated `README.md` to your fork.
2. Submit the GitHub repository link for evaluation.

Good Luck! 🚀