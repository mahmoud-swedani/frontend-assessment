'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamFilters } from '@/components/team-directory/TeamFilters';
import { TeamTable } from '@/components/team-directory/TeamTable';
import { TeamGrid } from '@/components/team-directory/TeamGrid';
import { EmptyState } from '@/components/team-directory/EmptyState';
import { ErrorState } from '@/components/team-directory/ErrorState';
import { ViewToggle } from '@/components/team-directory/ViewToggle';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { useTeamMembersData } from '@/hooks/useTeamMembersData';
import { pageTransition, staggerContainer, staggerItem, slideUp, viewSwitch, viewMorph, getMotionScaleTransition } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast-store';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import type { TeamMemberRole } from '@/types/teamDirectory';

export function TeamDirectoryClient() {
  const t = useTranslations('teamDirectory');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const viewMode = useTeamDirectoryStore((state) => state.viewMode);
  const teamMembers = useTeamDirectoryStore((state) => state.teamMembers);
  const isLoading = useTeamDirectoryStore((state) => state.isLoading);
  const error = useTeamDirectoryStore((state) => state.error);
  const searchTerm = useTeamDirectoryStore((state) => state.searchTerm);
  const selectedRole = useTeamDirectoryStore((state) => state.selectedRole);
  const currentPage = useTeamDirectoryStore((state) => state.currentPage);
  const setSearchTerm = useTeamDirectoryStore((state) => state.setSearchTerm);
  const setSelectedRole = useTeamDirectoryStore((state) => state.setSelectedRole);
  const setCurrentPage = useTeamDirectoryStore((state) => state.setCurrentPage);

  // Scroll container ref for managing scroll position
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll restoration: Save and restore scroll position on navigation
  useScrollRestoration(scrollContainerRef, true);

  // Use unified hook that conditionally calls mock or real API
  const { refetch } = useTeamMembersData();

  /**
   * URL Synchronization Strategy
   * 
   * This component implements bidirectional sync between URL query params and Zustand store:
   * 1. On mount: Read URL params and initialize store (one-time, prevents loops)
   * 2. On store changes: Update URL params (after initialization, prevents loops)
   * 
   * We use two flags to prevent infinite loops:
   * - isInitialized: Tracks if we've read from URL (prevents re-reading)
   * - isSyncingRef: Prevents concurrent URL updates during router processing
   * 
   * Using Next.js router.replace() instead of window.history for:
   * - Better Next.js integration
   * - Proper handling of client-side navigation
   * - Avoids race conditions with Next.js router state
   */
  const [isInitialized, setIsInitialized] = useState(false);
  const isInitializingRef = useRef(false);
  const isSyncingRef = useRef(false);

  /**
   * Phase 1: Initialize store from URL params (runs once on mount)
   * 
   * Reads query parameters from URL and populates the Zustand store.
   * This only runs once to prevent infinite loops when we later sync
   * store changes back to the URL.
   * 
   * Also handles invalid URL parameters by detecting them, cleaning the URL,
   * and optionally showing a user-friendly notification.
   */
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized || isInitializingRef.current) return;
    
    isInitializingRef.current = true;
    const role = searchParams.get('role') as TeamMemberRole | null;
    const search = searchParams.get('search');
    const page = searchParams.get('page');

    // Track invalid parameters to clean up URL
    const invalidParams: string[] = [];
    const cleanParams = new URLSearchParams();

    // Validate and set role (only accept valid roles to prevent invalid state)
    const validRoles: TeamMemberRole[] = ['Admin', 'Agent', 'Creator'];
    if (role) {
      if (validRoles.includes(role)) {
        setSelectedRole(role);
        cleanParams.set('role', role);
      } else {
        invalidParams.push('role');
        // Log invalid role for debugging
        console.warn(`Invalid role parameter: "${role}". Valid roles are: ${validRoles.join(', ')}`);
      }
    }

    // Set search term if present in URL (sanitization handled in TeamFilters)
    if (search) {
      setSearchTerm(search);
      cleanParams.set('search', search);
    }

    // Validate and set page number (must be positive integer)
    if (page) {
      const parsedPage = parseInt(page, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        setCurrentPage(parsedPage);
        if (parsedPage > 1) {
          cleanParams.set('page', parsedPage.toString());
        }
      } else {
        invalidParams.push('page');
        // Log invalid page for debugging
        console.warn(`Invalid page parameter: "${page}". Must be a positive integer.`);
      }
    }

    // Clean up URL if invalid parameters were found
    if (invalidParams.length > 0) {
      const currentSearch = searchParams.toString();
      const newSearch = cleanParams.toString();
      
      // Only update URL if it actually changed
      if (currentSearch !== newSearch) {
        const newUrl = `${pathname}${newSearch ? `?${newSearch}` : ''}`;
        router.replace(newUrl, { scroll: false });
        
        // Show non-blocking toast notification
        toast({
          variant: 'warning',
          title: t('errors.invalidParams.title'),
          description: t('errors.invalidParams.message'),
          duration: 5000,
        });
      }
    }

    setIsInitialized(true);
    isInitializingRef.current = false;
  }, [searchParams, setSelectedRole, setSearchTerm, setCurrentPage, isInitialized, pathname, router, t]);

  /**
   * Phase 2: Sync store changes to URL params (runs after initialization)
   * 
   * When store state changes (filters, pagination), update the URL to reflect
   * the current state. This enables:
   * - Shareable URLs with filter state
   * - Browser back/forward navigation
   * - Bookmarking filtered views
   * 
   * Uses Next.js router.replace() to avoid adding history entries and
   * to properly integrate with Next.js navigation.
   * 
   * Uses async/await pattern with proper error handling to ensure the
   * isSyncingRef flag is always reset, even if router processing fails.
   */
  useEffect(() => {
    // Don't sync until we've initialized from URL (prevents overwriting URL during init)
    // Also prevent concurrent syncs to avoid race conditions
    if (!isInitialized || isSyncingRef.current) return;
    
    isSyncingRef.current = true;

    // Build new URL search params from current store state
    const params = new URLSearchParams();
    if (selectedRole) params.set('role', selectedRole);
    // Only include search parameter if it's a non-empty string (prevents ?search= in URL)
    if (searchTerm && searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    }
    // Only include page if > 1 (cleaner URLs)
    if (currentPage > 1) params.set('page', currentPage.toString());

    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    
    // Only update URL if it actually changed (prevents unnecessary router calls)
    if (newSearch !== currentSearch) {
      const newUrl = `${pathname}${newSearch ? `?${newSearch}` : ''}`;
      
      // Use async/await pattern with error handling to ensure flag always resets
      const updateUrl = async () => {
        try {
          await router.replace(newUrl, { scroll: false });
        } catch (error) {
          // Log error but don't throw - we still want to reset the flag
          console.error('Failed to update URL:', error);
        } finally {
          // Always reset flag, even if router.replace fails
          isSyncingRef.current = false;
        }
      };
      
      updateUrl();
    } else {
      // If URL didn't change, reset flag immediately
      isSyncingRef.current = false;
    }
  }, [searchTerm, selectedRole, currentPage, isInitialized, pathname, router, searchParams]);

  if (error) {
    return <ErrorState error={error} />;
  }

  const hasNoResults = !isLoading && teamMembers.length === 0;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="flex flex-col h-full overflow-hidden"
    >
      {/* Header - Fixed */}
      <motion.header
        variants={staggerItem}
        className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-6 pb-4 border-b border-primary/10 bg-background/95 backdrop-blur-sm z-10 relative overflow-hidden"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Parallax background layer */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            background: 'radial-gradient(ellipse at center, oklch(0.7 0.12 15) 0%, transparent 70%)',
            transform: 'translateZ(-10px) scale(1.1)',
          }}
        />
        {/* Gradient border with shimmer */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-50 z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/20 via-secondary/30 to-primary/20 animate-pulse z-10" style={{ animation: 'shimmer 3s ease-in-out infinite' }} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div variants={slideUp}>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight gradient-text-rose mb-2">
              {t('metadata.title')}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{t('metadata.description')}</p>
          </motion.div>
          <motion.div
            variants={slideUp}
            transition={{ delay: 0.1 }}
          >
            <ViewToggle />
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content - Flex container */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden px-4 sm:px-6 lg:px-8 py-4 min-h-0 relative">
        {/* Background patterns and gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Dot pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          {/* Morphing gradient mesh background */}
          <div className="absolute inset-0 morphing-gradient opacity-30" />
          {/* Ambient light effect - radial gradients at corners */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-secondary/5 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-accent/5 via-transparent to-transparent" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary/3 via-transparent to-transparent" />
        </div>
        {/* Filters - Sticky on tablet/desktop (md+), collapsible on mobile */}
        <motion.aside
          variants={staggerItem}
          className={cn(
            "flex-shrink-0",
            "md:w-80 md:sticky md:top-4 md:h-fit md:max-h-[calc(100vh-var(--navbar-height)-8rem)]",
            "md:overflow-y-auto md:overflow-x-hidden md:overscroll-contain",
            "w-full", // Mobile: full width
            "[contain:layout_style_paint]" // Performance optimization for scroll container
          )}
          style={{ contain: 'layout style paint' }}
          data-lenis-prevent // Prevent Lenis from affecting this nested scroll container
          aria-label={t('filters.searchLabel')}
        >
          <TeamFilters />
        </motion.aside>

        {/* Table/Grid - Direct content without scroll wrapper */}
        <motion.main
          ref={scrollContainerRef}
          variants={staggerItem}
          className="flex-1 min-h-0 flex flex-col relative z-10"
          aria-label="Team members list"
        >
          <AnimatePresence mode="wait">
            {hasNoResults ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={getMotionScaleTransition('small')}
                className="flex-1 flex items-center justify-center p-4"
              >
                <EmptyState />
              </motion.div>
            ) : (
              <motion.div
                key={viewMode}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={viewMorph}
                layout
                className="flex-1 min-h-0 flex flex-col w-full"
                layoutId={`view-container-${viewMode}`}
              >
                {viewMode === 'table' ? (
                  <TeamTable scrollContainerRef={scrollContainerRef} />
                ) : (
                  <TeamGrid scrollContainerRef={scrollContainerRef} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>
    </motion.div>
  );
}

