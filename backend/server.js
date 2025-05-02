// Initialize New Relic only if license key is provided
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}
// Initialize OpenTelemetry
require('./opentelemetry');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db-config');
const redis = require('./redis-client');
const { register, metrics } = require('./metrics');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(bodyParser.json());

// CORS Configuration
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('CORS Allowed Origin:', ALLOWED_ORIGIN);

// Preflight
app.options('/api/entries', cors());

// Metrics and Monitoring middleware
app.use((req, res, next) => {
  // Increment active connections
  metrics.activeConnections.inc();

  // Record request start time
  const start = Date.now();

  // Record response time on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.httpRequestDurationMicroseconds
      .labels(req.method, req.route ? req.route.path : req.path, res.statusCode)
      .observe(duration);
    
    // Decrement active connections
    metrics.activeConnections.dec();
  });

  next();
});

// Expose metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 20px;">
        <h1 style="color: green;">Server is healthy</h1>
      </body>
    </html>
  `);
});

// Fetch All Entries with Redis Cache
app.get('/api/entries', async (req, res) => {
  try {
    const cacheKey = 'all_entries';
    const startRedis = Date.now();
    const cachedData = await redis.get(cacheKey);
    const redisGetDuration = Date.now() - startRedis;
    metrics.redisOperationDurationMicroseconds.labels('get').observe(redisGetDuration);

    if (cachedData) {
      console.log('Serving from Redis cache');
      metrics.cacheHitCounter.inc();
      return res.json(JSON.parse(cachedData));
    }

    metrics.cacheMissCounter.inc();
    const startDb = Date.now();
    db.query('SELECT * FROM entries', async (err, results) => {
      const dbQueryDuration = Date.now() - startDb;
      metrics.dbQueryDurationMicroseconds.labels('select', 'entries').observe(dbQueryDuration);

      if (err) {
        console.error('Database Fetch Error:', err);
        return res.status(500).send({ error: 'Internal Server Error' });
      }

      const startRedisSet = Date.now();
      await redis.set(cacheKey, JSON.stringify(results), 'EX', 60); // Cache for 1 min
      const redisSetDuration = Date.now() - startRedisSet;
      metrics.redisOperationDurationMicroseconds.labels('set').observe(redisSetDuration);

      console.log('Serving from Database and caching');
      res.json(results);
    });
  } catch (err) {
    console.error('Redis Fetch Error:', err);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Add New Entry
app.post('/api/entries', (req, res) => {
  const { amount, description } = req.body;

  if (!amount || !description) {
    return res.status(400).send({ error: 'Amount and description are required' });
  }

  const startDb = Date.now();
  const query = 'INSERT INTO entries (amount, description) VALUES (?, ?)';
  db.query(query, [amount, description], async (err, result) => {
    const dbQueryDuration = Date.now() - startDb;
    metrics.dbQueryDurationMicroseconds.labels('insert', 'entries').observe(dbQueryDuration);

    if (err) {
      console.error('Database Insert Error:', err);
      return res.status(500).send({ error: 'Failed to insert entry' });
    }
    console.log('Inserted entry with ID:', result.insertId);

    // Clear the cache because data changed
    const startRedisDel = Date.now();
    await redis.del('all_entries');
    const redisDelDuration = Date.now() - startRedisDel;
    metrics.redisOperationDurationMicroseconds.labels('del').observe(redisDelDuration);

    res.status(201).send({ id: result.insertId, amount, description });
  });
});

// Delete Entry by ID
app.delete('/api/entries/:id', (req, res) => {
  const entryId = req.params.id;

  const startDb = Date.now();
  const query = 'DELETE FROM entries WHERE id = ?';
  db.query(query, [entryId], async (err, result) => {
    const dbQueryDuration = Date.now() - startDb;
    metrics.dbQueryDurationMicroseconds.labels('delete', 'entries').observe(dbQueryDuration);

    if (err) {
      console.error('Database Delete Error:', err);
      return res.status(500).send({ error: 'Failed to delete entry' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ error: 'Entry not found' });
    }

    console.log('Deleted entry with ID:', entryId);

    // Clear the cache because data changed
    const startRedisDel = Date.now();
    await redis.del('all_entries');
    const redisDelDuration = Date.now() - startRedisDel;
    metrics.redisOperationDurationMicroseconds.labels('del').observe(redisDelDuration);

    res.send({ message: 'Entry deleted successfully' });
  });
});

// Export app for testing
module.exports = app;

// Start Server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}