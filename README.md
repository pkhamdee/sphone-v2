# sPhone Platform
.NET 10 backend (DDD + Clean Architecture, CQRS, JWT)
Next.js 16 frontend (TanStack Query, Zustand, React Hook Form)
PostgreSQL + Redis + Kafka infrastructure

# Observability
- OTel traces → Tempo, metrics → Prometheus, logs → Loki
- Grafana dashboard with metrics, 3 Tempo trace panels, and Loki logs

# Documentation
- C4_DIAGRAM.md — 5 diagrams covering all 3 C4 levels + sequence flow

How to run
# 1. Start infrastructure
cd /Users/pongsak.khamdee/repos/lab/sphone && docker-compose up -d

# 2. Start API (auto-migrates + seeds products)
cd sphone-api && dotnet run

# 3. Start frontend
cd ../sphone-app && npm run dev
API: http://localhost:5154 | Swagger: http://localhost:5154/swagger
Frontend: http://localhost:3000

Observability implementation Architecture

Apps → OTLP gRPC → OTel Collector → Traces  → Grafana Tempo
                                  → Metrics → Prometheus → Grafana
                                  → Logs    → Grafana Loki → Grafana
sphone-api (.NET) changes
8 NuGet packages added — OpenTelemetry.Extensions.Hosting, ASP.NET Core, HTTP, Runtime, EF Core, Redis, OTLP exporter, Prometheus exporter
Infrastructure/Observability/ObservabilityExtensions.cs — configures tracing (AspNetCore + HTTP + EF Core + Redis), metrics (runtime + ASP.NET Core), OTLP export, and Prometheus scrape endpoint at /metrics
Application/Common/SPhoneMetrics.cs — custom business metrics: sphone.orders.created, sphone.customers.registered, sphone.order.installment_amount_thb
Program.cs — wired AddObservability(), AddObservabilityLogging(), UseObservability(), and /health endpoint
sphone-app (Next.js) changes
6 npm packages added — @opentelemetry/sdk-node, auto-instrumentations-node, OTLP gRPC exporters, resources, semantic conventions
instrumentation.ts — server-side auto-instrumentation (HTTP, Express), exports traces+metrics via OTLP gRPC
next.config.ts — enabled instrumentationHook: true
Local dev (docker-compose)
5 new services — start everything with docker-compose up -d:

Service	URL	Purpose
OTel Collector	:4317 (gRPC), :4318 (HTTP)	Telemetry ingestion
Prometheus	localhost:9090	Metrics storage
Grafana Tempo	localhost:3200	Trace storage
Grafana Loki	localhost:3100	Log storage
Grafana	localhost:3333	Dashboards (admin/admin)
Grafana comes pre-provisioned with Prometheus, Tempo, and Loki datasources — including trace-to-log and trace-to-metrics correlation links. A pre-built sPhone — Service Overview dashboard is included.

Kubernetes (sphone-deployment)

# Deploy sphone app (unchanged)
kubectl apply -k overlays/development

# Deploy monitoring stack (separate, monitoring namespace)
kubectl apply -k monitoring/
The monitoring/ directory is its own Kustomize root so it doesn't conflict with the sphone namespace transformer.