export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node')
    const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node')
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http')
    const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http')
    const { OTLPLogExporter } = await import('@opentelemetry/exporter-logs-otlp-http')
    const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics')
    const { SimpleLogRecordProcessor } = await import('@opentelemetry/sdk-logs')
    const { Resource } = await import('@opentelemetry/resources')
    const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = await import('@opentelemetry/semantic-conventions')
    const { SpanStatusCode } = await import('@opentelemetry/api')

    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318'

    const sdk = new NodeSDK({
      resource: new Resource({
        [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? 'sphone-api',
        [ATTR_SERVICE_VERSION]: '1.0.0',
        'deployment.environment': process.env.NODE_ENV ?? 'production',
        'service.namespace': 'sphone',
      }),
      traceExporter: new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`,
      }),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${otlpEndpoint}/v1/metrics`,
        }),
        exportIntervalMillis: 15_000,
      }),
      logRecordProcessors: [
        new SimpleLogRecordProcessor(
          new OTLPLogExporter({
            url: `${otlpEndpoint}/v1/logs`,
          }),
        ),
      ],
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': { enabled: false },
          '@opentelemetry/instrumentation-net': { enabled: false },
          '@opentelemetry/instrumentation-dns': { enabled: false },
          '@opentelemetry/instrumentation-http': {
            responseHook: (span, response) => {
              const status = 'statusCode' in response ? response.statusCode : undefined
              if (status && status >= 400) {
                span.setStatus({ code: SpanStatusCode.ERROR, message: `HTTP ${status}` })
              }
            },
          },
          // Prisma now uses @prisma/adapter-pg (Node.js driver) so pg CLIENT spans are
          // captured here. peer.service=postgresql makes Tempo render it as a named node.
          '@opentelemetry/instrumentation-pg': {
            requestHook: (span) => {
              span.setAttribute('peer.service', 'postgresql')
            },
          },
          // peer.service lets Tempo service graph build named virtual nodes for Redis and Kafka
          '@opentelemetry/instrumentation-ioredis': {
            requestHook: (span) => {
              span.setAttribute('peer.service', 'redis')
            },
          },
          '@opentelemetry/instrumentation-kafkajs': {
            producerHook: (span) => {
              span.setAttribute('peer.service', 'kafka')
            },
            consumerHook: (span) => {
              span.setAttribute('peer.service', 'kafka')
            },
          },
        }),
      ],
    })

    sdk.start()

    process.on('SIGTERM', () => {
      sdk.shutdown().catch(console.error)
    })
  }
}
