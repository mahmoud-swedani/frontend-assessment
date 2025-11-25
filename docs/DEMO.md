# Team Directory - Live Demo Guide

## 🌐 Live Application

**Live Demo URL**: [https://frontend-assessment-lime.vercel.app/](https://frontend-assessment-lime.vercel.app/)

The Team Directory application is deployed and accessible via the link above. This comprehensive guide will help you understand the application's features, architecture, and how to use it effectively.

---

## 📋 Table of Contents

1. [Application Overview](#application-overview)
2. [Key Features](#key-features)
3. [How to Use](#how-to-use)
4. [Architecture & Technologies](#architecture--technologies)
5. [Performance & Accessibility](#performance--accessibility)
6. [Browser Support](#browser-support)

---

## Application Overview

The Team Directory is a modern, production-ready web application designed to help teams browse, search, and manage team member information efficiently. Built with Next.js 16 and React 19, it provides a seamless user experience with advanced filtering, multiple view modes, and full internationalization support.

### What You'll Find

- **Home Page**: Welcome screen with feature highlights and navigation
- **Team Directory**: Main application page with full functionality
- **Multi-language Support**: English (LTR) and Arabic (RTL) layouts
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

---

## Key Features

### 🔍 Advanced Search

**Real-time Search with Debouncing**
- Search team members by name or email
- 300ms debounce delay for optimal performance
- Instant filtering as you type
- Keyboard shortcut: `Ctrl+K` (or `Cmd+K` on Mac) to focus search

**How to Use:**
1. Navigate to the Team Directory page
2. Use the search input at the top of the filters panel
3. Type any part of a team member's name or email
4. Results update automatically after 300ms of inactivity

### 🎯 Smart Filtering

**Role-based Filtering**
- Filter by role: Admin, Agent, or Creator
- Combine search and role filters for precise results
- Clear filters with a single click
- Filter state persisted in URL for shareable links

**How to Use:**
1. Click the "Filter by role" dropdown
2. Select a role (Admin, Agent, Creator, or "All Roles")
3. Combine with search for more specific results
4. Use "Clear filters" button to reset all filters

### 📊 Multiple View Modes

**Table View**
- Traditional table layout with sortable columns
- Columns: Avatar, Name, Role, Email
- Sort by Name or Role (ascending/descending)
- Pagination controls at the bottom
- Responsive: Horizontal scroll on mobile

**Grid View**
- Card-based layout for visual browsing
- Responsive grid: 1 column (mobile), 2 columns (tablet), 3+ columns (desktop)
- Same filtering and search capabilities
- "Load More" button for pagination

**How to Switch Views:**
1. Look for the view toggle buttons in the header
2. Click "Table" for tabular view or "Grid" for card view
3. Your preference is saved to localStorage

### 🌍 Internationalization

**Supported Languages:**
- **English (en)**: Default language, LTR layout
- **Arabic (ar)**: Full translation, RTL layout

**How to Switch Languages:**
1. Use the language selector in the navigation bar
2. Select "English" or "العربية" (Arabic)
3. The entire UI updates including layout direction

**RTL Support:**
- Automatic layout mirroring for Arabic
- Proper text direction and alignment
- RTL-optimized animations and transitions

### ♿ Accessibility Features

**WCAG 2.1 AA Compliant**
- Full keyboard navigation support
- Screen reader compatibility
- ARIA labels and roles throughout
- Focus management and visible focus indicators
- Semantic HTML structure
- Color contrast meets AA standards

**Keyboard Shortcuts:**
- `Tab` - Navigate between controls
- `Enter/Space` - Activate buttons and selects
- `Escape` - Clear search input
- `Ctrl+K` / `Cmd+K` - Focus search input

---

## How to Use

### Getting Started

1. **Access the Application**
   - Visit [https://frontend-assessment-lime.vercel.app/](https://frontend-assessment-lime.vercel.app/)
   - You'll land on the home page with feature highlights

2. **Navigate to Team Directory**
   - Click "View Team Directory" button on the home page
   - Or use the navigation menu to go directly to `/en/team-directory` or `/ar/team-directory`

3. **Explore Features**
   - Try searching for team members
   - Filter by different roles
   - Switch between table and grid views
   - Test the language switcher

### Common Workflows

**Finding a Specific Team Member:**
1. Use the search input to type their name or email
2. Results filter in real-time
3. Click on a team member card/row for more details (if implemented)

**Filtering by Role:**
1. Click the role filter dropdown
2. Select the desired role (Admin, Agent, Creator)
3. View filtered results
4. Combine with search for more specific filtering

**Switching Views:**
1. Use the view toggle in the header
2. Switch between Table and Grid views
3. Your preference is remembered for next visit

**Sharing Filtered Views:**
1. Apply your desired filters and search
2. Copy the URL from the address bar
3. Share the URL - filters are preserved in query parameters
4. Recipients will see the same filtered view

---

## Architecture & Technologies

### Frontend Stack

**Core Framework:**
- **Next.js 16.0.3** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5.7.3** - Type safety with strict mode

**State Management:**
- **Zustand 5.0.8** - Lightweight state management
- URL synchronization for shareable filter states
- LocalStorage persistence for user preferences

**Data Fetching:**
- **Apollo Client 4.0.9** - GraphQL client
- **GraphQL 16.12.0** - Query language
- Mock API fallback for development

**UI Components:**
- **Radix UI** - Accessible component primitives
- **shadcn-ui** - Customizable component library
- **TanStack Table 8.21.3** - Powerful table component

**Styling & Design:**
- **Tailwind CSS 4.0.0** - Utility-first CSS framework
- **Framer Motion 12.23.24** - Animation library
- **RTL Support** - Full right-to-left layout support

**Internationalization:**
- **next-intl 4.5.5** - i18n solution for Next.js
- Locale-based routing (`/en/`, `/ar/`)

### Key Architectural Decisions

**1. Server/Client Component Split**
- Server components for metadata and SEO
- Client components for interactivity
- Optimal performance and SEO

**2. Feature-based Organization**
- Components grouped by feature
- Clear separation of concerns
- Easy to maintain and scale

**3. URL-State Synchronization**
- Filter state in URL query parameters
- Shareable links with preserved filters
- Browser back/forward support

**4. Mock API Strategy**
- Separate mock hook for development
- Easy switching between mock and real API
- Enables frontend development without backend

---

## Performance & Accessibility

### Performance Optimizations

**Implemented:**
- Code splitting for optional features
- Memoization of expensive components
- Debounced search (300ms) to reduce API calls
- Optimized re-renders with Zustand selectors
- Image optimization with Next.js Image component
- Lazy loading for grid view

**Performance Targets:**
- Lighthouse Performance Score: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3s

### Accessibility Features

**WCAG 2.1 AA Compliance:**
- ✅ Keyboard navigation throughout
- ✅ Screen reader support with ARIA labels
- ✅ Focus management and visible indicators
- ✅ Color contrast meets AA standards
- ✅ Semantic HTML structure
- ✅ Error announcements for screen readers

**Testing:**
- Manual keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Automated accessibility testing in CI/CD

---

## Browser Support

### Supported Browsers

- **Chrome/Edge** (latest 2 versions) ✅
- **Firefox** (latest 2 versions) ✅
- **Safari** (latest 2 versions) ✅
- **Mobile browsers** (iOS Safari, Chrome Mobile) ✅

### Known Limitations

- Internet Explorer: Not supported
- Older browsers: May have reduced functionality

---

## Development & Testing

### Testing Strategy

**Unit Tests:**
- Vitest for utilities, hooks, and store
- 80%+ coverage target
- React Testing Library for components

**E2E Tests:**
- Cypress for end-to-end testing
- Tests for filtering, pagination, view switching
- Custom commands for common actions

**Accessibility Testing:**
- Manual keyboard navigation
- Screen reader testing
- Automated a11y checks

### Build & Deployment

**Build Process:**
- TypeScript type checking
- ESLint for code quality
- Automated build config validation
- Production-optimized bundle

**Deployment:**
- Deployed on Vercel
- Automatic deployments on push to main
- Preview deployments for pull requests

---

## Troubleshooting

### Common Issues

**Search not working:**
- Ensure you've typed at least one character
- Wait 300ms after typing (debounce delay)
- Check browser console for errors

**Filters not applying:**
- Clear browser cache
- Check URL for query parameters
- Try refreshing the page

**Language not switching:**
- Clear localStorage
- Check browser language settings
- Ensure JavaScript is enabled

---

## Additional Resources

- **Technical Documentation**: See [docs/TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md) for in-depth technical details
- **README**: See [README.md](./README.md) for setup and development instructions
- **Source Code**: Available in this repository

---

## Feedback & Support

For questions, issues, or feedback about the live demo:
- Check the technical documentation
- Review the README for setup instructions
- Open an issue in the repository

---

**Last Updated**: 2024-12-19

**Live Demo**: [https://frontend-assessment-lime.vercel.app/](https://frontend-assessment-lime.vercel.app/)

