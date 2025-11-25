'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  animateOnMount?: boolean;
}

export function TextReveal({ text, className, delay = 0, duration = 0.5, animateOnMount = false }: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: animateOnMount ? '0px' : '-100px' });
  const prefersReducedMotion = useReducedMotion();

  // Extract gradient class if present and apply to each span
  const gradientClass = className?.match(/gradient-text-\w+/)?.[0];
  const baseClassName = className?.replace(/gradient-text-\w+/g, '').replace(/\s+/g, ' ').trim();

  return (
    <motion.div
      ref={ref}
      className={baseClassName}
      initial="hidden"
      animate={(animateOnMount || isInView) ? 'visible' : 'hidden'}
    >
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          className={`inline-block me-2 ${gradientClass || ''}`}
          variants={prefersReducedMotion ? {} : {
            hidden: { 
              opacity: 0, 
              clipPath: 'inset(0 100% 0 0)',
              y: 20 
            },
            visible: { 
              opacity: 1, 
              clipPath: 'inset(0 0% 0 0)',
              y: 0,
              transition: {
                duration,
                delay: delay + i * 0.05,
                ease: [0.16, 1, 0.3, 1]
              }
            }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

