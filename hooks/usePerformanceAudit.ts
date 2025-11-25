'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  runPerformanceAudit,
  formatAuditResults,
  checkBenchmarks,
  type PerformanceAuditResult,
} from '@/lib/performance-audit';

interface UsePerformanceAuditOptions {
  /**
   * Duration of the audit in milliseconds
   * @default 5000
   */
  duration?: number;
  /**
   * Automatically run audit on mount
   * @default false
   */
  autoRun?: boolean;
  /**
   * Log results to console
   * @default true
   */
  logToConsole?: boolean;
  /**
   * Callback when audit completes
   */
  onComplete?: (result: PerformanceAuditResult) => void;
}

interface UsePerformanceAuditReturn {
  /**
   * Current audit result (null if no audit has been run)
   */
  result: PerformanceAuditResult | null;
  /**
   * Whether an audit is currently running
   */
  isRunning: boolean;
  /**
   * Run a new performance audit
   */
  runAudit: (duration?: number) => Promise<PerformanceAuditResult>;
  /**
   * Formatted audit results as a string
   */
  formattedResults: string | null;
  /**
   * Benchmark check results
   */
  benchmarkCheck: { passed: boolean; issues: string[] } | null;
}

/**
 * Hook for running performance audits
 * 
 * @example
 * ```tsx
 * const { result, isRunning, runAudit, formattedResults } = usePerformanceAudit({
 *   duration: 5000,
 *   autoRun: false,
 *   logToConsole: true,
 * });
 * 
 * // Run audit manually
 * await runAudit();
 * ```
 */
export function usePerformanceAudit(
  options: UsePerformanceAuditOptions = {}
): UsePerformanceAuditReturn {
  const {
    duration = 5000,
    autoRun = false,
    logToConsole = true,
    onComplete,
  } = options;

  const [result, setResult] = useState<PerformanceAuditResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const runAudit = useCallback(
    async (auditDuration: number = duration): Promise<PerformanceAuditResult> => {
      if (isRunning) {
        console.warn('Performance audit already running');
        return result!;
      }

      setIsRunning(true);

      try {
        const auditResult = await runPerformanceAudit(auditDuration);

        if (!isMountedRef.current) {
          return auditResult;
        }

        setResult(auditResult);

        // Log to console if enabled
        if (logToConsole) {
          const formatted = formatAuditResults(auditResult);
          console.log(formatted);
        }

        // Call completion callback
        if (onComplete) {
          onComplete(auditResult);
        }

        return auditResult;
      } catch (error) {
        console.error('Performance audit failed:', error);
        throw error;
      } finally {
        if (isMountedRef.current) {
          setIsRunning(false);
        }
      }
    },
    [duration, isRunning, logToConsole, onComplete, result]
  );

  // Auto-run on mount if enabled
  useEffect(() => {
    if (autoRun && !isRunning && !result) {
      runAudit();
    }
  }, [autoRun, isRunning, result, runAudit]);

  // Format results
  const formattedResults = result ? formatAuditResults(result) : null;

  // Check benchmarks
  const benchmarkCheck = result ? checkBenchmarks(result) : null;

  return {
    result,
    isRunning,
    runAudit,
    formattedResults,
    benchmarkCheck,
  };
}

