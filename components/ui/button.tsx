'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { buttonMicro, breathing } from "@/lib/animations"
import { useReducedMotion } from "@/hooks/useReducedMotion"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:shadow-rose aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-gradient-rose-lavender text-primary-foreground hover:shadow-rose transition-all duration-300",
        holographic: "holographic relative overflow-hidden text-primary-foreground hover:holographic-glow transition-all duration-300",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-2 border-primary/20 bg-background shadow-soft hover:bg-accent hover:text-accent-foreground hover:border-primary/40 hover:shadow-medium dark:bg-input/30 dark:border-input dark:hover:bg-input/50 transition-all duration-300",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-soft transition-all duration-300",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 transition-colors duration-300",
        loading: "bg-gradient-rose-lavender text-primary-foreground shadow-rose cursor-wait opacity-75",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const prefersReducedMotion = useReducedMotion()

  // Apply micro-interactions only if not using reduced motion and not asChild
  const shouldUseMotion = !prefersReducedMotion && !asChild;
  
  // Apply breathing animation to primary/default variant buttons
  const breathingProps = (shouldUseMotion && variant === 'default') 
    ? { variants: breathing, animate: 'animate' }
    : {}

  // Separate motion-specific props from HTML button props
  const { onDrag, ...htmlProps } = props as React.ComponentProps<"button"> & { onDrag?: never };

  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...htmlProps}
      />
    )
  }

  return (
    <motion.button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...(shouldUseMotion ? buttonMicro : {})}
      {...breathingProps}
      {...(htmlProps as any)}
    />
  )
}

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  };

export { Button, buttonVariants }
