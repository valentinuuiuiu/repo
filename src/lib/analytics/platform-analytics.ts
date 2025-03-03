 

// Event Types
import { z } from 'zod';

// Event Types
export enum EventType {
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PRODUCT_VIEW = 'product_view',
  PRODUCT_ADDED = 'product_added',
  ORDER_CREATED = 'order_created',
  ORDER_COMPLETED = 'order_completed',
  SUPPLIER_ADDED = 'supplier_added',
  AGENT_INTERACTION = 'agent_interaction',
  ERROR_OCCURRED = 'error_occurred',
  AGENT_TASK_STARTED = 'agent_task_started',
  AGENT_TASK_COMPLETED = 'agent_task_completed'
}

// Event Schema
const EventSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(EventType),
  timestamp: z.date(),
  userId: z.string().optional(),
  agentId: z.string().optional(),
  data: z.record(z.unknown()),
  metadata: z.object({
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    sessionId: z.string().optional()
  }).optional()
});

// Performance Metrics Schema
const PerformanceMetricSchema = z.object({
  metricName: z.string(),
  value: z.number(),
  timestamp: z.date(),
  category: z.string().optional()
});

// Analytics Configuration
interface AnalyticsConfig {
  enableLogging: boolean;
  logRetentionDays: number;
  performanceThresholds: Record<string, number>;
}

export class PlatformAnalytics {
  private events: z.infer<typeof EventSchema>[] = [];
  private performanceMetrics: z.infer<typeof PerformanceMetricSchema>[] = [];
  private config: AnalyticsConfig;

  constructor(config?: Partial<AnalyticsConfig>) {
    this.config = {
      enableLogging: true,
      logRetentionDays: 90,
      performanceThresholds: {
        agentResponseTime: 5000, // 5 seconds
        orderProcessingTime: 3600000, // 1 hour
        inventoryUpdateFrequency: 86400000 // 24 hours
      },
      ...config
    };
  }

  // Log an event
  logEvent(event: Omit<z.infer<typeof EventSchema>, 'id' | 'timestamp'>) {
    if (!this.config.enableLogging) return;

    const fullEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // Validate event
    try {
      EventSchema.parse(fullEvent);
      this.events.push(fullEvent);
      
      // Trigger any necessary alerts or actions
      this.processEventAlerts(fullEvent);
    } catch (error) {
      console.error('Invalid event logged:', error);
    }

    // Cleanup old events
    this.cleanupEvents();
  }

  // Log performance metric
  logPerformanceMetric(metric: Omit<z.infer<typeof PerformanceMetricSchema>, 'timestamp'>) {
    const fullMetric = {
      ...metric,
      timestamp: new Date()
    };

    try {
      PerformanceMetricSchema.parse(fullMetric);
      this.performanceMetrics.push(fullMetric);
      
      // Check against performance thresholds
      this.checkPerformanceThresholds(fullMetric);
    } catch (error) {
      console.error('Invalid performance metric:', error);
    }
  }

  // Cleanup old events based on retention policy
  private cleanupEvents() {
    const retentionCutoff = new Date(
      Date.now() - (this.config.logRetentionDays * 24 * 60 * 60 * 1000)
    );

    this.events = this.events.filter(
      event => event.timestamp > retentionCutoff
    );

    this.performanceMetrics = this.performanceMetrics.filter(
      metric => metric.timestamp > retentionCutoff
    );
  }

  // Process event alerts
  private processEventAlerts(event: z.infer<typeof EventSchema>) {
    switch (event.type) {
      case EventType.ERROR_OCCURRED:
        this.handleErrorEvent(event);
        break;
      case EventType.ORDER_CREATED:
        this.trackOrderCreation(event);
        break;
      case EventType.AGENT_INTERACTION:
        this.monitorAgentPerformance(event);
        break;
    }
  }

  // Handle error events
  private handleErrorEvent(event: z.infer<typeof EventSchema>) {
    // Log to error tracking service
    console.error('Platform Error:', event.data);
    
    // Send notification or trigger error response
    // In a real system, this might integrate with Sentry or similar
  }

  // Track order creation
  private trackOrderCreation(event: z.infer<typeof EventSchema>) {
    // Additional processing for order events
    // Could trigger supplier notifications, inventory updates, etc.
  }

  // Monitor agent performance
  private monitorAgentPerformance(event: z.infer<typeof EventSchema>) {
    // Track agent interaction metrics
    const responseTime = event.data.responseTime as number;
    
    if (responseTime > this.config.performanceThresholds.agentResponseTime) {
      console.warn('Agent response time exceeded threshold', event);
    }
  }

  // Check performance thresholds
  private checkPerformanceThresholds(metric: z.infer<typeof PerformanceMetricSchema>) {
    const threshold = this.config.performanceThresholds[metric.metricName];
    
    if (threshold && metric.value > threshold) {
      console.warn(`Performance threshold exceeded for ${metric.metricName}`, metric);
      
      // Trigger alert or notification
      // In a real system, this might send an email or Slack message
    }
  }

  // Advanced Analytics Methods
  getEventAnalytics() {
    // Aggregate event statistics
    const eventCounts = this.events.reduce((counts, event) => {
      counts[event.type] = (counts[event.type] || 0) + 1;
      return counts;
    }, {} as Record<EventType, number>);

    return {
      totalEvents: this.events.length,
      eventTypeCounts: eventCounts,
      lastEventTimestamp: this.events.length > 0 
        ? this.events[this.events.length - 1].timestamp 
        : null
    };
  }

  getPerformanceAnalytics() {
    // Aggregate performance metrics
    const metricAggregations = this.performanceMetrics.reduce((agg, metric) => {
      if (!agg[metric.metricName]) {
        agg[metric.metricName] = {
          values: [],
          average: 0,
          max: -Infinity,
          min: Infinity
        };
      }

      const metricAgg = agg[metric.metricName];
      metricAgg.values.push(metric.value);
      metricAgg.average = metricAgg.values.reduce((a, b) => a + b, 0) / metricAgg.values.length;
      metricAgg.max = Math.max(metricAgg.max, metric.value);
      metricAgg.min = Math.min(metricAgg.min, metric.value);

      return agg;
    }, {} as Record<string, { 
      values: number[], 
      average: number, 
      max: number, 
      min: number 
    }>);

    return {
      totalMetrics: this.performanceMetrics.length,
      metricAggregations
    };
  }

  // Export methods for external use
  exportEvents(filter?: Partial<z.infer<typeof EventSchema>>) {
    return filter 
      ? this.events.filter(event => 
          Object.entries(filter).every(([key, value]) => 
            event[key as keyof typeof event] === value
          )
        )
      : this.events;
  }

  exportPerformanceMetrics(filter?: Partial<z.infer<typeof PerformanceMetricSchema>>) {
    return filter
      ? this.performanceMetrics.filter(metric => 
          Object.entries(filter).every(([key, value]) => 
            metric[key as keyof typeof metric] === value
          )
        )
      : this.performanceMetrics;
  }
}

// Export Schemas for Type Checking
export const schemas = {
  Event: EventSchema,
  PerformanceMetric: PerformanceMetricSchema
};