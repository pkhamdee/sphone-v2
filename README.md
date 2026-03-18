# sPhone — Thai Installment Payment Platform

A full-stack demo platform for Thai phone/appliance installment financing (starting 500 THB/month, national ID only). Built as a learning project to explore **DDD + Hexagonal Architecture**, **Next.js full-stack**, and **production-grade observability** with distributed tracing.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Backend — sphone-api](#backend--sphone-api)
- [Frontend — sphone-app](#frontend--sphone-app)
- [Observability Stack](#observability-stack)
- [Load Generator](#load-generator)
- [Kubernetes Deployment](#kubernetes-deployment)
- [How to Run](#how-to-run)
- [Development](#development)
- [Key Design Decisions](#key-design-decisions)

---

## Architecture Overview

```
                    ┌──────────────────────────────────────────────────────────┐
                    │                    Docker Compose                         │
                    │                                                            │
  Browser ─────────►  sphone-app :3000  ─────────────►  sphone-api :8080       │
                    │  (Next.js 16 SSR)   /api/proxy      (Next.js 16 API)     │
                    │                                           │                │
                    │                              ┌────────────┼───────────┐   │
                    │                              ▼            ▼           ▼   │
                    │                         PostgreSQL     Redis        Kafka  │
                    │                            :5432        :6379       :9092  │
                    │                                                            │
                    │  ┌──────────────── Observability ──────────────────────┐  │
                    │  │  OTel Collector :4318 ──► Tempo  ──► Grafana :3333  │  │
                    │  │                       └──► Prometheus :9090          │  │
                    │  │  Promtail ─────────────► Loki   ──► Grafana :3333   │  │
                    │  └─────────────────────────────────────────────────────┘  │
                    └──────────────────────────────────────────────────────────┘
```

### Service Graph (Tempo)

```
user ──► sphone-app ──► sphone-api ──► postgresql
     └──────────────►              ├──► redis
                                   └──► kafka
```

---

## Project Structure

```
sphone/
├── docker-compose.yml          # Full local stack (all services)
├── sphone-api/                 # Backend — Next.js 16 API-only
├── sphone-app/                 # Frontend — Next.js 16 + React 19
├── sphone-load/                # Locust load generator
│   └── locustfile.py           # 6 weighted personas, 2 targets
├── sphone-deployment/          # Kubernetes manifests (Kustomize)
│   ├── base/                   # Base resources
│   └── overlays/               # development / staging / production
└── observability/              # OTel Collector, Tempo, Prometheus, Loki configs
    ├── otel-collector.yaml
    ├── tempo.yaml
    ├── prometheus.yaml
    ├── loki.yaml
    ├── promtail.yaml
    └── grafana/
        ├── provisioning/       # Auto-provisioned datasources + dashboards
        └── dashboards/         # sPhone overview, service graph panels
```

---

## Backend — sphone-api

### Architecture: DDD + Hexagonal (Clean Architecture)

```
sphone-api/src/
├── domain/             # Core business logic — zero external dependencies
│   ├── customers/      # Customer aggregate, NationalId/PhoneNumber value objects
│   ├── products/       # Product aggregate, Money value object
│   ├── orders/         # Order aggregate, InstallmentPlan value object (PMT formula)
│   └── payments/       # PaymentSchedule aggregate, PaymentItem entity
│
├── application/        # Use cases (Commands & Queries)
│   ├── customers/      # RegisterCustomer, LoginCustomer, GetCustomerProfile
│   ├── products/       # GetProducts, GetProductById
│   ├── orders/         # CreateOrder, GetMyOrders
│   └── payments/       # GetPaymentSchedule
│
├── infrastructure/     # Driven adapters — external services
│   ├── db/             # PrismaClient with @prisma/adapter-pg (Node.js pg driver)
│   ├── repositories/   # Prisma implementations of domain port interfaces
│   ├── cache/          # RedisCacheService (ioredis)
│   ├── messaging/      # KafkaEventBus (kafkajs)
│   ├── auth/           # JwtTokenService (jsonwebtoken)
│   └── container.ts    # Composition root — wires all dependencies
│
└── app/api/            # Driving adapters — Next.js route handlers
    ├── auth/           # POST /api/auth/register, POST /api/auth/login
    ├── customers/      # GET  /api/customers/me
    ├── products/       # GET  /api/products, GET /api/products/[id]
    ├── orders/         # POST /api/orders, GET /api/orders/my
    ├── payments/       # GET  /api/payments/schedule/[orderId]
    ├── health/         # GET  /api/health
    └── _middleware/    # JWT extraction helper
```

### Tech Stack

| Concern | Library | Version |
|---------|---------|---------|
| Framework | Next.js (App Router, API only) | 16.1.6 |
| Database ORM | Prisma + `@prisma/adapter-pg` | 6.8.0 |
| Database driver | `pg` (Node.js) via PrismaPg factory | ^8.20.0 |
| Cache | ioredis | ^5.4 |
| Messaging | kafkajs | ^2.2 |
| Auth | jsonwebtoken (HS256, 24h) | ^9.0 |
| Validation | Zod | ^3.24 |
| Observability | OpenTelemetry SDK + auto-instrumentation | ^0.57 |
| Testing | Vitest | ^4.1 |

### Domain Models

**Customer**
- `NationalId` — 13-digit Thai national ID (value object, validated format)
- `PhoneNumber` — Thai mobile (06/08/09 prefix, value object)
- `CreditLimit` — 30,000 THB default, 50,000 THB after verification

**Product** — 5 categories: phones, tablets, appliances, furniture, electric motorcycles (21 seeded products)

**Order / InstallmentPlan**
- Down payment: 5–30% of product price
- Terms: 3 / 6 / 12 / 18 / 24 months
- Interest: 18% APR using flat-rate PMT formula:
  ```
  monthlyPayment = PMT(0.18/12, months, principalAfterDown)
  ```

**PaymentSchedule** — auto-generated on order creation, one `PaymentItem` per month

### API Endpoints

```
POST /api/auth/register     — { nationalId, fullName, phoneNumber, dateOfBirth }
POST /api/auth/login        — { nationalId, phoneNumber } → { token }

GET  /api/customers/me      [auth]
GET  /api/products          [?category=1..5]
GET  /api/products/:id

POST /api/orders            [auth] — { productId, downPayment, totalMonths }
GET  /api/orders/my         [auth]
GET  /api/payments/schedule/:orderId  [auth]

GET  /api/health
```

### OTel Instrumentation (`instrumentation.ts`)

Traces, metrics, and logs are exported to the OTel Collector via OTLP HTTP.

Key instrumentation hooks that power the service graph in Grafana Tempo:

```typescript
// peer.service makes Tempo service graph create a named "postgresql" virtual node
'@opentelemetry/instrumentation-pg': {
  requestHook: (span) => span.setAttribute('peer.service', 'postgresql')
}

// Named "redis" virtual node
'@opentelemetry/instrumentation-ioredis': {
  requestHook: (span) => span.setAttribute('peer.service', 'redis')
}

// Named "kafka" virtual nodes (producer + consumer)
'@opentelemetry/instrumentation-kafkajs': {
  producerHook: (span) => span.setAttribute('peer.service', 'kafka'),
  consumerHook:  (span) => span.setAttribute('peer.service', 'kafka'),
}

// Mark 4xx/5xx responses as ERROR spans
'@opentelemetry/instrumentation-http': {
  responseHook: (span, res) => {
    if (res.statusCode >= 400) span.setStatus({ code: SpanStatusCode.ERROR })
  }
}
```

> **Why `@prisma/adapter-pg`?**
> Prisma's default Rust binary engine bypasses Node.js's `pg` module entirely, so
> `@opentelemetry/instrumentation-pg` cannot intercept its queries. Switching to
> `@prisma/adapter-pg` routes every DB call through Node.js `pg`, producing proper
> `CLIENT`-kind spans that Tempo's service graph processor recognises.
>
> `PrismaPg` is a **factory** — pass a config object, not a `pg.Pool` instance:
> ```typescript
> // schema.prisma: previewFeatures = ["driverAdapters"]
> const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
> const prisma  = new PrismaClient({ adapter })
> ```

---

## Frontend — sphone-app

### Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, product categories, how-it-works |
| `/products` | Product listing with category filter tabs |
| `/apply/[productId]` | Installment calculator + order submission |
| `/login` | Login with national ID + phone number |
| `/register` | New customer registration |
| `/dashboard` | Profile, order list, payment schedule viewer |

### Tech Stack

| Concern | Library |
|---------|---------|
| Framework | Next.js 16 + React 19 |
| Styling | TailwindCSS 4 |
| Server-state | @tanstack/react-query |
| Client-state | Zustand (auth store, localStorage persistence) |
| Forms | react-hook-form + Zod + @hookform/resolvers |
| HTTP client | Axios |

### Server-Side Proxy (`app/api/proxy/[...path]/route.ts`)

All browser API calls route through `/api/proxy` on the Next.js Node.js server. This is critical for observability:

```
Browser (axios)
    │  GET /api/proxy/products
    ▼
Next.js server route handler          ← OTel HTTP CLIENT span emitted here
    │  GET http://sphone-api:8080/api/products
    ▼
sphone-api                            ← OTel HTTP SERVER span emitted here
```

This creates the **sphone-app → sphone-api** edge in the Tempo service graph.
`INTERNAL_API_URL` env var provides the Docker-internal address (`http://sphone-api:8080`).

---

## Observability Stack

| Service | Port | Purpose |
|---------|------|---------|
| OTel Collector | :4317 gRPC, :4318 HTTP | Receives traces / metrics / logs from apps |
| Grafana Tempo | :3200 | Distributed tracing + service graph generation |
| Prometheus | :9090 | Metrics storage (remote write receiver enabled) |
| Grafana Loki | :3100 | Log aggregation |
| Promtail | — | Scrapes Docker container logs → Loki |
| Grafana | :3333 | Dashboards (admin/admin) |

### Telemetry Pipeline

```
sphone-api / sphone-app
       │  OTLP HTTP :4318
       ▼
  OTel Collector
  ├── Traces  ──────────────► Tempo         (otlp/grpc :4317)
  ├── Metrics ──────────────► Prometheus    (scrape endpoint :8889)
  └── Logs    ──────────────► Loki          (http :3100)

Tempo metrics_generator:
  ├── service_graphs  →  traces_service_graph_request_total  →  Prometheus (remote_write)
  └── span_metrics    →  traces_spanmetrics_*                →  Prometheus (remote_write)

Promtail:
  └── Docker socket  →  container stdout/stderr  →  Loki
```

### Service Graph Configuration

Tempo's service graph processor uses `peer_attributes` to create virtual nodes for services that only appear as `CLIENT`-side callers (no `SERVER` span of their own):

```yaml
# observability/tempo.yaml
metrics_generator:
  processor:
    service_graphs:
      peer_attributes:
        - peer.service     # set by ioredis/kafkajs hooks → "redis", "kafka"
        - db.system        # fallback for ORM-level spans → "postgresql"
        - messaging.system
```

### Grafana Dashboards

- **sPhone Overview** — request rate, error rate, p95 latency, DB query rate, cache hit rate, Kafka throughput
- **Service Graph** — node topology (from Tempo) + span metrics breakdown

Access: [http://localhost:3333](http://localhost:3333) — admin / admin (anonymous viewer also enabled)

---

## Load Generator

Six weighted Locust personas split across two targets, designed to exercise the full trace chain.

### Direct API (`http://localhost:5154`)

| Persona | Weight | Behaviour |
|---------|--------|-----------|
| `BrowseUser` | 4 | Anonymous: health → products → product detail |
| `RegisterAndBuyUser` | 2 | Register → login → browse → create order → view schedule |
| `ReturningCustomer` | 3 | Login → dashboard (profile + orders) → view payment schedule |

### Frontend via proxy (`http://localhost:3000`)

| Persona | Weight | Behaviour |
|---------|--------|-----------|
| `FrontendBrowseUser` | 4 | Page loads + products via `/api/proxy` |
| `FrontendBuyUser` | 2 | Register/login via proxy → apply page → create order |
| `FrontendDashUser` | 3 | Dashboard page loop via proxy |

Frontend personas route through `/api/proxy`, producing the full **sphone-app → sphone-api → pg/redis/kafka** trace chain.

### Running the load generator

```bash
# Via docker compose (1 user, headless)
docker compose --profile loadtest up -d

# Custom user count — standalone container on the compose network
docker run -d --name sphone-locust \
  --network sphone_default \
  -v ./sphone-load:/mnt/locust:ro \
  -p 8089:8089 \
  locustio/locust:2.32.3 \
  -f /mnt/locust/locustfile.py \
  --host http://sphone-api:8080 \
  --headless --users 5 --spawn-rate 1

# Locust web UI (live stats even in headless mode)
open http://localhost:8089
```

---

## Kubernetes Deployment

Manifests use **Kustomize** with a base + environment overlays pattern.

```
sphone-deployment/
├── base/                       # Shared k8s resources
│   ├── api/                    # sphone-api Deployment + Service + ConfigMap
│   ├── app/                    # sphone-app Deployment + Service
│   ├── postgres/               # StatefulSet + Service
│   ├── redis/                  # Deployment + Service
│   ├── kafka/                  # Kafka + Zookeeper StatefulSets + Services
│   ├── ingress/                # Ingress rules
│   └── observability/          # Prometheus, Tempo deployments
└── overlays/
    ├── development/            # Dev patches — image tags, relaxed limits, secrets
    ├── staging/                # Staging patches
    └── production/             # Production patches — resource limits, replicas, HPA
```

```bash
kubectl apply -k sphone-deployment/overlays/development
kubectl apply -k sphone-deployment/overlays/staging
kubectl apply -k sphone-deployment/overlays/production
```

---

## How to Run

### Prerequisites

- Docker + Docker Compose (Rancher Desktop works well on macOS)
- Node.js 22+ (for local development only)

### Start Everything

```bash
git clone <repo>
cd sphone

# Start all services — first run pulls images, runs DB migrations, seeds 21 products
docker compose up -d

# Check all services are healthy
docker compose ps
```

### Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | — |
| API | http://localhost:5154/api/health | — |
| Grafana | http://localhost:3333 | admin / admin |
| Prometheus | http://localhost:9090 | — |
| Tempo | http://localhost:3200 | — |
| Loki | http://localhost:3100 | — |
| Locust UI | http://localhost:8089 | — |

### Start with Load Testing

```bash
# 1 user (via compose profile)
docker compose --profile loadtest up -d

# 5 users (standalone, recommended)
docker run -d --name sphone-locust \
  --network sphone_default \
  -v ./sphone-load:/mnt/locust:ro \
  -p 8089:8089 \
  locustio/locust:2.32.3 \
  -f /mnt/locust/locustfile.py \
  --host http://sphone-api:8080 \
  --headless --users 5 --spawn-rate 1
```

### Stop

```bash
docker rm -f sphone-locust && docker compose down        # stop + remove containers
docker rm -f sphone-locust && docker compose down -v     # also remove volumes (wipes database)
```

---

## Development

### sphone-api

```bash
cd sphone-api
npm install

# Start only infrastructure (skip app services)
docker compose up -d postgres redis kafka otel-collector tempo prometheus loki

# Run DB migration + seed
npx prisma migrate deploy
npx prisma db seed

# Start dev server (port 5154, Turbopack)
npm run dev

# Tests
npm test
npm run test:coverage
```

**`.env.local`**
```env
DATABASE_URL=postgresql://sphone:sphone123@localhost:5432/sphone
REDIS_URL=redis://localhost:6379
KAFKA_BROKERS=localhost:9092
JWT_SECRET=sphone-super-secret-key-minimum-32-characters!!
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=sphone-api
NODE_ENV=development
```

### sphone-app

```bash
cd sphone-app
npm install
npm run dev   # port 3000
```

**`.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5154/api
INTERNAL_API_URL=http://localhost:5154
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=sphone-app
```

### Rebuild Docker images after code changes

```bash
docker compose build sphone-api
docker compose up -d --no-build sphone-api

# Both services
docker compose build sphone-api sphone-app
docker compose up -d --no-build sphone-api sphone-app
```

---

## Key Design Decisions

### DDD + Hexagonal Architecture
The domain layer has zero dependencies on frameworks or infrastructure. Application layer defines port interfaces (`IProductRepository`, `ICacheService`, `IEventBus`). Infrastructure implements these ports. Next.js route handlers are thin driving adapters that translate HTTP into application commands/queries.

### Prisma with Node.js pg Adapter
Prisma's default Rust binary engine bypasses Node.js entirely, making database calls invisible to OpenTelemetry. `@prisma/adapter-pg` (must match `@prisma/client` version — both 6.8.0) switches to the Node.js `pg` driver so every query produces a `CLIENT`-kind span visible to `@opentelemetry/instrumentation-pg`. Required: `previewFeatures = ["driverAdapters"]` in `schema.prisma`. `PrismaPg` is a factory — pass a config object, not a `pg.Pool` instance (passing a Pool silently causes ECONNREFUSED).

### Next.js for API-only Backend
App Router file-based routing gives clean endpoint organisation without a custom server. Standalone output mode (`output: "standalone"`) produces a minimal Docker image. The `instrumentation.ts` hook initialises the OTel SDK before any request handler runs.

### Server-Side Proxy in sphone-app
Browser-side axios calls are invisible to Node.js OpenTelemetry. The `/api/proxy/[...path]` route handler proxies all API calls server-side, producing the `sphone-app → sphone-api` HTTP `CLIENT` span that Tempo needs for the complete service graph topology.

### Tempo Service Graph Virtual Nodes
`peer_attributes` in the Tempo config tells the service graph processor which span attributes name virtual nodes (services without a SERVER span). Combined with `peer.service` set in instrumentation hooks, this produces named `postgresql`, `redis`, and `kafka` nodes in the Grafana service graph.

### Kafka KRaft Mode
Runs Confluent Platform 7.6 in KRaft mode (no ZooKeeper), reducing service count for local development.
