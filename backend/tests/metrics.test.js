const client = require('prom-client');

// Mock prom-client
jest.mock('prom-client', () => {
  return {
    Registry: jest.fn().mockImplementation(() => ({
      setDefaultLabels: jest.fn(),
      registerMetric: jest.fn(),
      contentType: 'text/plain',
      metrics: jest.fn().mockResolvedValue('metrics data')
    })),
    Histogram: jest.fn().mockImplementation(() => ({
      labels: jest.fn().mockReturnValue({
        observe: jest.fn()
      })
    })),
    Counter: jest.fn().mockImplementation(() => ({
      inc: jest.fn()
    })),
    Gauge: jest.fn().mockImplementation(() => ({
      inc: jest.fn(),
      dec: jest.fn(),
      set: jest.fn()
    })),
    collectDefaultMetrics: jest.fn()
  };
});

describe('Metrics Module', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear cache of modules to ensure fresh requires
    jest.resetModules();
  });

  it('should create a registry with default labels', () => {
    // Require the metrics module
    const { register } = require('../metrics');

    // Check if setDefaultLabels was called with the correct parameters
    expect(register.setDefaultLabels).toHaveBeenCalledWith({
      app: 'crud-app'
    });
  });

  it('should collect default metrics', () => {
    // Require the metrics module
    require('../metrics');

    // Check if collectDefaultMetrics was called
    expect(client.collectDefaultMetrics).toHaveBeenCalled();
  });

  it('should define custom metrics', () => {
    // Require the metrics module
    const { metrics } = require('../metrics');

    // Check if all custom metrics exist
    expect(metrics.httpRequestDurationMicroseconds).toBeDefined();
    expect(metrics.dbQueryDurationMicroseconds).toBeDefined();
    expect(metrics.redisOperationDurationMicroseconds).toBeDefined();
    expect(metrics.cacheHitCounter).toBeDefined();
    expect(metrics.cacheMissCounter).toBeDefined();
    expect(metrics.activeConnections).toBeDefined();
  });

  it('should register all custom metrics', () => {
    // Require the metrics module
    const { register } = require('../metrics');

    // Check if registerMetric was called for each metric
    expect(register.registerMetric).toHaveBeenCalledTimes(6);
  });

  it('should create histograms with appropriate buckets', () => {
    // Require the metrics module
    require('../metrics');

    // Check if Histogram constructor was called with the correct parameters
    expect(client.Histogram).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'http_request_duration_ms',
        labelNames: ['method', 'route', 'status_code'],
        buckets: expect.any(Array)
      })
    );
  });
});