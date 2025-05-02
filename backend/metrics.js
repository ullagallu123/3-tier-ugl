'use strict';

const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'crud-app'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [1, 5, 15, 50, 100, 200, 300, 400, 500, 1000]
});

const dbQueryDurationMicroseconds = new client.Histogram({
  name: 'db_query_duration_ms',
  help: 'Duration of database queries in ms',
  labelNames: ['query_type', 'table'],
  buckets: [1, 5, 15, 50, 100, 200, 500, 1000, 2000]
});

const redisOperationDurationMicroseconds = new client.Histogram({
  name: 'redis_operation_duration_ms',
  help: 'Duration of Redis operations in ms',
  labelNames: ['operation_type'],
  buckets: [1, 5, 10, 25, 50, 100, 250]
});

const cacheHitCounter = new client.Counter({
  name: 'cache_hit_total',
  help: 'Total number of cache hits'
});

const cacheMissCounter = new client.Counter({
  name: 'cache_miss_total',
  help: 'Total number of cache misses'
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Register the custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(dbQueryDurationMicroseconds);
register.registerMetric(redisOperationDurationMicroseconds);
register.registerMetric(cacheHitCounter);
register.registerMetric(cacheMissCounter);
register.registerMetric(activeConnections);

module.exports = {
  register,
  metrics: {
    httpRequestDurationMicroseconds,
    dbQueryDurationMicroseconds,
    redisOperationDurationMicroseconds,
    cacheHitCounter,
    cacheMissCounter,
    activeConnections
  }
};