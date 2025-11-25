'use client';

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { prefersReducedMotion, shimmerEffect } from '@/lib/animations';

interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: 'default' | 'pulse' | 'shimmer';
  preserveLayout?: boolean;
  animate?: boolean;
}

function Skeleton({ 
  className, 
  variant = 'shimmer',
  preserveLayout = true,
  animate = true,
  ...props 
}: SkeletonProps) {
  // Enhanced shimmer gradient with better opacity, smoother transition, and RTL support
  const shimmerGradient = 'linear-gradient(90deg, transparent 0%, oklch(0.7 0.12 15 / 0.25) 50%, transparent 100%)';
  
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        preserveLayout && "min-h-[1em]",
        variant === 'pulse' && "animate-pulse",
        className
      )}
      aria-busy="true"
      aria-label="Loading"
      {...props}
    >
      {variant === 'shimmer' && animate && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0"
          variants={shimmerEffect}
          animate="animate"
          style={{
            background: shimmerGradient,
            width: '60%',
            height: '100%',
          }}
        />
      )}
    </div>
  );
}

export { Skeleton };
export type { SkeletonProps };
