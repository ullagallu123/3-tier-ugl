# CRUD Application with Monitoring

This is a simple CRUD application built with Node.js, Express, MySQL, and Redis, with comprehensive monitoring and testing.

## Features

- RESTful API for managing entries
- MySQL database for persistence
- Redis for caching
- Comprehensive test suite
- Monitoring with New Relic, OpenTelemetry, and Prometheus

## Prerequisites

- Node.js
- MySQL
- Redis
- (Optional) New Relic account
- (Optional) OpenTelemetry backend (Jaeger, Zipkin, etc.)
- (Optional) Prometheus server

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

4. Start the server:

```bash
npm start
```

## Testing

Run the test suite:

```bash
npm test
```

## API Endpoints

- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /api/entries` - Get all entries
- `POST /api/entries` - Create a new entry
- `DELETE /api/entries/:id` - Delete an entry

## Monitoring

### New Relic

This application is configured to use New Relic for application performance monitoring. Set your license key in the `.env` file.

### OpenTelemetry

Distributed tracing is implemented with OpenTelemetry. Configure your OpenTelemetry backend in the `.env` file.

### Prometheus

Prometheus metrics are exposed at the `/metrics` endpoint. Connect your Prometheus server to scrape these metrics.

## Metrics Available

- HTTP request duration
- Database query duration
- Redis operation duration
- Cache hit/miss counts
- Active connections

## License

MIT