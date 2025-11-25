'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceAudit } from '@/hooks/usePerformanceAudit';
import { Button } from '@/components/ui/button';
// Using simple divs instead of Card/Badge components
import { Loader2, Play, CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';
import { BENCHMARKS } from '@/lib/performance-audit';
import { cn } from '@/lib/utils';

/**
 * Development-only performance audit panel
 * 
 * This component provides a UI for running performance audits and viewing results.
 * Should only be used in development mode.
 */
export function PerformanceAuditPanel() {
  const [duration, setDuration] = useState(5000);
  const { result, isRunning, runAudit, formattedResults, benchmarkCheck } = usePerformanceAudit({
    duration,
    autoRun: false,
    logToConsole: true,
  });

  const handleRunAudit = async () => {
    await runAudit(duration);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
      case 'excellent':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'needs-improvement':
      case 'acceptable':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'poor':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good':
      case 'excellent':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'needs-improvement':
      case 'acceptable':
        return <AlertCircle className="h-4 w-4" />;
      case 'poor':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 border rounded-lg bg-background">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold mb-2">
          <Info className="h-5 w-5" />
          Performance Audit Panel
        </h2>
        <p className="text-muted-foreground">
          Measure CLS, FPS, frame budgets, and long tasks. Development tool only.
        </p>
      </div>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="duration" className="text-sm font-medium mb-2 block">
              Audit Duration (ms)
            </label>
            <input
              id="duration"
              type="number"
              min="1000"
              max="30000"
              step="1000"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={isRunning}
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>
          <Button
            onClick={handleRunAudit}
            disabled={isRunning}
            className="mt-6"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Audit
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Benchmark Summary */}
              {benchmarkCheck && (
                <div
                  className={cn(
                    'p-4 rounded-lg border',
                    benchmarkCheck.passed
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-yellow-500/10 border-yellow-500/20'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {benchmarkCheck.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    )}
                    <h3 className="font-semibold">
                      {benchmarkCheck.passed ? 'All Benchmarks Passed' : 'Benchmark Issues Found'}
                    </h3>
                  </div>
                  {benchmarkCheck.issues.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {benchmarkCheck.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* CLS */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Cumulative Layout Shift (CLS)</h3>
                  <span className={cn('px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1', getRatingColor(result.cls.rating))}>
                    {getRatingIcon(result.cls.rating)}
                    <span className="capitalize">{result.cls.rating}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Value:</span>
                    <span className="ml-2 font-mono">{result.cls.value}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Entries:</span>
                    <span className="ml-2 font-mono">{result.cls.entries.length}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Benchmark: &lt; {BENCHMARKS.cls.good} (Good), &lt; {BENCHMARKS.cls.needsImprovement} (Needs Improvement)
                </div>
              </div>

              {/* FPS */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Frames Per Second (FPS)</h3>
                  <span className={cn('px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1', getRatingColor(result.fps.rating))}>
                    {getRatingIcon(result.fps.rating)}
                    <span className="capitalize">{result.fps.rating}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">FPS:</span>
                    <span className="ml-2 font-mono">{result.fps.fps}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Frame Time:</span>
                    <span className="ml-2 font-mono">{result.fps.frameTime}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Frame Drops:</span>
                    <span className="ml-2 font-mono">{result.fps.frameDrops}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Benchmark: ≥ {BENCHMARKS.fps.excellent} (Excellent), ≥ {BENCHMARKS.fps.acceptable} (Acceptable)
                </div>
              </div>

              {/* Frame Budget */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Frame Budget</h3>
                  <span className={cn('px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1', getRatingColor(result.frameBudget.rating))}>
                    {getRatingIcon(result.frameBudget.rating)}
                    <span className="capitalize">{result.frameBudget.rating}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Avg Frame Time:</span>
                    <span className="ml-2 font-mono">{result.frameBudget.averageFrameTime}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Frame Time:</span>
                    <span className="ml-2 font-mono">{result.frameBudget.maxFrameTime}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Over Budget:</span>
                    <span className="ml-2 font-mono">
                      {result.frameBudget.framesOverBudget}/{result.frameBudget.totalFrames}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Over Warning:</span>
                    <span className="ml-2 font-mono">
                      {result.frameBudget.framesOverWarning}/{result.frameBudget.totalFrames}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Benchmark: &lt; {BENCHMARKS.frameBudget.target}ms (Target), &lt; {BENCHMARKS.frameBudget.warning}ms (Warning)
                </div>
              </div>

              {/* Long Tasks */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Long Tasks</h3>
                  <span className="px-2 py-1 rounded-md text-xs font-medium border">
                    {result.longTasks.length} found
                  </span>
                </div>
                {result.longTasks.length > 0 ? (
                  <div className="space-y-2">
                    {result.longTasks.slice(0, 5).map((task, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="font-mono">{task.duration}ms</span>
                        <span className={cn('px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1', getRatingColor(task.rating))}>
                          {getRatingIcon(task.rating)}
                          <span className="capitalize">{task.rating}</span>
                        </span>
                      </div>
                    ))}
                    {result.longTasks.length > 5 && (
                      <div className="text-xs text-muted-foreground">
                        +{result.longTasks.length - 5} more tasks
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No long tasks detected</div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Benchmark: &lt; {BENCHMARKS.longTask.threshold}ms
                </div>
              </div>

              {/* Environment */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Environment</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Viewport:</span>
                    <span className="ml-2 font-mono">
                      {result.viewport.width}x{result.viewport.height}
                    </span>
                  </div>
                </div>
              </div>

              {/* Raw Results (Collapsible) */}
              <details className="p-4 border rounded-lg">
                <summary className="cursor-pointer font-semibold mb-2">Raw Results (Console Format)</summary>
                <pre className="mt-2 text-xs overflow-auto bg-muted p-2 rounded">
                  {formattedResults}
                </pre>
              </details>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

