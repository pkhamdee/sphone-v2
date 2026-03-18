import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    '@opentelemetry/sdk-node',
    '@opentelemetry/auto-instrumentations-node',
    '@opentelemetry/exporter-trace-otlp-http',
    '@opentelemetry/exporter-metrics-otlp-http',
    '@opentelemetry/exporter-logs-otlp-http',
    '@opentelemetry/sdk-metrics',
    '@opentelemetry/sdk-logs',
    '@opentelemetry/resources',
    '@opentelemetry/semantic-conventions',
    '@opentelemetry/api',
  ],
};

export default nextConfig;
