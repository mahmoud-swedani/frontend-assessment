/**
 * Design Token Utilities
 * 
 * Helper functions and types to enforce design token usage across the codebase.
 * This helps maintain consistency and prevents hardcoded values.
 */

import { spacing, radius } from './design-tokens';

/**
 * Spacing scale values (4px base unit)
 * Use these instead of arbitrary Tailwind values
 */
export const SPACING = {
  xs: spacing[1],   // 4px
  sm: spacing[2],   // 8px
  md: spacing[4],   // 16px
  lg: spacing[6],   // 24px
  xl: spacing[8],   // 32px
  '2xl': spacing[12], // 48px
  '3xl': spacing[16], // 64px
} as const;

/**
 * Border radius values
 * Use these instead of arbitrary rounded values
 */
export const BORDER_RADIUS = {
  sm: radius.sm,
  md: radius.md,
  lg: radius.lg,
  xl: radius.xl,
  '2xl': radius['2xl'],
  full: radius.full,
} as const;

/**
 * Standard border opacity values
 * Use these for consistent border styling
 */
export const BORDER_OPACITY = {
  subtle: '10',   // border-primary/10
  light: '20',     // border-primary/20
  medium: '30',    // border-primary/30
  strong: '40',    // border-primary/40
  active: '60',    // border-primary/60
} as const;

/**
 * Standard shadow utilities
 * Use these class names instead of custom shadow values
 */
export const SHADOW_CLASSES = {
  soft: 'shadow-soft',
  medium: 'shadow-medium',
  large: 'shadow-large',
  rose: 'shadow-rose',
} as const;

/**
 * Type-safe spacing utility
 * Returns Tailwind spacing class name
 */
export function getSpacingClass(size: keyof typeof SPACING): string {
  const spacingMap: Record<keyof typeof SPACING, string> = {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-12',
    '3xl': 'p-16',
  };
  return spacingMap[size];
}

/**
 * Type-safe border opacity utility
 * Returns Tailwind border opacity class
 */
export function getBorderOpacityClass(opacity: keyof typeof BORDER_OPACITY): string {
  return `border-primary/${BORDER_OPACITY[opacity]}`;
}

/**
 * Standard padding values for components
 */
export const COMPONENT_PADDING = {
  card: 'p-6',        // 24px - Standard card padding
  cardLarge: 'p-8',   // 32px - Large card padding
  input: 'px-4 py-2', // Standard input padding
  button: 'px-4 py-2', // Standard button padding
  compact: 'p-4',     // 16px - Compact padding
} as const;

/**
 * Standard border styles
 */
export const BORDER_STYLES = {
  card: 'border-2 border-primary/10',
  cardHover: 'border-2 border-primary/20',
  input: 'border-2 border-input/50',
  inputFocus: 'border-2 border-primary/60',
  divider: 'border-b border-primary/5',
} as const;

