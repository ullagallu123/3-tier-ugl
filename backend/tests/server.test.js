const request = require('supertest');
const app = require('../server');

// Mock the database and redis modules
jest.mock('../db-config', () => {
  return {
    query: jest.fn((query, params, callback) => {
      if (typeof params === 'function') {
        callback = params;
        params = undefined;
      }

      if (query.includes('SELECT')) {
        callback(null, [
          { id: 1, amount: 100, description: 'Test entry 1' },
          { id: 2, amount: 200, description: 'Test entry 2' }
        ]);
      } else if (query.includes('INSERT')) {
        callback(null, { insertId: 3 });
      } else if (query.includes('DELETE')) {
        if (params && params[0] === '999') {
          callback(null, { affectedRows: 0 });
        } else {
          callback(null, { affectedRows: 1 });
        }
      }
    }),
    connect: jest.fn(callback => callback())
  };
});

jest.mock('../redis-client', () => {
  let cache = {};
  return {
    get: jest.fn(key => {
      if (key === 'cached_key') {
        return Promise.resolve(JSON.stringify([{ id: 1, amount: 100, description: 'Cached entry' }]));
      }
      return Promise.resolve(cache[key] || null);
    }),
    set: jest.fn((key, value, ex, time) => {
      cache[key] = value;
      return Promise.resolve('OK');
    }),
    del: jest.fn(key => {
      delete cache[key];
      return Promise.resolve(1);
    }),
    on: jest.fn()
  };
});

// Mock the metrics module
jest.mock('../metrics', () => {
  return {
    register: {
      contentType: 'text/plain',
      metrics: () => 'metrics data'
    },
    metrics: {
      httpRequestDurationMicroseconds: {
        labels: () => ({ observe: jest.fn() })
      },
      dbQueryDurationMicroseconds: {
        labels: () => ({ observe: jest.fn() })
      },
      redisOperationDurationMicroseconds: {
        labels: () => ({ observe: jest.fn() })
      },
      cacheHitCounter: { inc: jest.fn() },
      cacheMissCounter: { inc: jest.fn() },
      activeConnections: { inc: jest.fn(), dec: jest.fn() }
    }
  };
});

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 OK with HTML', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Server is healthy');
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics', async () => {
      const res = await request(app).get('/metrics');
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('metrics data');
    });
  });

  describe('GET /api/entries', () => {
    it('should return entries from database when not cached', async () => {
      const res = await request(app).get('/api/entries');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].description).toBe('Test entry 1');
    });

    it('should return entries from cache when available', async () => {
      const redis = require('../redis-client');
      // Setup cache mock to return data for specific key
      redis.get.mockImplementationOnce(() => {
        return Promise.resolve(JSON.stringify([{ id: 1, amount: 100, description: 'Cached entry' }]));
      });

      const res = await request(app).get('/api/entries');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('Cached entry');
    });
  });

  describe('POST /api/entries', () => {
    it('should create a new entry', async () => {
      const res = await request(app)
        .post('/api/entries')
        .send({ amount: 300, description: 'New test entry' });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id', 3);
      expect(res.body).toHaveProperty('amount', 300);
      expect(res.body).toHaveProperty('description', 'New test entry');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/entries')
        .send({ amount: 300 });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Amount and description are required');
    });
  });

  describe('DELETE /api/entries/:id', () => {
    it('should delete an entry', async () => {
      const res = await request(app).delete('/api/entries/1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Entry deleted successfully');
    });

    it('should return 404 if entry not found', async () => {
      const res = await request(app).delete('/api/entries/999');
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Entry not found');
    });
  });
});