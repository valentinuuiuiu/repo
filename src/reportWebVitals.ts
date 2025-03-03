type MetricType = 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';

interface PerformanceMetric {
  name: MetricType;
  value: number;
  id?: string;
}

type MetricsReportCallback = (metric: PerformanceMetric) => void;

const reportWebVitals = (onPerfEntry?: MetricsReportCallback): void => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    // Use native Performance API
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const metric: PerformanceMetric = {
          name: entry.name as MetricType,
          value: entry.startTime,
          id: entry.id
        };
        onPerfEntry(metric);
      });
    });

    // Observe performance entries
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

    // Cleanup
    return () => observer.disconnect();
  }
};

export default reportWebVitals;