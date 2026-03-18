# C4 Architecture Diagrams — sPhone

> Diagrams use the [C4 model](https://c4model.com/) rendered with [Mermaid](https://mermaid.js.org/).
> Levels: **Context → Containers → Components → Code**

---

## Level 1 — System Context

Who uses the system and what external systems does it interact with.

```mermaid
C4Context
  title System Context — sPhone

  Person(customer, "Thai Customer", "Applies for phone/appliance installment via national ID")
  Person(admin, "Operations Team", "Monitors platform health via Grafana dashboards")

  System(sphone, "sPhone Platform", "Installment payment platform. Allows customers to browse products, apply for credit, and manage payment schedules.")

  System_Ext(sms, "SMS Gateway", "Sends OTP and payment reminders (future)")
  System_Ext(creditBureau, "Credit Bureau API", "Thai NECTEC/NCB national ID credit check (future)")

  Rel(customer, sphone, "Browses products, registers, creates orders", "HTTPS")
  Rel(admin, sphone, "Views traces, metrics, logs", "HTTPS / Grafana")
  Rel(sphone, sms, "Sends notifications", "HTTPS (future)")
  Rel(sphone, creditBureau, "Verifies national ID credit score", "HTTPS (future)")

  UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

---

## Level 2 — Container Diagram

The high-level technology choices and how containers communicate.

```mermaid
C4Container
  title Container Diagram — sPhone

  Person(customer, "Customer", "Thai user on browser or mobile")
  Person(admin, "Ops Team", "Uses Grafana")

  System_Boundary(sphone, "sPhone Platform") {

    Container(app, "sphone-app", "Next.js 16 / React 19", "Server-side rendered frontend. Serves pages, proxies API calls through /api/proxy to create traced server-to-server spans.")
    Container(api, "sphone-api", "Next.js 16 (API routes only)", "Business logic API. DDD + Hexagonal architecture. Handles auth, products, orders, payment schedules.")

    ContainerDb(postgres, "PostgreSQL 16", "Relational DB", "Stores customers, products, orders, payment schedules.")
    ContainerDb(redis, "Redis 7", "In-memory cache", "Caches product listings, customer profiles.")
    Container(kafka, "Kafka (KRaft)", "Apache Kafka 3.6", "Async event bus. Publishes OrderCreated events for downstream processing.")

    System_Boundary(obs, "Observability") {
      Container(otel, "OTel Collector", "OpenTelemetry Collector Contrib 0.120", "Receives OTLP traces/metrics/logs. Routes to Tempo, Prometheus, Loki.")
      Container(tempo, "Grafana Tempo", "2.7.2", "Distributed trace storage + service graph generation via metrics_generator.")
      Container(prometheus, "Prometheus", "3.2.1", "Time-series metrics. Remote write receiver for Tempo service graph metrics.")
      Container(loki, "Grafana Loki", "3.4.2", "Log aggregation. Receives structured logs from OTel Collector.")
      Container(promtail, "Promtail", "3.4.2", "Scrapes Docker container stdout/stderr logs → Loki.")
      Container(grafana, "Grafana", "11.4.2", "Dashboards: sPhone Overview, Service Graph, Logs.")
    }
  }

  Rel(customer, app, "Browses pages, submits forms", "HTTPS :3000")
  Rel(customer, api, "Direct API calls (load test)", "HTTPS :5154")
  Rel(admin, grafana, "Views dashboards", "HTTPS :3333")

  Rel(app, api, "Proxies API calls (server-side)", "HTTP /api/proxy → :8080")
  Rel(api, postgres, "Reads/writes domain data", "TCP :5432 (via pg driver)")
  Rel(api, redis, "Caches product/customer data", "TCP :6379 (ioredis)")
  Rel(api, kafka, "Publishes OrderCreated events", "TCP :9092 (kafkajs)")

  Rel(app, otel, "Exports traces, metrics, logs", "OTLP HTTP :4318")
  Rel(api, otel, "Exports traces, metrics, logs", "OTLP HTTP :4318")
  Rel(otel, tempo, "Forwards traces", "OTLP gRPC :4317")
  Rel(otel, prometheus, "Exposes metrics scrape endpoint", ":8889")
  Rel(otel, loki, "Pushes log streams", "HTTP :3100")
  Rel(tempo, prometheus, "Remote writes service graph metrics", "HTTP :9090")
  Rel(promtail, loki, "Pushes container logs", "HTTP :3100")
  Rel(grafana, prometheus, "Queries metrics", "HTTP :9090")
  Rel(grafana, tempo, "Queries traces", "HTTP :3200")
  Rel(grafana, loki, "Queries logs", "HTTP :3100")

  UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="2")
```

---

## Level 3 — Component Diagram: sphone-api

Internal architecture of the API container (DDD + Hexagonal).

```mermaid
C4Component
  title Component Diagram — sphone-api

  Container_Ext(app, "sphone-app", "Next.js frontend")
  Container_Ext(locust, "Locust", "Load generator")
  ContainerDb_Ext(postgres, "PostgreSQL", "")
  ContainerDb_Ext(redis, "Redis", "")
  Container_Ext(kafka, "Kafka", "")
  Container_Ext(otel, "OTel Collector", "")

  Container_Boundary(api, "sphone-api — Next.js API") {

    Component(routes, "Route Handlers", "Next.js app/api/**/route.ts", "Thin HTTP adapters. Parse requests, call application use cases, return JSON responses.")
    Component(authMw, "JWT Middleware", "_middleware/auth.ts", "Extracts and validates Bearer token from Authorization header.")
    Component(cors, "CORS Middleware", "src/middleware.ts", "Allows requests from sphone-app origin.")

    Component(authUC, "Auth Use Cases", "application/customers/", "RegisterCustomer, LoginCustomer commands with Zod validation.")
    Component(productUC, "Product Use Cases", "application/products/", "GetProducts, GetProductById queries with Redis caching.")
    Component(orderUC, "Order Use Cases", "application/orders/", "CreateOrder command — validates credit, computes PMT installment plan, publishes event.")
    Component(paymentUC, "Payment Use Cases", "application/payments/", "GetPaymentSchedule query.")

    Component(customerDomain, "Customer Domain", "domain/customers/", "Customer aggregate, NationalId + PhoneNumber value objects, CustomerRegisteredEvent.")
    Component(productDomain, "Product Domain", "domain/products/", "Product aggregate, Money value object, 5 product categories.")
    Component(orderDomain, "Order Domain", "domain/orders/", "Order aggregate, InstallmentPlan VO with PMT formula, OrderCreatedEvent.")
    Component(paymentDomain, "Payment Domain", "domain/payments/", "PaymentSchedule aggregate, PaymentItem entity, auto-generated on order.")

    Component(prismaRepos, "Prisma Repositories", "infrastructure/repositories/", "PrismaProductRepository, PrismaOrderRepository, etc. Implement domain port interfaces.")
    Component(redisCache, "Redis Cache Service", "infrastructure/cache/", "RedisCacheService implements ICacheService. JSON serialisation, TTL-based expiry.")
    Component(kafkaBus, "Kafka Event Bus", "infrastructure/messaging/", "KafkaEventBus implements IEventBus. Publishes domain events as Kafka messages.")
    Component(jwtSvc, "JWT Service", "infrastructure/auth/", "JwtTokenService implements IJwtService. HS256, 24h expiry, issuer: sphone-api.")
    Component(container, "DI Container", "infrastructure/container.ts", "Composition root. Wires all dependencies — repositories, services, use cases.")
    Component(prismaClient, "Prisma Client", "infrastructure/db/prisma.ts", "PrismaClient + PrismaPg adapter (Node.js pg driver). Enables OTel pg instrumentation.")

    Component(instrumentation, "OTel SDK", "instrumentation.ts", "NodeSDK with auto-instrumentations. Sets peer.service on pg/ioredis/kafkajs spans for Tempo service graph.")
  }

  Rel(app, routes, "HTTP requests", "HTTPS")
  Rel(locust, routes, "HTTP requests", "HTTPS")
  Rel(routes, authMw, "Authenticated routes pass through")
  Rel(routes, authUC, "Calls")
  Rel(routes, productUC, "Calls")
  Rel(routes, orderUC, "Calls")
  Rel(routes, paymentUC, "Calls")

  Rel(authUC, customerDomain, "Uses")
  Rel(productUC, productDomain, "Uses")
  Rel(orderUC, orderDomain, "Uses")
  Rel(paymentUC, paymentDomain, "Uses")

  Rel(authUC, container, "Resolves deps from")
  Rel(productUC, container, "Resolves deps from")
  Rel(orderUC, container, "Resolves deps from")
  Rel(paymentUC, container, "Resolves deps from")

  Rel(container, prismaRepos, "Creates")
  Rel(container, redisCache, "Creates")
  Rel(container, kafkaBus, "Creates")
  Rel(container, jwtSvc, "Creates")
  Rel(prismaRepos, prismaClient, "Uses")

  Rel(prismaClient, postgres, "Queries via pg driver", "TCP :5432")
  Rel(redisCache, redis, "GET/SET/DEL", "TCP :6379")
  Rel(kafkaBus, kafka, "Produce messages", "TCP :9092")
  Rel(instrumentation, otel, "Exports spans, metrics, logs", "OTLP HTTP :4318")

  UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="2")
```

---

## Level 3 — Component Diagram: sphone-app

Internal architecture of the frontend container.

```mermaid
C4Component
  title Component Diagram — sphone-app

  Person_Ext(customer, "Customer")
  Container_Ext(api, "sphone-api", "Next.js API")
  Container_Ext(otel, "OTel Collector", "")

  Container_Boundary(app, "sphone-app — Next.js Frontend") {

    Component(pages, "Pages", "app/**/page.tsx", "Home, Products, Apply, Login, Register, Dashboard. Server and client components.")
    Component(proxyRoute, "API Proxy Route", "app/api/proxy/[...path]/route.ts", "Server-side reverse proxy. Forwards browser API calls to sphone-api. Produces traced HTTP CLIENT spans.")

    Component(apiClient, "API Client", "lib/api.ts", "Axios instance. Browser: baseURL=/api/proxy. SSR: baseURL=NEXT_PUBLIC_API_URL. Attaches JWT from localStorage.")
    Component(authStore, "Auth Store", "lib/auth.ts", "Zustand store. Holds token + customer profile. Persisted to localStorage.")
    Component(types, "TypeScript Types", "lib/types.ts", "Shared DTOs matching sphone-api response shapes.")

    Component(queryProvider, "React Query", "app/layout.tsx", "QueryClientProvider wrapping the app. Manages server-state caching and revalidation.")

    Component(homeComp, "Home Components", "app/page.tsx", "Hero section, product category grid, how-it-works steps.")
    Component(productsComp, "Products Components", "app/products/", "Product listing with category filter tabs. Fetches via /api/proxy.")
    Component(applyComp, "Apply Components", "app/apply/[productId]/", "Installment calculator showing monthly payment. Order submission form.")
    Component(dashComp, "Dashboard Components", "app/dashboard/", "Customer profile, order list, payment schedule accordion.")
    Component(authForms, "Auth Forms", "app/login/, app/register/", "react-hook-form + Zod validated forms.")

    Component(instrumentation, "OTel SDK", "instrumentation.ts", "NodeSDK for server runtime. Instruments HTTP (ignores _next/ static). Exports to OTel Collector.")
  }

  Rel(customer, pages, "Navigates browser", "HTTPS :3000")
  Rel(customer, authForms, "Logs in / registers")
  Rel(pages, proxyRoute, "API calls via Axios client", "/api/proxy/*")
  Rel(proxyRoute, api, "Forwards requests server-side", "HTTP :8080")

  Rel(pages, apiClient, "Uses for data fetching")
  Rel(apiClient, proxyRoute, "Browser requests go to proxy")
  Rel(authForms, authStore, "Reads/writes token")
  Rel(pages, authStore, "Reads auth state")
  Rel(pages, queryProvider, "Data fetching via useQuery")

  Rel(productsComp, apiClient, "GET /products")
  Rel(applyComp, apiClient, "GET /products/:id, POST /orders")
  Rel(dashComp, apiClient, "GET /customers/me, /orders/my, /payments/schedule/:id")
  Rel(authForms, apiClient, "POST /auth/register, /auth/login")

  Rel(instrumentation, otel, "Exports traces, metrics, logs", "OTLP HTTP :4318")

  UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="2")
```

---

## Level 3 — Component Diagram: Observability Stack

How telemetry data flows through the observability pipeline.

```mermaid
C4Component
  title Component Diagram — Observability Stack

  Container_Ext(api, "sphone-api", "Next.js API")
  Container_Ext(app, "sphone-app", "Next.js Frontend")
  Person_Ext(admin, "Ops Team")

  Container_Boundary(obs, "Observability Stack") {

    Component(otelCol, "OTel Collector", "otel/opentelemetry-collector-contrib:0.120", "Central telemetry hub. Receives OTLP. Applies processors (batch, memory limiter, resource enrichment, Loki label transform). Routes to backends.")

    Component(tempo, "Grafana Tempo", "grafana/tempo:2.7.2", "Trace storage. Runs metrics_generator: service_graphs + span_metrics processors. Remote-writes derived Prometheus metrics.")
    Component(prometheus, "Prometheus", "prom/prometheus:v3.2.1", "Metrics storage. Remote-write receiver enabled. Scrapes OTel Collector :8889 and Tempo :3200.")
    Component(loki, "Grafana Loki", "grafana/loki:3.4.2", "Log storage. Single-binary mode. Stream labels: service.name, deployment.environment, cluster.")
    Component(promtail, "Promtail", "grafana/promtail:3.4.2", "Log collector. Reads Docker container logs via /var/run/docker.sock. Adds container metadata labels.")
    Component(grafana, "Grafana", "grafana/grafana:11.4.2", "Dashboard UI. Data sources: Tempo, Prometheus, Loki (auto-provisioned). Dashboards: sPhone Overview + Service Graph.")
  }

  Rel(api, otelCol, "OTLP HTTP traces+metrics+logs", ":4318")
  Rel(app, otelCol, "OTLP HTTP traces+metrics+logs", ":4318")
  Rel(otelCol, tempo, "OTLP gRPC traces", ":4317")
  Rel(otelCol, prometheus, "Prometheus scrape endpoint", "exposed at :8889")
  Rel(otelCol, loki, "Loki push logs", "HTTP :3100")
  Rel(promtail, loki, "Docker container logs", "HTTP :3100")
  Rel(tempo, prometheus, "Remote write service graph metrics", "HTTP :9090/api/v1/write")
  Rel(prometheus, grafana, "PromQL metric queries", "HTTP :9090")
  Rel(tempo, grafana, "TraceQL + service graph queries", "HTTP :3200")
  Rel(loki, grafana, "LogQL queries", "HTTP :3100")
  Rel(admin, grafana, "Views dashboards and traces", "HTTPS :3333")

  UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

---

## Level 4 — Code: Domain Model (sphone-api)

Key domain aggregates and their relationships.

```mermaid
classDiagram
  direction TB

  class Customer {
    +CustomerId id
    +NationalId nationalId
    +string fullName
    +PhoneNumber phoneNumber
    +Date dateOfBirth
    +Money creditLimit
    +CustomerStatus status
    +register()$ Customer
    +reconstitute()$ Customer
  }

  class NationalId {
    +string value
    +validate() void
  }

  class PhoneNumber {
    +string value
    +validate() void
  }

  class Product {
    +ProductId id
    +string name
    +string brand
    +Money price
    +ProductCategory category
    +boolean isAvailable
    +reconstitute()$ Product
  }

  class Money {
    +number amount
    +string currency
    +add() Money
    +multiply() Money
  }

  class Order {
    +OrderId id
    +CustomerId customerId
    +ProductId productId
    +InstallmentPlan plan
    +OrderStatus status
    +Date createdAt
    +create()$ Order
    +reconstitute()$ Order
  }

  class InstallmentPlan {
    +Money productPrice
    +Money downPayment
    +int totalMonths
    +Decimal interestRate
    +Money monthlyAmount
    +Money totalAmount
    +calculate()$ InstallmentPlan
    +pmt() number
  }

  class PaymentSchedule {
    +PaymentScheduleId id
    +OrderId orderId
    +Money totalAmount
    +int totalMonths
    +PaymentItem[] items
    +generate()$ PaymentSchedule
  }

  class PaymentItem {
    +string id
    +int installmentNumber
    +Date dueDate
    +Money amount
    +PaymentStatus status
    +Date? paidAt
  }

  Customer "1" *-- "1" NationalId
  Customer "1" *-- "1" PhoneNumber
  Product "1" *-- "1" Money
  Order "1" *-- "1" InstallmentPlan
  InstallmentPlan "1" *-- "3" Money
  PaymentSchedule "1" *-- "1..24" PaymentItem
  Order "1" -- "1" PaymentSchedule
  Order "1" --> "1" Customer
  Order "1" --> "1" Product
```

---

## Service Graph — Trace Topology

How distributed traces flow and how Tempo builds the service graph.

```mermaid
flowchart LR
  subgraph clients["External Clients"]
    browser["Browser"]
    locust["Locust\nLoad Generator"]
  end

  subgraph frontend["sphone-app :3000"]
    nextPages["Next.js Pages\n(SSR)"]
    proxyHandler["proxy route handler\n/api/proxy/[...path]\n← HTTP CLIENT span"]
  end

  subgraph backend["sphone-api :8080"]
    routeHandlers["Route Handlers\n← HTTP SERVER span"]
    appLayer["Application\nUse Cases"]
    pgQuery["pg driver\n← DB CLIENT span\npeer.service=postgresql"]
    ioredis["ioredis\n← CACHE CLIENT span\npeer.service=redis"]
    kafkaProducer["kafkajs producer\n← MSG PRODUCER span\npeer.service=kafka"]
  end

  subgraph infra["Infrastructure"]
    postgres[("PostgreSQL\n:5432")]
    redis[("Redis\n:6379")]
    kafka["Kafka\n:9092"]
  end

  subgraph obs["Observability"]
    otelCol["OTel Collector\n:4318"]
    tempo["Tempo\nservice graph\nprocessor"]
    prom["Prometheus\ntraces_service_graph\n_request_total"]
  end

  browser -- "page load" --> nextPages
  browser -- "API calls via Axios" --> proxyHandler
  locust -- "direct API load" --> routeHandlers

  nextPages --> proxyHandler
  proxyHandler -- "HTTP fetch()" --> routeHandlers
  routeHandlers --> appLayer
  appLayer --> pgQuery
  appLayer --> ioredis
  appLayer --> kafkaProducer

  pgQuery --> postgres
  ioredis --> redis
  kafkaProducer --> kafka

  frontend -- "OTLP spans" --> otelCol
  backend -- "OTLP spans" --> otelCol
  otelCol --> tempo
  tempo -- "remote_write\nservice graph edges" --> prom

  style frontend fill:#dbeafe,stroke:#3b82f6
  style backend fill:#dcfce7,stroke:#22c55e
  style infra fill:#fef9c3,stroke:#eab308
  style obs fill:#f3e8ff,stroke:#a855f7
```
