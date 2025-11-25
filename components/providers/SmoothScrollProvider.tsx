'use client';

import { useSmoothScroll } from '@/lib/smooth-scroll';
import { ReactNode } from 'react';

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useSmoothScroll();
  return <>{children}</>;
}

