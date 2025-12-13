// lib/utils/telemetry.ts
// Client-side telemetry for performance and quality monitoring
// Tracks: JSON load time, scoring time, validation status distribution

interface TelemetryEvent {
  type: 'json_load' | 'scoring' | 'validation_status' | 'page_load';
  timestamp: number;
  duration?: number; // milliseconds
  metadata?: Record<string, any>;
}

const TELEMETRY_KEY = 'pet_plates_telemetry';
const BATCH_SIZE = 10; // Send after N events
const BATCH_INTERVAL_MS = 30000; // Send every 30 seconds
const MAX_EVENTS = 100; // Maximum events to store

class Telemetry {
  private events: TelemetryEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadEvents();
      this.startBatchTimer();
      
      // Send on page unload
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  private loadEvents(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(TELEMETRY_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
        // Keep only recent events (last 100)
        if (this.events.length > MAX_EVENTS) {
          this.events = this.events.slice(-MAX_EVENTS);
        }
      }
    } catch (error) {
      console.warn('Failed to load telemetry events:', error);
      this.events = [];
    }
  }

  private saveEvents(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(TELEMETRY_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save telemetry events:', error);
    }
  }

  private startBatchTimer(): void {
    if (typeof window === 'undefined') return;
    
    this.batchTimer = setInterval(() => {
      if (this.events.length >= BATCH_SIZE) {
        this.flush();
      }
    }, BATCH_INTERVAL_MS);
  }

  /**
   * Track JSON load time
   */
  trackJsonLoad(duration: number, size?: number): void {
    this.addEvent({
      type: 'json_load',
      timestamp: Date.now(),
      duration,
      metadata: size ? { size } : undefined,
    });
  }

  /**
   * Track scoring time
   */
  trackScoring(duration: number, recipeCount: number, cacheHit?: boolean): void {
    this.addEvent({
      type: 'scoring',
      timestamp: Date.now(),
      duration,
      metadata: {
        recipeCount,
        cacheHit: cacheHit || false,
      },
    });
  }

  /**
   * Track validation status
   */
  trackValidationStatus(status: 'valid' | 'needsReview' | 'invalid', recipeId?: string): void {
    this.addEvent({
      type: 'validation_status',
      timestamp: Date.now(),
      metadata: {
        status,
        recipeId,
      },
    });
  }

  /**
   * Track page load time
   */
  trackPageLoad(duration: number, page: string): void {
    this.addEvent({
      type: 'page_load',
      timestamp: Date.now(),
      duration,
      metadata: { page },
    });
  }

  private addEvent(event: TelemetryEvent): void {
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS);
    }
    
    this.saveEvents();
    
    // Auto-flush if batch size reached
    if (this.events.length >= BATCH_SIZE) {
      this.flush();
    }
  }

  /**
   * Get telemetry summary statistics
   */
  getSummary(): {
    jsonLoadTimes: number[];
    scoringTimes: number[];
    validationStatuses: Record<string, number>;
    pageLoadTimes: Record<string, number[]>;
  } {
    const jsonLoadTimes: number[] = [];
    const scoringTimes: number[] = [];
    const validationStatuses: Record<string, number> = {};
    const pageLoadTimes: Record<string, number[]> = {};

    this.events.forEach(event => {
      switch (event.type) {
        case 'json_load':
          if (event.duration) jsonLoadTimes.push(event.duration);
          break;
        case 'scoring':
          if (event.duration) scoringTimes.push(event.duration);
          break;
        case 'validation_status':
          const status = event.metadata?.status || 'unknown';
          validationStatuses[status] = (validationStatuses[status] || 0) + 1;
          break;
        case 'page_load':
          const page = event.metadata?.page || 'unknown';
          if (!pageLoadTimes[page]) pageLoadTimes[page] = [];
          if (event.duration) pageLoadTimes[page].push(event.duration);
          break;
      }
    });

    return {
      jsonLoadTimes,
      scoringTimes,
      validationStatuses,
      pageLoadTimes,
    };
  }

  /**
   * Flush events to server (if endpoint available) or console
   */
  flush(): void {
    if (this.events.length === 0) return;

    const summary = this.getSummary();
    
    // Log summary to console (in development)
    if (process.env.NODE_ENV === 'development') {
      const { jsonLoadTimes, scoringTimes, validationStatuses, pageLoadTimes } = summary;
      console.log('📊 Telemetry Summary:', {
        totalEvents: this.events.length,
        jsonLoadAvg: jsonLoadTimes.length > 0 
          ? (jsonLoadTimes.reduce((a: number, b: number) => a + b, 0) / jsonLoadTimes.length).toFixed(2) + 'ms'
          : 'N/A',
        scoringAvg: scoringTimes.length > 0
          ? (scoringTimes.reduce((a: number, b: number) => a + b, 0) / scoringTimes.length).toFixed(2) + 'ms'
          : 'N/A',
        validationStatuses,
        pageLoadAvgs: Object.entries(pageLoadTimes).map(([page, times]) => ({
          page,
          avg: (Array.isArray(times) ? times.reduce((a: number, b: number) => a + b, 0) / times.length : 0).toFixed(2) + 'ms',
        })),
      });
    }

    // TODO: Send to analytics endpoint if available
    // Example:
    // fetch('/api/telemetry', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ events: this.events, summary }),
    // }).catch(() => {});

    // Clear events after flushing
    this.events = [];
    this.saveEvents();
  }

  /**
   * Clear all telemetry data
   */
  clear(): void {
    this.events = [];
    this.saveEvents();
  }
}

// Singleton instance
let telemetryInstance: Telemetry | null = null;

export function getTelemetry(): Telemetry {
  if (!telemetryInstance) {
    telemetryInstance = new Telemetry();
  }
  return telemetryInstance;
}

// Convenience functions
export const trackJsonLoad = (duration: number, size?: number) => 
  getTelemetry().trackJsonLoad(duration, size);

export const trackScoring = (duration: number, recipeCount: number, cacheHit?: boolean) =>
  getTelemetry().trackScoring(duration, recipeCount, cacheHit);

export const trackValidationStatus = (status: 'valid' | 'needsReview' | 'invalid', recipeId?: string) =>
  getTelemetry().trackValidationStatus(status, recipeId);

export const trackPageLoad = (duration: number, page: string) =>
  getTelemetry().trackPageLoad(duration, page);

export const getTelemetrySummary = () => getTelemetry().getSummary();

export const flushTelemetry = () => getTelemetry().flush();

