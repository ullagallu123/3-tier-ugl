'use strict';

const process = require('process');
const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const exporterOptions = {
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
};

const traceExporter = new OTLPTraceExporter(exporterOptions);
const sdk = new opentelemetry.NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-fs': {
      enabled: false,
    },
    '@opentelemetry/instrumentation-express': {
      enabled: true,
    },
    '@opentelemetry/instrumentation-http': {
      enabled: true,
    },
    '@opentelemetry/instrumentation-ioredis': {
      enabled: true,
    },
  })],
  serviceName: process.env.OTEL_SERVICE_NAME || 'crud-app',
});

// Async function to initialize OpenTelemetry
async function initializeTelemetry() {
  try {
    await sdk.start();  // Wait for the SDK to initialize
    console.log('OpenTelemetry initialized');
  } catch (error) {
    console.log('Error initializing OpenTelemetry', error);
  }
}

// Initialize telemetry
initializeTelemetry();

// Gracefully shut down the SDK on process exit
process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();  // Wait for the SDK to shut down
    console.log('OpenTelemetry terminated');
  } catch (error) {
    console.log('Error terminating OpenTelemetry', error);
  } finally {
    process.exit(0);
  }
});

module.exports = sdk;
