/**
 * PERFORMANCE AUDIT SYSTEM
 * 
 * Comprehensive performance monitoring for motion and layout stability.
 * Measures CLS, FPS, animation frame budgets, and establishes benchmarks.
 * 
 * BENCHMARKS:
 * - CLS (Cumulative Layout Shift): < 0.1 (Good), < 0.25 (Needs Improvement)
 * - FPS: ≥ 60 (Excellent), ≥ 30 (Acceptable), < 30 (Poor)
 * - Frame Budget: < 16.67ms per frame (60fps target)
 * - Long Tasks: < 50ms (to avoid blocking main thread)
 */

export interface PerformanceBenchmarks {
  cls: {
    good: number;
    needsImprovement: number;
  };
  fps: {
    excellent: number;
    acceptable: number;
    poor: number;
  };
  frameBudget: {
    target: number; // ms per frame for 60fps
    warning: number; // ms per frame for 30fps
  };
  longTask: {
    threshold: number; // ms
  };
}

export const BENCHMARKS: PerformanceBenchmarks = {
  cls: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  fps: {
    excellent: 60,
    acceptable: 30,
    poor: 30,
  },
  frameBudget: {
    target: 16.67, // 60fps
    warning: 33.33, // 30fps
  },
  longTask: {
    threshold: 50, // ms
  },
};

export interface CLSMetric {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  entries: PerformanceEntry[];
  timestamp: number;
}

export interface FPSMetric {
  fps: number;
  frameTime: number;
  rating: 'excellent' | 'acceptable' | 'poor';
  frameDrops: number; // Frames that exceeded budget
  timestamp: number;
}

export interface FrameBudgetMetric {
  averageFrameTime: number;
  maxFrameTime: number;
  framesOverBudget: number;
  framesOverWarning: number;
  totalFrames: number;
  rating: 'excellent' | 'acceptable' | 'poor';
  timestamp: number;
}

export interface LongTaskMetric {
  duration: number;
  startTime: number;
  name?: string;
  rating: 'good' | 'warning' | 'critical';
}

export interface PerformanceAuditResult {
  cls: CLSMetric;
  fps: FPSMetric;
  frameBudget: FrameBudgetMetric;
  longTasks: LongTaskMetric[];
  timestamp: number;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
}

/**
 * Measure Cumulative Layout Shift (CLS)
 * Uses PerformanceObserver to track layout shifts
 */
export class CLSMonitor {
  private observer: PerformanceObserver | null = null;
  private clsValue = 0;
  private clsEntries: PerformanceEntry[] = [];
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof PerformanceObserver !== 'undefined' && 
                       'observe' in PerformanceObserver.prototype;
  }

  start(): void {
    if (!this.isSupported) {
      console.warn('CLS monitoring not supported in this browser');
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Only count layout shifts without recent user input
          const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!layoutShift.hadRecentInput && layoutShift.value) {
            this.clsValue += layoutShift.value;
            this.clsEntries.push(entry);
          }
        }
      });

      this.observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.error('Failed to start CLS monitoring:', error);
    }
  }

  stop(): CLSMetric {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
    if (this.clsValue >= BENCHMARKS.cls.needsImprovement) {
      rating = 'poor';
    } else if (this.clsValue >= BENCHMARKS.cls.good) {
      rating = 'needs-improvement';
    }

    return {
      value: Math.round(this.clsValue * 1000) / 1000, // Round to 3 decimal places
      rating,
      entries: [...this.clsEntries],
      timestamp: performance.now(),
    };
  }

  getCurrentValue(): number {
    return this.clsValue;
  }
}

/**
 * Measure FPS and frame times
 */
export class FPSMonitor {
  private rafId: number | null = null;
  private frameTimes: number[] = [];
  private lastTime: number;
  private sampleSize: number;
  private frameDrops = 0;

  constructor(sampleSize: number = 60) {
    this.sampleSize = sampleSize;
    this.lastTime = performance.now();
  }

  start(): void {
    const measureFrame = (currentTime: number) => {
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      this.frameTimes.push(deltaTime);

      // Count frames that exceed budget
      if (deltaTime > BENCHMARKS.frameBudget.target) {
        this.frameDrops++;
      }

      // Keep only recent frame times
      if (this.frameTimes.length > this.sampleSize) {
        this.frameTimes.shift();
      }

      this.rafId = requestAnimationFrame(measureFrame);
    };

    this.rafId = requestAnimationFrame(measureFrame);
  }

  stop(): FPSMetric {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.frameTimes.length === 0) {
      return {
        fps: 60,
        frameTime: 16.67,
        rating: 'excellent',
        frameDrops: 0,
        timestamp: performance.now(),
      };
    }

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = 1000 / avgFrameTime;

    let rating: 'excellent' | 'acceptable' | 'poor' = 'excellent';
    if (fps < BENCHMARKS.fps.poor) {
      rating = 'poor';
    } else if (fps < BENCHMARKS.fps.excellent) {
      rating = 'acceptable';
    }

    return {
      fps: Math.round(fps * 10) / 10, // Round to 1 decimal place
      frameTime: Math.round(avgFrameTime * 100) / 100, // Round to 2 decimal places
      rating,
      frameDrops: this.frameDrops,
      timestamp: performance.now(),
    };
  }

  getCurrentMetrics(): { fps: number; frameTime: number } {
    if (this.frameTimes.length === 0) {
      return { fps: 60, frameTime: 16.67 };
    }

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = 1000 / avgFrameTime;

    return {
      fps: Math.round(fps * 10) / 10,
      frameTime: Math.round(avgFrameTime * 100) / 100,
    };
  }
}

/**
 * Measure frame budget compliance
 */
export class FrameBudgetMonitor {
  private rafId: number | null = null;
  private frameTimes: number[] = [];
  private lastTime: number;
  private sampleSize: number;

  constructor(sampleSize: number = 120) {
    this.sampleSize = sampleSize;
    this.lastTime = performance.now();
  }

  start(): void {
    const measureFrame = (currentTime: number) => {
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      this.frameTimes.push(deltaTime);

      // Keep only recent frame times
      if (this.frameTimes.length > this.sampleSize) {
        this.frameTimes.shift();
      }

      this.rafId = requestAnimationFrame(measureFrame);
    };

    this.rafId = requestAnimationFrame(measureFrame);
  }

  stop(): FrameBudgetMetric {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.frameTimes.length === 0) {
      return {
        averageFrameTime: 16.67,
        maxFrameTime: 16.67,
        framesOverBudget: 0,
        framesOverWarning: 0,
        totalFrames: 0,
        rating: 'excellent',
        timestamp: performance.now(),
      };
    }

    const averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const maxFrameTime = Math.max(...this.frameTimes);
    const framesOverBudget = this.frameTimes.filter(t => t > BENCHMARKS.frameBudget.target).length;
    const framesOverWarning = this.frameTimes.filter(t => t > BENCHMARKS.frameBudget.warning).length;

    let rating: 'excellent' | 'acceptable' | 'poor' = 'excellent';
    if (averageFrameTime > BENCHMARKS.frameBudget.warning) {
      rating = 'poor';
    } else if (averageFrameTime > BENCHMARKS.frameBudget.target) {
      rating = 'acceptable';
    }

    return {
      averageFrameTime: Math.round(averageFrameTime * 100) / 100,
      maxFrameTime: Math.round(maxFrameTime * 100) / 100,
      framesOverBudget,
      framesOverWarning,
      totalFrames: this.frameTimes.length,
      rating,
      timestamp: performance.now(),
    };
  }
}

/**
 * Monitor long tasks that block the main thread
 */
export class LongTaskMonitor {
  private observer: PerformanceObserver | null = null;
  private longTasks: LongTaskMetric[] = [];
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof PerformanceObserver !== 'undefined' && 
                       'observe' in PerformanceObserver.prototype;
  }

  start(): void {
    if (!this.isSupported) {
      console.warn('Long Task monitoring not supported in this browser');
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const duration = entry.duration;
          
          let rating: 'good' | 'warning' | 'critical' = 'good';
          if (duration >= BENCHMARKS.longTask.threshold * 2) {
            rating = 'critical';
          } else if (duration >= BENCHMARKS.longTask.threshold) {
            rating = 'warning';
          }

          this.longTasks.push({
            duration: Math.round(duration * 100) / 100,
            startTime: entry.startTime,
            name: entry.name,
            rating,
          });
        }
      });

      this.observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.error('Failed to start Long Task monitoring:', error);
    }
  }

  stop(): LongTaskMetric[] {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    return [...this.longTasks];
  }

  getCurrentTasks(): LongTaskMetric[] {
    return [...this.longTasks];
  }
}

/**
 * Run a comprehensive performance audit
 */
export async function runPerformanceAudit(
  duration: number = 5000 // Default 5 seconds
): Promise<PerformanceAuditResult> {
  const clsMonitor = new CLSMonitor();
  const fpsMonitor = new FPSMonitor(60);
  const frameBudgetMonitor = new FrameBudgetMonitor(120);
  const longTaskMonitor = new LongTaskMonitor();

  // Start all monitors
  clsMonitor.start();
  fpsMonitor.start();
  frameBudgetMonitor.start();
  longTaskMonitor.start();

  // Wait for the specified duration
  await new Promise(resolve => setTimeout(resolve, duration));

  // Stop all monitors and collect results
  const cls = clsMonitor.stop();
  const fps = fpsMonitor.stop();
  const frameBudget = frameBudgetMonitor.stop();
  const longTasks = longTaskMonitor.stop();

  return {
    cls,
    fps,
    frameBudget,
    longTasks,
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    viewport: {
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
    },
  };
}

/**
 * Format audit results for console output
 */
export function formatAuditResults(result: PerformanceAuditResult): string {
  const lines: string[] = [];
  
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('PERFORMANCE AUDIT RESULTS');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');
  
  // CLS
  lines.push('📊 CUMULATIVE LAYOUT SHIFT (CLS)');
  lines.push(`   Value: ${result.cls.value}`);
  lines.push(`   Rating: ${result.cls.rating.toUpperCase()}`);
  lines.push(`   Entries: ${result.cls.entries.length}`);
  lines.push(`   Benchmark: < ${BENCHMARKS.cls.good} (Good), < ${BENCHMARKS.cls.needsImprovement} (Needs Improvement)`);
  lines.push('');
  
  // FPS
  lines.push('🎬 FRAMES PER SECOND (FPS)');
  lines.push(`   FPS: ${result.fps.fps}`);
  lines.push(`   Frame Time: ${result.fps.frameTime}ms`);
  lines.push(`   Rating: ${result.fps.rating.toUpperCase()}`);
  lines.push(`   Frame Drops: ${result.fps.frameDrops}`);
  lines.push(`   Benchmark: ≥ ${BENCHMARKS.fps.excellent} (Excellent), ≥ ${BENCHMARKS.fps.acceptable} (Acceptable)`);
  lines.push('');
  
  // Frame Budget
  lines.push('⏱️  FRAME BUDGET');
  lines.push(`   Average Frame Time: ${result.frameBudget.averageFrameTime}ms`);
  lines.push(`   Max Frame Time: ${result.frameBudget.maxFrameTime}ms`);
  lines.push(`   Frames Over Budget: ${result.frameBudget.framesOverBudget}/${result.frameBudget.totalFrames}`);
  lines.push(`   Frames Over Warning: ${result.frameBudget.framesOverWarning}/${result.frameBudget.totalFrames}`);
  lines.push(`   Rating: ${result.frameBudget.rating.toUpperCase()}`);
  lines.push(`   Benchmark: < ${BENCHMARKS.frameBudget.target}ms (Target), < ${BENCHMARKS.frameBudget.warning}ms (Warning)`);
  lines.push('');
  
  // Long Tasks
  lines.push('⚠️  LONG TASKS');
  lines.push(`   Count: ${result.longTasks.length}`);
  if (result.longTasks.length > 0) {
    const critical = result.longTasks.filter(t => t.rating === 'critical').length;
    const warning = result.longTasks.filter(t => t.rating === 'warning').length;
    lines.push(`   Critical: ${critical}, Warning: ${warning}`);
    if (result.longTasks.length <= 5) {
      result.longTasks.forEach(task => {
        lines.push(`   - ${task.duration}ms (${task.rating})`);
      });
    }
  }
  lines.push(`   Benchmark: < ${BENCHMARKS.longTask.threshold}ms`);
  lines.push('');
  
  // Environment
  lines.push('🌐 ENVIRONMENT');
  lines.push(`   Viewport: ${result.viewport.width}x${result.viewport.height}`);
  lines.push(`   User Agent: ${result.userAgent.substring(0, 80)}...`);
  lines.push('');
  
  lines.push('═══════════════════════════════════════════════════════');
  
  return lines.join('\n');
}

/**
 * Check if performance meets benchmarks
 */
export function checkBenchmarks(result: PerformanceAuditResult): {
  passed: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check CLS
  if (result.cls.rating === 'poor') {
    issues.push(`CLS is ${result.cls.value}, exceeds threshold of ${BENCHMARKS.cls.needsImprovement}`);
  } else if (result.cls.rating === 'needs-improvement') {
    issues.push(`CLS is ${result.cls.value}, above good threshold of ${BENCHMARKS.cls.good}`);
  }

  // Check FPS
  if (result.fps.rating === 'poor') {
    issues.push(`FPS is ${result.fps.fps}, below acceptable threshold of ${BENCHMARKS.fps.acceptable}`);
  } else if (result.fps.rating === 'acceptable') {
    issues.push(`FPS is ${result.fps.fps}, below excellent threshold of ${BENCHMARKS.fps.excellent}`);
  }

  // Check Frame Budget
  if (result.frameBudget.rating === 'poor') {
    issues.push(`Average frame time is ${result.frameBudget.averageFrameTime}ms, exceeds warning threshold of ${BENCHMARKS.frameBudget.warning}ms`);
  } else if (result.frameBudget.rating === 'acceptable') {
    issues.push(`Average frame time is ${result.frameBudget.averageFrameTime}ms, exceeds target of ${BENCHMARKS.frameBudget.target}ms`);
  }

  // Check Long Tasks
  const criticalTasks = result.longTasks.filter(t => t.rating === 'critical').length;
  if (criticalTasks > 0) {
    issues.push(`Found ${criticalTasks} critical long tasks (>${BENCHMARKS.longTask.threshold * 2}ms)`);
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

