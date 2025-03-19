import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { logger } from './logger';
import { getPerformanceMetrics } from './performance';

const ALERT_THRESHOLDS = {
  RESPONSE_TIME: 2000,
  ERROR_RATE: 0.01,
  CPU_USAGE: 80,
  MEMORY_USAGE: 85
};

export function initializeMonitoring() {
  if (process.env.NODE_ENV === 'production' && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing({
          tracePropagationTargets: ['localhost', /^https:\/\/.*irmaosfarias\.com/],
        }),
        new Sentry.Replay()
      ],
      tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE) || 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
      release: import.meta.env.VITE_SENTRY_RELEASE,
      beforeSend(event) {
        if (event.exception) {
          logger.error('Error captured by Sentry:', {
            error: event.exception,
            user: event.user,
            tags: event.tags,
            performance: getPerformanceMetrics()
          });
        }
        return event;
      }
    });

    initializePerformanceMonitoring();
  }
}

export function monitorMetrics(metrics: {
  responseTime?: number;
  errorCount?: number;
  totalRequests?: number;
  cpuUsage?: number;
  memoryUsage?: number;
}) {
  const {
    responseTime,
    errorCount = 0,
    totalRequests = 0,
    cpuUsage,
    memoryUsage
  } = metrics;

  if (responseTime && responseTime > ALERT_THRESHOLDS.RESPONSE_TIME) {
    logger.warn('High response time detected', {
      value: responseTime,
      threshold: ALERT_THRESHOLDS.RESPONSE_TIME
    });
    captureMetricAlert('response_time', responseTime);
  }

  if (totalRequests > 0) {
    const errorRate = errorCount / totalRequests;
    if (errorRate > ALERT_THRESHOLDS.ERROR_RATE) {
      logger.warn('High error rate detected', {
        value: errorRate,
        threshold: ALERT_THRESHOLDS.ERROR_RATE
      });
      captureMetricAlert('error_rate', errorRate);
    }
  }

  if (cpuUsage && cpuUsage > ALERT_THRESHOLDS.CPU_USAGE) {
    logger.warn('High CPU usage detected', {
      value: cpuUsage,
      threshold: ALERT_THRESHOLDS.CPU_USAGE
    });
    captureMetricAlert('cpu_usage', cpuUsage);
  }

  if (memoryUsage && memoryUsage > ALERT_THRESHOLDS.MEMORY_USAGE) {
    logger.warn('High memory usage detected', {
      value: memoryUsage,
      threshold: ALERT_THRESHOLDS.MEMORY_USAGE
    });
    captureMetricAlert('memory_usage', memoryUsage);
  }
}

function captureMetricAlert(metric: string, value: number) {
  Sentry.captureMessage(`High ${metric} detected`, {
    level: 'warning',
    extra: {
      metric,
      value,
      timestamp: new Date().toISOString(),
      thresholds: ALERT_THRESHOLDS
    }
  });
}

export function captureError(error: Error, context?: Record<string, any>) {
  logger.error('Application error:', {
    error: error.message,
    stack: error.stack,
    context,
    performance: getPerformanceMetrics()
  });

  Sentry.captureException(error, {
    extra: {
      ...context,
      performance: getPerformanceMetrics()
    }
  });
}

export function setUserContext(userId: string, email?: string, role?: string) {
  Sentry.setUser({
    id: userId,
    email,
    role
  });

  logger.info('User context set:', { userId, email, role });
}

export function startTransaction(name: string, op: string) {
  const transaction = Sentry.startTransaction({
    name,
    op
  });

  Sentry.configureScope(scope => {
    scope.setSpan(transaction);
  });

  return transaction;
}

export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
  logger.debug('Tag set:', { key, value });
}

export function addBreadcrumb(message: string, category?: string, level?: Sentry.SeverityLevel) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now()
  });
}