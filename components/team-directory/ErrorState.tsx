'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeamMembersData } from '@/hooks/useTeamMembersData';
import { floating, fadeIn, scaleIn, hoverScale, pulse, SPRING, errorShake } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  const t = useTranslations('teamDirectory');
  const [isRetrying, setIsRetrying] = useState(false);
  const { refetch } = useTeamMembersData();

  const getErrorType = (errorMessage: string): 'network' | 'server' | 'unknown' => {
    const lowerError = errorMessage.toLowerCase();
    if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return 'network';
    }
    if (lowerError.includes('500') || lowerError.includes('server')) {
      return 'server';
    }
    return 'unknown';
  };

  const errorType = getErrorType(error);

  /**
   * Handles retry logic for failed requests
   * 
   * Attempts to refetch data and handles errors appropriately.
   * Errors are propagated to the Zustand store which will update
   * the error state. If refetch fails, the error state remains
   * so the user can see what went wrong.
   */
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const result = await refetch();
      
      // Check if refetch was successful
      // For mock API, refetch always resolves, so we check the store state
      // For real API, Apollo will handle errors through the query hook
      if (result.error) {
        // Error is already handled by Apollo/useTeamMembers hook
        // which updates the Zustand store
        console.error('Refetch failed:', result.error);
      }
    } catch (err) {
      // Catch any unexpected errors during refetch
      // These should be rare but we handle them gracefully
      console.error('Unexpected error during refetch:', err);
      // Error state will remain, allowing user to see the issue
    } finally {
      setIsRetrying(false);
    }
  };

  const ErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return <WifiOff className="h-20 w-20 text-destructive" aria-hidden="true" />;
      case 'server':
        return <ServerCrash className="h-20 w-20 text-destructive" aria-hidden="true" />;
      default:
        return <AlertCircle className="h-20 w-20 text-destructive" aria-hidden="true" />;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl border-2 border-destructive/30 bg-card relative overflow-hidden shadow-soft"
      role="alert"
      aria-live="assertive"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/5 opacity-50" />
      
      <motion.div
        variants={scaleIn}
        className="relative mb-6"
      >
        <motion.div
          variants={pulse}
          animate="animate"
          className="absolute inset-0 bg-destructive/10 rounded-full blur-2xl"
        />
        <motion.div
          variants={errorShake}
          animate="animate"
          className="relative"
        >
          <motion.div
            variants={floating}
            animate="animate"
          >
            <ErrorIcon />
          </motion.div>
        </motion.div>
      </motion.div>
      
      <motion.h3
        variants={fadeIn}
        transition={{ delay: 0.1 }}
        className="text-2xl font-semibold mb-3 text-foreground"
      >
        {t(`errors.${errorType}.title`)}
      </motion.h3>
      
      <motion.p
        variants={fadeIn}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-center mb-8 max-w-md text-base leading-relaxed"
      >
        {t(`errors.${errorType}.message`)}
      </motion.p>
      
      <motion.div
        variants={fadeIn}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          whileHover={!isRetrying ? hoverScale : {}}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleRetry}
            variant="default"
            size="lg"
            disabled={isRetrying}
            className="gap-2 relative overflow-hidden group shadow-rose"
          >
            <motion.div
              animate={isRetrying ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isRetrying ? Infinity : 0, ease: 'linear' }}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </motion.div>
            <span>{t('errors.retry')}</span>
            {!isRetrying && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

