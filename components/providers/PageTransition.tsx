'use client';

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getMotionScaleTransition } from '@/lib/animations';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    // Determine direction based on route depth or history
    const currentDepth = pathname.split('/').filter(Boolean).length;
    const prevDepth = prevPath.split('/').filter(Boolean).length;
    
    setDirection(currentDepth > prevDepth ? 'forward' : 'backward');
    setPrevPath(pathname);
    setDisplayChildren(children);
  }, [pathname, children, prevPath]);
  
  const variants = prefersReducedMotion ? {} : {
    initial: {
      opacity: 0,
      x: direction === 'forward' ? 20 : -20,
      y: direction === 'forward' ? 10 : -10,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: getMotionScaleTransition('medium', true),
    },
    exit: {
      opacity: 0,
      x: direction === 'forward' ? -20 : 20,
      y: direction === 'forward' ? -10 : 10,
      scale: 0.98,
      transition: getMotionScaleTransition('small'),
    },
  };
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        {...(prefersReducedMotion ? {} : { variants: variants as Variants })}
        className="motion-safe:will-change-transform"
        style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
      >
        {displayChildren}
      </motion.div>
    </AnimatePresence>
  );
}

