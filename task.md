# Frontend Developer Technical Assessment

## Overview

Your task is to build a **"Team Directory"** feature that displays a **paginated, filterable list of team members**.

- **Estimated Time:** 6–10 hours (spread over 2–3 days)  
- **Difficulty:** Intermediate  
- **Goal:** Evaluate your ability to implement a production-quality feature following best practices in **React, Next.js, TypeScript, GraphQL, Zustand, and TanStack Table**.

---

## Design Guidelines

> **Note:** There is no Figma or design mockup provided.  
> **You** are responsible for implementing the **look and feel** of the feature.  
> Focus on creating a **clean, responsive, and user-friendly UI** using your judgment, while following the functional requirements outlined in this assessment.

---

## Repository Setup

1. **Fork this repository** to your own GitHub account.  
2. Implement the assessment in your fork.  
3. Ensure the project is **fully runnable** with either `npm` or `yarn`.  
4. Deliver a **GitHub repository** containing your completed work, including:
   - All implemented code
   - Updated README if necessary
   - Clear instructions to run the project  

> The deliverable should be a **URL of your forked repository** that can be cloned and run locally without additional setup.

**Do NOT clone this repository directly for submission.**  

---

## 1. Page & Routing (Next.js App Router)

- Create a new route at `/team-directory`  
- Implement a **responsive layout** (mobile-first)  
- Add **SEO metadata** using `next-intl`  

---

## 2. Data Layer (GraphQL + Apollo Client)

- Define a GraphQL query: `GET_TEAM_MEMBERS`  
  - Supports **pagination** (`page`, `limit`)  
  - Supports **filtering** by:
    - Role
    - Name search  
- Use Apollo Client with **TypeScript types**  

> **Note:** You can mock the data if a backend is unavailable.

---

## 3. State Management (Zustand)

Create a store that manages:

- Team members list  
- Active filters (`role`, `searchTerm`)  
- Pagination state (`currentPage`, `totalPages`)  

Include actions for:

- Updating filters  
- Updating pagination  
- Clearing filters

---

## 4. UI Components

### TeamMemberCard

- Shows: avatar, name, role, email  
- Includes a **hover state** with subtle animation  

### TeamFilters

- Search input (debounced 300 ms delay)  
- Role dropdown  
- “Clear filters” button  

### TeamTable (TanStack Table)

- Display team members in a **data table** using **TanStack Table v8**  
- Columns: **Avatar, Name, Role, Email**  
- Features:
  - **Sorting** by Name or Role  
  - **Pagination**  
  - **Filtering** by search term and role  
  - **Custom cell rendering** (e.g., avatar image, role badge)  
- Must remain **responsive**:
  - Horizontal scroll on small screens

### TeamGrid (Optional)

- Display team members as cards (grid layout)  
- Responsive:  
  - 1 column (mobile)  
  - 2 columns (tablet)  
  - 3 columns (desktop)  
- Shows loading skeletons while fetching  
- Empty state when no results  

---

## 5. Internationalization (next-intl)

Add translations to `en.json` and `ar.json`:

```json
{
  "teamDirectory": {
    "metadata": {
      "title": "Team Directory",
      "description": "Browse team members"
    },
    "filters": {
      "searchPlaceholder": "Search by name...",
      "roleFilter": "Filter by role",
      "clearFilters": "Clear all"
    },
    "emptyState": "No team members found",
    "loadMore": "Load more"
  }
}
```

## 6. Features to Implement

| Feature           | Description                               |
| ----------------- | ----------------------------------------- |
| Debounced search  | 300 ms delay before triggering filter     |
| Filter by role    | Admin, Agent, Creator                     |
| Pagination        | “Load More” button or table pagination    |
| Sorting           | Allow sorting by Name or Role             |
| Loading states    | Skeleton components while data is loading |
| Empty state       | Display when no results are found         |
| Responsive design | Mobile-first layout                       |
| TypeScript        | Strict typing throughout                  |
| Error handling    | Show user-friendly messages               |

## 7. Technical Constraints

- Use a component library (Radix / shadcn/ui) for UI elements
- Follow best practices in React, TypeScript, and Tailwind
- Implement proper loading states
- Use Tailwind CSS with RTL support
- Use TanStack Table v8 for tabular data display

### Mock Data

If no backend is available, create a mock hook:

export const useTeamMembers = (filters) => {
  // Return mock data matching GraphQL structure
  // Simulate loading and error states
};

## 8. Deliverables

- Forked/Cloned GitHub repository with all implemented work
- Working feature accessible at /team-directory
- Clean, well-typed TypeScript code
- Responsive UI (mobile & desktop)
- Proper i18n support (EN / AR)

### README describing:

- Approach
- Design decisions
- Any tradeoffs or known limitations

## 9. Evaluation Criteria

| Category       | Weight | Description                                                |
| -------------- | ------ | ---------------------------------------------------------- |
| Code Quality   | 40%    | TypeScript usage, component structure, reusability         |
| UI/UX          | 30%    | Responsive design, loading states, accessibility           |
| Best Practices | 20%    | State management, performance (debouncing), error handling |
| Integration    | 10%    | Clean architecture, proper use of utilities                |

10. Bonus Points (Optional)

- Unit tests for utility functions
- Keyboard navigation (accessibility)
- Transitions / animations using Framer Motion
- URL query params for filter persistence
- Ability to switch between grid and table views

## 11. Getting Started

```
# Using npm
npm install
npm run dev

# Or using yarn
yarn install
yarn dev

# Open http://localhost:3000 in your browser
```

## 12. Submission Instructions

- Push your completed work to your forked repository.
- Ensure the repository contains:
  - All code necessary to run the project locally
  - Updated README with any notes about your implementation
- Submit the GitHub repository link for evaluation.

## Good Luck!
