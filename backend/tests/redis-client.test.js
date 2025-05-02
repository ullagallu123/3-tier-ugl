const Redis = require('ioredis');

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: jest.fn((event, callback) => {
        if (event === 'connect') {
          callback();
        }
      }),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn()
    };
  });
});

describe('Redis Client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear cache of modules to ensure fresh requires
    jest.resetModules();
  });

  it('should create a Redis client with default config', () => {
    // Require the redis client module
    require('../redis-client');

    // Check if Redis constructor was called with the correct parameters
    expect(Redis).toHaveBeenCalledWith({
      host: 'localhost',
      port: 6379,
      password: undefined
    });
  });

  it('should create a Redis client with environment variables', () => {
    // Set environment variables for the test
    process.env.REDIS_HOST = 'test-redis-host';
    process.env.REDIS_PORT = '6380';
    process.env.REDIS_PASSWORD = 'test-password';

    // Require the redis client module (which will use the environment variables)
    require('../redis-client');

    // Check if Redis constructor was called with the correct parameters
    expect(Redis).toHaveBeenCalledWith({
      host: 'test-redis-host',
      port: '6380',
      password: 'test-password'
    });

    // Clean up environment variables
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.REDIS_PASSWORD;
  });

  it('should log when connected to Redis', () => {
    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log');

    // Require the redis client module
    require('../redis-client');

    // Verify that connection message is logged
    expect(consoleSpy).toHaveBeenCalledWith('Connected to Redis');

    // Restore console.log
    consoleSpy.mockRestore();
  });

  it('should handle connection errors', () => {
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error');

    // Mock the Redis client to simulate an error
    Redis.mockImplementationOnce(() => {
      return {
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('Redis connection error'));
          }
        }),
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn()
      };
    });

    // Require the redis client module
    require('../redis-client');

    // Trigger the error event
    const redisInstance = Redis.mock.results[0].value;
    const errorCallback = redisInstance.on.mock.calls.find(call => call[0] === 'error')[1];
    errorCallback(new Error('Redis connection error'));

    // Verify that error is logged
    expect(consoleSpy).toHaveBeenCalled();

    // Restore console.error
    consoleSpy.mockRestore();
  });
});