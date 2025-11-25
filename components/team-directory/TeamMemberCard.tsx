'use client';

import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import type { TeamMember } from '@/types/teamDirectory';
import { ROLE_COLORS } from '@/lib/constants';
import { hoverLift, staggerItem, SPRING, cardSpring, getEasing, getMotionScaleTransition } from '@/lib/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface TeamMemberCardProps {
  member: TeamMember;
  index?: number;
  isNewItem?: boolean;
}

export function TeamMemberCard({ member, index = 0, isNewItem = false }: TeamMemberCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Disable 3D transforms during initial load to prevent repaints
  const enable3DTransforms = !isNewItem && isInView;
  
  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 });
  
  const rotateX = prefersReducedMotion || !enable3DTransforms
    ? useTransform(mouseYSpring, [-0.5, 0.5], [0, 0])
    : useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = prefersReducedMotion || !enable3DTransforms
    ? useTransform(mouseXSpring, [-0.5, 0.5], [0, 0])
    : useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || prefersReducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion || !isInView ? "visible" : { opacity: 0, scale: 0.96, y: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
      transition={{ 
        delay: prefersReducedMotion ? 0 : index * 0.05, 
        type: 'spring', 
        stiffness: 100,
        damping: 20,
      }}
      onMouseMove={enable3DTransforms ? handleMouseMove : undefined}
      onMouseLeave={enable3DTransforms ? handleMouseLeave : undefined}
      style={{
        rotateX: enable3DTransforms ? rotateX : 0,
        rotateY: enable3DTransforms ? rotateY : 0,
        transformStyle: enable3DTransforms ? 'preserve-3d' : 'flat',
      }}
      whileHover={prefersReducedMotion || !enable3DTransforms ? {} : { scale: 1.02, y: -8, z: 20 }}
      whileTap={{ scale: 0.98 }}
      className="group relative p-8 border-2 border-primary/10 rounded-2xl bg-card shadow-soft hover:shadow-large hover:border-primary/40 transition-all duration-500 ease-out perspective motion-safe:will-change-transform focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2"
      role="article"
      aria-label={`Team member ${member.name}`}
      tabIndex={0}
    >
      {/* Soft rose gradient overlay on hover - enhanced opacity */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl z-0" />
      
      {/* Pearlescent shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" style={{ animation: 'shimmer 3s ease-in-out infinite' }} />
      </div>
      
      <div className="flex flex-col items-center text-center relative z-10" style={{ transform: 'translateZ(50px)' }}>
        <motion.div
          whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: [0, -3, 3, 0] }}
          transition={{ duration: 0.5, ease: getEasing('gentle') }}
          className="relative mb-4"
        >
          {member.avatar ? (
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, rotate: 3 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              transition={SPRING.gentle}
              className="relative overflow-hidden rounded-full ring-2 ring-gradient-rose-lavender ring-offset-2 ring-offset-background group-hover:ring-primary/50 transition-all shadow-rose group-hover:shadow-large group-hover:ring-4"
              style={{ width: 80, height: 80 }} // Fixed dimensions to prevent CLS
            >
              <Image
                src={member.avatar}
                alt={`${member.name}'s avatar`}
                width={80}
                height={80}
                className="rounded-full"
                unoptimized={member.avatar.includes('dicebear.com')}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </motion.div>
          ) : (
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, rotate: 3 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              transition={SPRING.gentle}
              className="w-20 h-20 rounded-full bg-gradient-rose-lavender/20 flex items-center justify-center text-2xl font-semibold text-primary ring-2 ring-gradient-rose-lavender ring-offset-2 ring-offset-background group-hover:ring-primary/50 transition-all shadow-rose group-hover:shadow-large group-hover:ring-4"
            >
              {member.name.charAt(0).toUpperCase()}
            </motion.div>
          )}
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-bold text-lg mb-2 text-foreground"
        >
          {member.name}
        </motion.h3>
        
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileFocus={prefersReducedMotion ? {} : { scale: 1.02 }}
          className={cn(
            'inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium mb-4 transition-all shadow-soft group-hover:shadow-medium',
            'group-hover:border-2 group-hover:border-primary/30',
            ROLE_COLORS[member.role]
          )}
        >
          {member.role}
        </motion.span>
        
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          href={`mailto:${member.email}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group/link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-md px-1"
          aria-label={`Email ${member.name} at ${member.email}`}
        >
          <motion.div
            whileHover={prefersReducedMotion ? {} : { rotate: [0, -5, 5, 0], scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={SPRING.gentle}
          >
            <Mail className="h-4 w-4 transition-colors group-hover/link:text-primary" aria-hidden="true" />
          </motion.div>
          <span className="hover:underline decoration-2 underline-offset-2">{member.email}</span>
        </motion.a>
      </div>
    </motion.div>
  );
}

