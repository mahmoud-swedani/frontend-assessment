'use client';

import { useMemo, memo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import type { TeamMember } from '@/types/teamDirectory';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from './LoadingSkeleton';
import { TeamTableMobileCard } from './TeamTableMobileCard';
import { useTeamDirectoryStore } from '@/stores/teamDirectoryStore';
import { ROLE_COLORS } from '@/lib/constants';
import { staggerItem, fadeIn, hoverScale, SPRING, rowAppear, staggerTable, getMotionScaleTransition, getEasing } from '@/lib/animations';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useFadeInOnScroll } from '@/hooks/useScrollAnimation';
import { useAvailableHeight } from '@/hooks/useAvailableHeight';
import { SparkleEffect } from '@/components/ui/sparkle-effect';
import { cn } from '@/lib/utils';

// Memoized cell components (compact version)
const AvatarCell = memo(({ avatar, name, rowIndex = 0 }: { avatar: string | null; name: string; rowIndex?: number }) => (
  <div className="flex items-center">
    {avatar ? (
      <Image
        src={avatar}
        alt={`${name}'s avatar`}
        width={32}
        height={32}
        className="rounded-full"
        unoptimized={avatar.includes('dicebear.com')}
        loading={rowIndex < 10 ? 'eager' : 'lazy'}
      />
    ) : (
      <div className="w-8 h-8 rounded-full bg-gradient-rose-lavender/10 flex items-center justify-center text-xs font-semibold text-primary shadow-soft">
        {name.charAt(0).toUpperCase()}
      </div>
    )}
  </div>
));

AvatarCell.displayName = 'AvatarCell';

const RoleCell = memo(({ role }: { role: TeamMember['role'] }) => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.span
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileFocus={prefersReducedMotion ? {} : { scale: 1.02 }}
      transition={SPRING.gentle}
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium shadow-soft',
        'hover:shadow-medium hover:border-2 hover:border-primary/30 transition-all',
        ROLE_COLORS[role]
      )}
    >
      {role}
    </motion.span>
  );
});

RoleCell.displayName = 'RoleCell';

interface TeamTableProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function TeamTable({ scrollContainerRef }: TeamTableProps) {
  const t = useTranslations('teamDirectory');
  const teamMembers = useTeamDirectoryStore((state) => state.teamMembers);
  const isLoading = useTeamDirectoryStore((state) => state.isLoading);
  const currentPage = useTeamDirectoryStore((state) => state.currentPage);
  const pageSize = useTeamDirectoryStore((state) => state.pageSize);
  const pagination = useTeamDirectoryStore((state) => state.pagination);
  const sortBy = useTeamDirectoryStore((state) => state.sortBy);
  const sortOrder = useTeamDirectoryStore((state) => state.sortOrder);
  const setSorting = useTeamDirectoryStore((state) => state.setSorting);
  const setCurrentPage = useTeamDirectoryStore((state) => state.setCurrentPage);
  
  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const prefersReducedMotion = useReducedMotion();
  const tableRef = useRef<HTMLDivElement>(null);
  const { ref: scrollRef, isInView } = useFadeInOnScroll({ threshold: 0.1, triggerOnce: true });
  
  // Keyboard navigation for table
  useEffect(() => {
    if (isMobile || !tableRef.current) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = tableRef.current;
      if (!container) return;
      
      // Only handle if focus is within the table container
      if (!container.contains(document.activeElement)) return;
      
      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, a, [tabindex]:not([tabindex="-1"])'
      );
      const currentIndex = Array.from(focusableElements).indexOf(
        document.activeElement as HTMLElement
      );
      
      if (currentIndex === -1) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < focusableElements.length - 1) {
            focusableElements[currentIndex + 1]?.focus();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            focusableElements[currentIndex - 1]?.focus();
          }
          break;
        case 'Home':
          e.preventDefault();
          focusableElements[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          focusableElements[focusableElements.length - 1]?.focus();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  const columns = useMemo<ColumnDef<TeamMember>[]>(
    () => [
      {
        accessorKey: 'avatar',
        header: '',
        cell: ({ row }) => <AvatarCell avatar={row.original.avatar} name={row.original.name} rowIndex={row.index} />,
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: () => {
          const isSorted = sortBy === 'name';
          const isAsc = sortOrder === 'asc';
          return (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                onClick={() => setSorting('name', isSorted && isAsc ? 'desc' : 'asc')}
                className="h-auto p-0 font-semibold hover:bg-transparent transition-all"
                aria-label={`${t('table.name')} - ${isSorted ? (isAsc ? t('pagination.previous') : t('pagination.next')) : 'Sort'}`}
              >
                <span>{t('table.name')}</span>
                <AnimatePresence mode="wait">
                  {isSorted ? (
                    isAsc ? (
                      <motion.div
                        key="up"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={getMotionScaleTransition('small')}
                      >
                        <ArrowUp className="ms-2 h-4 w-4" aria-hidden="true" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="down"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                        transition={getMotionScaleTransition('small')}
                      >
                        <ArrowDown className="ms-2 h-4 w-4" aria-hidden="true" />
                      </motion.div>
                    )
                  ) : (
                    <ArrowUpDown className="ms-2 h-4 w-4 opacity-50" aria-hidden="true" />
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          );
        },
      },
      {
        accessorKey: 'role',
        header: () => {
          const isSorted = sortBy === 'role';
          const isAsc = sortOrder === 'asc';
          return (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                onClick={() => setSorting('role', isSorted && isAsc ? 'desc' : 'asc')}
                className="h-auto p-0 font-semibold hover:bg-transparent transition-all"
                aria-label={`${t('table.role')} - ${isSorted ? (isAsc ? t('pagination.previous') : t('pagination.next')) : 'Sort'}`}
              >
                <span>{t('table.role')}</span>
                <AnimatePresence mode="wait">
                  {isSorted ? (
                    isAsc ? (
                      <motion.div
                        key="up"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={getMotionScaleTransition('small')}
                      >
                        <ArrowUp className="ms-2 h-4 w-4" aria-hidden="true" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="down"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                        transition={getMotionScaleTransition('small')}
                      >
                        <ArrowDown className="ms-2 h-4 w-4" aria-hidden="true" />
                      </motion.div>
                    )
                  ) : (
                    <ArrowUpDown className="ms-2 h-4 w-4 opacity-50" aria-hidden="true" />
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          );
        },
        cell: ({ row }) => <RoleCell role={row.original.role} />,
      },
      {
        accessorKey: 'email',
        header: t('table.email'),
        cell: ({ row }) => (
          <a
            href={`mailto:${row.original.email}`}
            className="text-primary hover:underline transition-colors"
            aria-label={`Email ${row.original.name} at ${row.original.email}`}
          >
            {row.original.email}
          </a>
        ),
        enableSorting: false,
      },
    ],
    [sortBy, sortOrder, setSorting]
  );

  const table = useReactTable({
    data: teamMembers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? 1,
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
  });

  // Calculate available height for both mobile and desktop (hooks must be called unconditionally)
  const mobileAvailableHeight = useAvailableHeight({
    excludeHeader: true,
    excludeFilters: true, // Filters are above on mobile
    containerRef: scrollContainerRef as React.RefObject<HTMLElement>,
  });

  const desktopAvailableHeight = useAvailableHeight({
    excludeHeader: true,
    excludeFilters: false, // Filters are in sidebar on desktop
    containerRef: scrollContainerRef as React.RefObject<HTMLElement>,
  });

  if (isLoading && teamMembers.length === 0) {
    return <LoadingSkeleton variant={isMobile ? 'table-row' : 'table-row'} count={pageSize} />;
  }

  // Mobile: Scrollable table view that fits in viewport
  if (isMobile) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col h-full min-h-0 px-1"
        style={mobileAvailableHeight ? { height: mobileAvailableHeight } : undefined}
        role="table"
        aria-label={t('table.name')}
      >
        <div 
          ref={tableRef}
          className="flex-1 min-h-0 flex flex-col rounded-2xl border-2 border-primary/10 bg-card overflow-hidden shadow-soft"
          style={{ contain: 'layout style paint' }}
        >
          <div 
            className="flex-1 min-h-0 overflow-x-auto overflow-y-auto -mx-1 px-1"
            style={{ contain: 'style' }}
            data-lenis-prevent
          >
            <Table 
              className="text-xs min-w-[600px] border-collapse"
              aria-rowcount={table.getRowModel().rows.length + 1}
            >
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b h-10 bg-card backdrop-blur-sm">
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id} 
                        className="sticky top-0 z-10 h-10 text-xs font-semibold text-foreground/80 uppercase tracking-wider px-2 bg-card shadow-sm"
                        style={{ position: 'sticky', top: 0 }}
                        scope="col"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row, index) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ 
                          ...getMotionScaleTransition('small'),
                          delay: index * 0.02,
                        }}
                        className={cn(
                          "border-b border-primary/5 transition-colors h-[44px]",
                          "hover:bg-primary/3", // Hover effect
                          index % 2 === 0 ? "bg-background" : "bg-muted/20"
                        )}
                        role="row"
                        aria-rowindex={index + 2}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell 
                            key={cell.id} 
                            className="py-2 px-2 leading-[1.4]"
                            role="cell"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell 
                        colSpan={columns.length} 
                        className="h-24 text-center text-muted-foreground text-xs"
                        role="cell"
                      >
                        {t('table.noResults')}
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Pagination for mobile */}
        {pagination && pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 flex flex-col items-center justify-center gap-3 pt-4"
          >
            <div className="text-xs text-muted-foreground text-center">
              {t('pagination.page')} <span className="font-medium text-foreground">{currentPage}</span>{' '}
              {t('pagination.of')} <span className="font-medium text-foreground">{pagination.totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                aria-label={t('pagination.previousPage')}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{t('pagination.previous')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages || isLoading}
                aria-label={t('pagination.nextPage')}
              >
                <span className="sr-only">{t('pagination.next')}</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Desktop/Tablet: Compact table that fits in viewport
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="flex flex-col h-full min-h-0 px-1"
      style={desktopAvailableHeight ? { height: desktopAvailableHeight } : undefined}
    >
      <div 
        ref={tableRef}
        className="flex-1 min-h-0 flex flex-col rounded-2xl border-2 border-primary/10 bg-card overflow-hidden shadow-soft hover:shadow-medium hover:border-primary/20 transition-all duration-300"
        style={{ contain: 'layout style paint' }}
        role="table"
        aria-label={t('table.name')}
      >
        <div 
          className={cn(
            'flex-1 min-h-0 overflow-y-auto overflow-x-auto',
            isTablet && 'overflow-x-auto'
          )}
          style={{ contain: 'style' }}
          data-lenis-prevent
        >
          <Table 
            className="text-sm border-collapse"
            aria-rowcount={table.getRowModel().rows.length + 1}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b h-12 bg-card backdrop-blur-sm">
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id} 
                      className="sticky top-0 z-10 h-12 text-xs font-semibold text-foreground/80 uppercase tracking-wider bg-card shadow-sm"
                      style={{ position: 'sticky', top: 0 }}
                      scope="col"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ 
                        ...getMotionScaleTransition('small'),
                        delay: index * 0.02,
                      }}
                      className={cn(
                        "border-b border-primary/5 transition-colors",
                        "h-[48px] min-h-[48px]", // Fixed row height for consistent table
                        "hover:bg-primary/3", // Hover effect using CSS instead of animation
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                      role="row"
                      tabIndex={0}
                      aria-rowindex={index + 2}
                      aria-label={`Row ${index + 1}: ${row.original.name}, ${row.original.role}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell 
                          key={cell.id} 
                          className="py-2 px-3 leading-[1.4]"
                          role="cell"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length} 
                      className="h-24 text-center text-muted-foreground"
                      role="cell"
                    >
                      {t('table.noResults')}
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <AnimatePresence>
        {pagination && pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4"
          >
            <div className="text-sm text-muted-foreground">
              {t('pagination.page')} <span className="font-medium text-foreground">{currentPage}</span>{' '}
              {t('pagination.of')} <span className="font-medium text-foreground">{pagination.totalPages}</span>{' '}
              (<span className="font-medium text-foreground">{pagination.totalCount}</span> {t('pagination.total')})
            </div>
            <div className="flex items-center gap-2">
              <motion.div whileHover={hoverScale} whileTap={{ scale: 0.98 }} transition={SPRING.gentle}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  aria-label={t('pagination.previousPage')}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span>{t('pagination.previous')}</span>
                </Button>
              </motion.div>
              <motion.div whileHover={hoverScale} whileTap={{ scale: 0.98 }} transition={SPRING.gentle}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages || isLoading}
                  aria-label={t('pagination.nextPage')}
                  className="gap-2"
                >
                  <span>{t('pagination.next')}</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

