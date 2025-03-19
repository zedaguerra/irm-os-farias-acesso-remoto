import { logger } from './logger';
import { captureError } from './monitoring';

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  jsHeapSize: number | null;
  domNodes: number | null;
  resourceCount: number | null;
}

export function initializePerformanceMonitoring() {
  try {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcp = entries[entries.length - 1];
      logMetric('FCP', fcp);
    }).observe({ type: 'paint', buffered: true });

    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lcp = entries[entries.length - 1];
      logMetric('LCP', lcp);
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-input') {
          logMetric('FID', entry);
        }
      });
    }).observe({ type: 'first-input', buffered: true });

    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        logMetric('CLS', entry);
      });
    }).observe({ type: 'layout-shift', buffered: true });

    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.initiatorType === 'navigation') {
          logMetric('TTFB', entry);
        }
      });
    }).observe({ type: 'navigation', buffered: true });

    setInterval(monitorResourceUsage, Number(import.meta.env.VITE_METRIC_INTERVAL) || 60000);
  } catch (error) {
    captureError(error as Error, { context: 'Performance Monitoring' });
  }
}

function logMetric(metricName: string, entry: PerformanceEntry) {
  logger.info(`Performance metric: ${metricName}`, {
    metric: metricName,
    value: entry.startTime,
    duration: 'duration' in entry ? entry.duration : undefined,
    timestamp: Date.now()
  });
}

function monitorResourceUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    logger.info('Memory usage:', {
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize
    });
  }

  const resources = performance.getEntriesByType('resource');
  logger.info('Resource usage:', {
    count: resources.length,
    totalSize: resources.reduce((acc, r) => acc + (r as any).encodedBodySize || 0, 0)
  });
}

export function getPerformanceMetrics(): PerformanceMetrics {
  return {
    fcp: getFCP(),
    lcp: getLCP(),
    fid: getFID(),
    cls: getCLS(),
    ttfb: getTTFB(),
    jsHeapSize: getJSHeapSize(),
    domNodes: getDOMNodes(),
    resourceCount: getResourceCount()
  };
}

function getFCP(): number | null {
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
  return fcpEntry ? fcpEntry.startTime : null;
}

function getLCP(): number | null {
  const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
  const lastEntry = lcpEntries[lcpEntries.length - 1];
  return lastEntry ? lastEntry.startTime : null;
}

function getFID(): number | null {
  const fidEntries = performance.getEntriesByType('first-input');
  const firstEntry = fidEntries[0];
  return firstEntry ? firstEntry.processingStart - firstEntry.startTime : null;
}

function getCLS(): number | null {
  let clsValue = 0;
  const entries = performance.getEntriesByType('layout-shift');
  entries.forEach(entry => {
    if (!(entry as any).hadRecentInput) {
      clsValue += (entry as any).value;
    }
  });
  return clsValue;
}

function getTTFB(): number | null {
  const navEntry = performance.getEntriesByType('navigation')[0];
  return navEntry ? (navEntry as any).responseStart : null;
}

function getJSHeapSize(): number | null {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return null;
}

function getDOMNodes(): number | null {
  return document.getElementsByTagName('*').length;
}

function getResourceCount(): number | null {
  return performance.getEntriesByType('resource').length;
}