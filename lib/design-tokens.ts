/**
 * Design Token System
 * Centralized design tokens for colors, spacing, typography, motion, and shadows
 */

// Color Tokens (extending existing CSS variables)
export const colors = {
  // Primary: Soft Rose/Blush Pink
  primary: 'oklch(0.7 0.12 15)',
  primaryForeground: 'oklch(0.98 0 0)',
  
  // Secondary: Lavender Tones
  secondary: 'oklch(0.85 0.08 280)',
  secondaryForeground: 'oklch(0.25 0.05 280)',
  
  // Accent: Beige and Soft Nude
  accent: 'oklch(0.88 0.03 60)',
  accentForeground: 'oklch(0.3 0.05 15)',
  
  // Background: Warm Off-White with Subtle Pink Tint
  background: 'oklch(0.99 0.005 15)',
  foreground: 'oklch(0.2 0.02 15)',
  
  // Card: Soft Pink-White
  card: 'oklch(0.995 0.003 15)',
  cardForeground: 'oklch(0.2 0.02 15)',
  
  // Muted: Soft Beige
  muted: 'oklch(0.92 0.02 30)',
  mutedForeground: 'oklch(0.5 0.03 15)',
  
  // Destructive: Soft Rose-Red
  destructive: 'oklch(0.6 0.18 25)',
  destructiveForeground: 'oklch(0.98 0 0)',
  
  // Borders: Soft Rose-Tinted
  border: 'oklch(0.9 0.01 15)',
  input: 'oklch(0.9 0.01 15)',
  ring: 'oklch(0.7 0.12 15)',
  
  // New: Pearlescent highlights
  pearlescent: 'oklch(0.95 0.02 15 / 0.6)',
  
  // New: Soft neon accents for CTAs
  neonAccent: 'oklch(0.75 0.15 320)',
  
  // Chart Colors: Rose, Lavender, Blush, Beige, Nude
  chart1: 'oklch(0.7 0.12 15)',
  chart2: 'oklch(0.75 0.1 320)',
  chart3: 'oklch(0.8 0.08 25)',
  chart4: 'oklch(0.85 0.05 60)',
  chart5: 'oklch(0.78 0.06 40)',
} as const;

// Dark Mode Colors
export const darkColors = {
  background: 'oklch(0.15 0.02 15)',
  foreground: 'oklch(0.95 0.01 15)',
  card: 'oklch(0.18 0.02 15)',
  cardForeground: 'oklch(0.95 0.01 15)',
  primary: 'oklch(0.75 0.15 15)',
  primaryForeground: 'oklch(0.15 0.02 15)',
  secondary: 'oklch(0.25 0.05 280)',
  secondaryForeground: 'oklch(0.9 0.05 280)',
  muted: 'oklch(0.22 0.02 20)',
  mutedForeground: 'oklch(0.65 0.03 15)',
  accent: 'oklch(0.28 0.03 40)',
  accentForeground: 'oklch(0.9 0.02 15)',
  destructive: 'oklch(0.65 0.2 25)',
  destructiveForeground: 'oklch(0.95 0 0)',
  border: 'oklch(0.25 0.02 15)',
  input: 'oklch(0.25 0.02 15)',
  ring: 'oklch(0.75 0.15 15)',
  chart1: 'oklch(0.75 0.15 15)',
  chart2: 'oklch(0.7 0.12 320)',
  chart3: 'oklch(0.72 0.1 25)',
  chart4: 'oklch(0.68 0.08 60)',
  chart5: 'oklch(0.7 0.1 40)',
} as const;

// Spacing Scale (4px base unit)
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',    // 16px
  5: '1.25rem', // 20px
  6: '1.5rem',  // 24px
  8: '2rem',    // 32px
  10: '2.5rem', // 40px
  12: '3rem',   // 48px
  16: '4rem',   // 64px
  20: '5rem',   // 80px
  24: '6rem',   // 96px
} as const;

// Typography Scale
export const typography = {
  // Font Families
  fontSans: 'var(--font-geist-sans)',
  fontMono: 'var(--font-geist-mono)',
  
  // Font Sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  
  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
    // Compact variant for tables
    compact: '1.4',
  },
  
  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// Motion Timing Tokens
export const motion = {
  // Motion Scale Durations (in seconds) - Standardized
  micro: {
    min: 0.03,   // 30ms
    max: 0.08,   // 80ms
    default: 0.12, // 120ms - Updated for smoother micro-interactions
  },
  small: {
    min: 0.08,   // 80ms
    max: 0.16,   // 160ms
    default: 0.2, // 200ms - Standardized
  },
  medium: {
    min: 0.16,   // 160ms
    max: 0.28,   // 280ms
    default: 0.3, // 300ms - Standardized
  },
  large: {
    min: 0.28,   // 280ms
    max: 0.42,   // 420ms
    default: 0.45, // 450ms - Standardized
  },
  
  // Stagger delays - Standardized
  stagger: {
    tight: 0.03,   // 30ms - for dense lists
    normal: 0.05,  // 50ms - default
    relaxed: 0.08, // 80ms - for sparse content
    fast: 0.03,    // Legacy alias
    slow: 0.12,    // Legacy alias
  },
} as const;

// Shadow Tokens
export const shadows = {
  soft: {
    light: '0 2px 8px oklch(0.7 0.12 15 / 0.08), 0 1px 3px oklch(0.7 0.12 15 / 0.12)',
    dark: '0 2px 8px oklch(0.15 0.02 15 / 0.3), 0 1px 3px oklch(0.15 0.02 15 / 0.4)',
  },
  medium: {
    light: '0 4px 16px oklch(0.7 0.12 15 / 0.12), 0 2px 6px oklch(0.7 0.12 15 / 0.16)',
    dark: '0 4px 16px oklch(0.15 0.02 15 / 0.4), 0 2px 6px oklch(0.15 0.02 15 / 0.5)',
  },
  large: {
    light: '0 8px 32px oklch(0.7 0.12 15 / 0.16), 0 4px 12px oklch(0.7 0.12 15 / 0.2)',
    dark: '0 8px 32px oklch(0.15 0.02 15 / 0.5), 0 4px 12px oklch(0.15 0.02 15 / 0.6)',
  },
  rose: {
    light: '0 4px 20px oklch(0.7 0.12 15 / 0.2), 0 0 40px oklch(0.75 0.1 320 / 0.1)',
    dark: '0 4px 20px oklch(0.75 0.15 15 / 0.3), 0 0 40px oklch(0.7 0.12 320 / 0.2)',
  },
  neon: {
    light: '0 0 20px oklch(0.75 0.15 320 / 0.3), 0 0 40px oklch(0.75 0.15 320 / 0.1)',
    dark: '0 0 20px oklch(0.75 0.15 320 / 0.5), 0 0 40px oklch(0.75 0.15 320 / 0.2)',
  },
} as const;

// Border Radius
export const radius = {
  none: '0',
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)', // 0.875rem (14px)
  xl: 'calc(var(--radius) + 4px)',
  '2xl': 'calc(var(--radius) + 8px)',
  '3xl': 'calc(var(--radius) + 12px)',
  full: '9999px',
} as const;

// Z-Index System
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
} as const;

// Futuristic Visual System Tokens
export const futuristic = {
  holographic: {
    primary: 'linear-gradient(135deg, oklch(0.7 0.12 15), oklch(0.75 0.1 320), oklch(0.8 0.08 25))',
    shimmer: 'oklch(1 0 0 / 0.3)',
    scanSpeed: '3s',
    shiftSpeed: '8s',
  },
  particles: {
    count: 50,
    speed: 0.5,
    size: { min: 1, max: 3 },
    opacity: { min: 0.3, max: 0.8 },
  },
  ambient: {
    glowIntensity: 0.3,
    colorShift: 15,
    transitionSpeed: '4s',
  },
  volumetric: {
    lightIntensity: 0.4,
    shadowDepth: 0.2,
    occlusionStrength: 0.15,
  },
} as const;

// Enhanced easing curves
export const easings = {
  // Primary: cubic-bezier(0.25, 0.1, 0.25, 1) - Main easing for smooth, elegant motion
  primary: [0.25, 0.1, 0.25, 1],
  // Premium: cubic-bezier(0.16, 1, 0.3, 1) - Ultra-smooth for special cases
  premium: [0.16, 1, 0.3, 1],
  // Smooth: cubic-bezier(0.4, 0, 0.2, 1) - Material Design standard
  smooth: [0.4, 0, 0.2, 1],
  // Snappy: cubic-bezier(0.34, 1.56, 0.64, 1) - For micro-interactions
  snappy: [0.34, 1.56, 0.64, 1],
  // Gentle: cubic-bezier(0.22, 1, 0.36, 1) - For delicate animations
  gentle: [0.22, 1, 0.36, 1],
  // Bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55) - For playful interactions
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

// Animation presets
export const animationPresets = {
  pageTransition: {
    duration: 0.4,
    ease: easings.premium,
  },
  cardHover: {
    duration: 0.3,
    ease: easings.smooth,
  },
  microInteraction: {
    duration: 0.15,
    ease: easings.smooth,
  },
} as const;

// Export all tokens
export const tokens = {
  colors,
  darkColors,
  spacing,
  typography,
  motion,
  shadows,
  radius,
  zIndex,
  futuristic,
  easings,
  animationPresets,
} as const;

// TypeScript Types
export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type MotionScale = 'micro' | 'small' | 'medium' | 'large';
export type ShadowVariant = 'soft' | 'medium' | 'large' | 'rose' | 'neon';
export type RadiusToken = keyof typeof radius;
export type ZIndexToken = keyof typeof zIndex;

