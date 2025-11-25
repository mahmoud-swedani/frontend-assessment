'use client';

import { motion, HTMLMotionProps, useMotionValue, useTransform, type Variants } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMagneticHover } from '@/hooks/useMagneticHover';
import { SPRING, getMotionScaleTransition, type MotionScale } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { SparkleEffect } from './sparkle-effect';

interface MotionCardProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  motionScale?: MotionScale;
  className?: string;
  enableHover?: boolean;
  holographic?: boolean;
  enable3DTilt?: boolean;
  enableParticles?: boolean;
}

const cardVariants = (scale: MotionScale, prefersReducedMotion: boolean) => {
  if (prefersReducedMotion) {
    return {};
  }
  
  const transition = getMotionScaleTransition(scale, true);
  
  return {
    hidden: { 
      opacity: 0, 
      scale: 0.96, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition 
    },
    exit: { 
      opacity: 0, 
      scale: 0.96, 
      y: -20,
      transition: getMotionScaleTransition('small')
    },
    hover: {
      y: -4,
      scale: 1.01,
      transition: SPRING.gentle
    }
  };
};

export function MotionCard({ 
  children, 
  motionScale = 'medium',
  className,
  enableHover = true,
  holographic = false,
  enable3DTilt = true,
  enableParticles = false,
  ...props 
}: MotionCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = cardVariants(motionScale, prefersReducedMotion);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !enable3DTilt || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);
    
    x.set(mouseX);
    y.set(mouseY);
  };
  
  const handleMouseLeave = () => {
    if (prefersReducedMotion || !enable3DTilt) return;
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };
  
  const handleMouseEnter = () => {
    if (prefersReducedMotion) return;
    setIsHovered(true);
  };
  
  // Magnetic hover effect
  const { ref: magneticRef, style: magneticStyle } = useMagneticHover({
    strength: 0.2,
    range: 15,
  });
  
  // Combine refs
  const combinedRef = (node: HTMLDivElement | null) => {
    cardRef.current = node;
    if (magneticRef && 'current' in magneticRef) {
      (magneticRef as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };
  
  return (
    <motion.div
      ref={combinedRef}
      {...(prefersReducedMotion ? {} : { variants: variants as Variants })}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={enableHover && !prefersReducedMotion ? "hover" : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        ...magneticStyle,
        rotateX: enable3DTilt && !prefersReducedMotion ? rotateX : 0,
        rotateY: enable3DTilt && !prefersReducedMotion ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: enable3DTilt && !prefersReducedMotion ? '1000px' : 'none',
        willChange: prefersReducedMotion ? 'auto' : 'transform, opacity',
      }}
      className={cn(
        'relative motion-safe:will-change-transform',
        holographic && 'holographic prismatic',
        isHovered && !prefersReducedMotion && 'holographic-glow',
        className
      )}
      {...props}
    >
      {/* Ambient glow effect */}
      {isHovered && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0"
          animate={{
            opacity: [0, 0.3, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: 'radial-gradient(ellipse at center, oklch(0.7 0.12 15 / 0.2) 0%, transparent 70%)',
            filter: 'blur(20px)',
            zIndex: -1,
          }}
        />
      )}
      
      {/* Particle interactions */}
      {enableParticles && isHovered && !prefersReducedMotion && (
        <SparkleEffect count={3} duration={1} />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

