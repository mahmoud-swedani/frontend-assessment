'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface UseAccessibilityOptions {
  enableKeyboardNavigation?: boolean;
  enableScreenReader?: boolean;
  announceChanges?: boolean;
}

export function useAccessibility(options: UseAccessibilityOptions = {}) {
  const {
    enableKeyboardNavigation = true,
    enableScreenReader = true,
    announceChanges = true,
  } = options;
  
  const prefersReducedMotion = useReducedMotion();
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  
  // Detect keyboard user
  useEffect(() => {
    if (!enableKeyboardNavigation) return;
    
    const handleKeyDown = () => {
      setIsKeyboardUser(true);
    };
    
    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [enableKeyboardNavigation]);
  
  // Create live region for screen reader announcements
  useEffect(() => {
    if (!enableScreenReader || !announceChanges) return;
    
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'a11y-live-region';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }
    
    return () => {
      if (liveRegionRef.current && liveRegionRef.current.parentNode) {
        liveRegionRef.current.parentNode.removeChild(liveRegionRef.current);
      }
    };
  }, [enableScreenReader, announceChanges]);
  
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableScreenReader || !announceChanges || !liveRegionRef.current) return;
    
    liveRegionRef.current.setAttribute('aria-live', priority);
    liveRegionRef.current.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = '';
      }
    }, 1000);
  };
  
  return {
    prefersReducedMotion,
    isKeyboardUser,
    announce,
  };
}

// Focus management hook
export function useFocusManagement() {
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  
  const trapFocus = (container: HTMLElement | null) => {
    if (!container) return;
    
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');
    
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors)
    );
    
    focusableElementsRef.current = focusableElements;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };
  
  const restoreFocus = (element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  };
  
  const focusFirst = () => {
    focusableElementsRef.current[0]?.focus();
  };
  
  const focusLast = () => {
    const last = focusableElementsRef.current[focusableElementsRef.current.length - 1];
    last?.focus();
  };
  
  return {
    trapFocus,
    restoreFocus,
    focusFirst,
    focusLast,
  };
}

