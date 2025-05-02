// Define types for our metrics
type MetricsExports = {
  register: any | null;
  httpRequestDurationMicroseconds: any | null;
  apiCallCounter: any | null;
};

// Initialize empty metrics
const metrics: MetricsExports = {
  register: null,
  httpRequestDurationMicroseconds: null,
  apiCallCounter: null
};

// Only initialize Prometheus metrics in Node.js environment
if (typeof window === 'undefined') {
  const { Registry, collectDefaultMetrics } = require('prom-client');
  
  metrics.register = new Registry();
  
  // Add default metrics (CPU, memory, etc.)
  collectDefaultMetrics({ register: metrics.register });
  
  // Custom metrics
  metrics.httpRequestDurationMicroseconds = new metrics.register.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
  });
  
  metrics.apiCallCounter = new metrics.register.Counter({
    name: 'api_calls_total',
    help: 'Total number of API calls',
    labelNames: ['method', 'endpoint']
  });
} else {
  console.warn('Prometheus metrics are disabled in browser environment');
}

export const { register, httpRequestDurationMicroseconds, apiCallCounter } = metrics;