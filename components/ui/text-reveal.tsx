'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export function TextReveal({ text, className, delay = 0, duration = 0.5 }: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          className="inline-block me-2"
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

