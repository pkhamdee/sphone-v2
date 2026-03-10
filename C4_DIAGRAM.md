# sPhone — C4 Architecture Diagrams

---

## Level 1 — System Context

```mermaid
C4Context
  title sPhone System Context

  Person(customer, "Customer", "Thai citizen applying for installment purchase")
  Person(ops, "Operator / DevOps", "Monitors system health via Grafana")

  System(sphone, "sPhone Platform", "Installment payment platform — phones, tablets, appliances, furniture, electric motorcycles")

  System_Ext(kafka_consumers, "Future Consumers", "Credit check, notification, payment processing services (not yet implemented)")

  Rel(customer, sphone, "Registers, browses products, applies for installment, views dashboard", "HTTPS")
  Rel(ops, sphone, "Views metrics, traces, logs", "HTTPS")
  Rel(sphone, kafka_consumers, "Publishes domain events", "Kafka / TCP")
```

---

## Level 2 — Container Diagram

```mermaid
C4Container
  title sPhone Container Diagram

  Person(customer, "Customer", "Thai citizen")
  Person(ops, "Operator", "DevOps")

  System_Boundary(sphone, "sPhone Platform") {
    Container(app, "sphone-app", "Next.js 16 / React 19", "SSR frontend: Home, Products, Apply, Login, Register, Dashboard")
    Container(api, "sphone-api", ".NET 10 Minimal API", "REST API — DDD + Hexagonal + Clean Architecture, CQRS via MediatR")
    ContainerDb(postgres, "PostgreSQL 16", "Relational DB", "Customers, Products, Orders, PaymentSchedules")
    ContainerDb(redis, "Redis 7", "In-memory cache", "Customer profiles, product lists, payment schedules")
    Container(kafka, "Apache Kafka", "Confluent 7.6 + Zookeeper", "Domain event bus — topics: sphone.customers, sphone.orders")
  }

  System_Boundary(obs, "Observability Stack") {
    Container(otel, "OTel Collector", "otelcol-contrib 0.120", "Receives OTLP traces, metrics, logs — routes to Tempo, Prometheus, Loki")
    ContainerDb(prometheus, "Prometheus v3", "Time-series DB", "Scrapes metrics from OTel Collector :8889")
    ContainerDb(tempo, "Grafana Tempo 2.7", "Trace store", "Stores distributed traces")
    ContainerDb(loki, "Grafana Loki 3.4", "Log store", "Stores structured logs")
    Container(grafana, "Grafana 11.4", "Dashboard UI", "sPhone Overview dashboard — metrics, traces, logs")
  }

  Rel(customer, app, "Uses browser", "HTTPS :3000")
  Rel(ops, grafana, "Views dashboards", "HTTPS :3333")
  Rel(app, api, "REST API calls + JWT auth", "HTTP :5154")
  Rel(api, postgres, "Read / write via EF Core", "TCP :5432")
  Rel(api, redis, "Cache-aside via StackExchange.Redis", "TCP :6379")
  Rel(api, kafka, "Publish domain events via Confluent.Kafka", "TCP :9092")
  Rel(api, otel, "OTLP traces + metrics + logs", "gRPC :4317")
  Rel(app, otel, "OTLP traces + metrics", "gRPC :4317")
  Rel(otel, prometheus, "Scrape endpoint :8889", "HTTP pull")
  Rel(otel, tempo, "OTLP traces", "gRPC")
  Rel(otel, loki, "Push logs", "HTTP")
  Rel(grafana, prometheus, "PromQL queries", "HTTP :9090")
  Rel(grafana, tempo, "TraceQL queries", "HTTP :3200")
  Rel(grafana, loki, "LogQL queries", "HTTP :3100")
```

---

## Level 3 — Component Diagram: sphone-api

```mermaid
C4Component
  title sphone-api Internal Components

  System_Ext(app, "sphone-app", "Next.js frontend")
  System_Ext(postgres, "PostgreSQL", "Database")
  System_Ext(redis, "Redis", "Cache")
  System_Ext(kafka, "Kafka", "Message bus")
  System_Ext(otel, "OTel Collector", "Telemetry")

  Container_Boundary(api, "sphone-api (.NET 10)") {
    Component(endpoints, "Endpoints", "Minimal API", "Auth / Customer / Product / Order / Payment routes")
    Component(middleware, "ExceptionMiddleware", "ASP.NET Middleware", "Domain 400, NotFound 404, Unhandled 500 ProblemDetails")
    Component(mediator, "MediatR Pipeline", "CQRS Dispatcher", "ValidationBehavior then Command or Query Handler")
    Component(cmd_auth, "Auth Commands", "MediatR Handlers", "RegisterCustomerHandler, LoginCustomerHandler")
    Component(cmd_order, "Order Commands", "MediatR Handlers", "CreateOrderHandler: PMT calc, PaymentSchedule, event publish")
    Component(qry_products, "Product Queries", "MediatR Handlers", "GetProductsHandler, GetProductByIdHandler — Redis cache")
    Component(qry_customer, "Customer Queries", "MediatR Handlers", "GetCustomerProfileHandler — Redis cache, GetMyOrdersHandler")
    Component(qry_payment, "Payment Queries", "MediatR Handlers", "GetPaymentScheduleHandler — Redis cache")
    Component(domain, "Domain", "Pure C#", "Aggregates: Customer, Product, Order, PaymentSchedule. Events + Port interfaces")
    Component(repos, "Repositories", "EF Core / Npgsql", "CustomerRepo, ProductRepo, OrderRepo, PaymentScheduleRepo + SPhoneDbContext")
    Component(cache_svc, "RedisCacheService", "StackExchange.Redis", "ICacheService: GetAsync, SetAsync, RemoveAsync with JSON serialisation")
    Component(eventbus, "KafkaEventBus", "Confluent.Kafka", "IEventBus: publishes to sphone.customers and sphone.orders topics")
    Component(jwt, "JwtTokenService", "Microsoft.IdentityModel", "Generates 24h JWT with CustomerId and NationalId claims")
    Component(obs_ext, "ObservabilityExtensions", "OpenTelemetry SDK", "Traces, metrics, OTLP export, Prometheus scrape, SPhoneMetrics counters")
  }

  Rel(app, endpoints, "HTTP REST + JWT Bearer")
  Rel(endpoints, middleware, "Request pipeline")
  Rel(endpoints, mediator, "ISender.Send(command or query)")
  Rel(mediator, cmd_auth, "Dispatch")
  Rel(mediator, cmd_order, "Dispatch")
  Rel(mediator, qry_products, "Dispatch")
  Rel(mediator, qry_customer, "Dispatch")
  Rel(mediator, qry_payment, "Dispatch")
  Rel(cmd_auth, domain, "Creates Customer aggregate")
  Rel(cmd_order, domain, "Creates Order + PaymentSchedule aggregates")
  Rel(cmd_auth, repos, "Save via ICustomerRepository")
  Rel(cmd_order, repos, "Save via IOrderRepository + IPaymentScheduleRepository")
  Rel(qry_products, cache_svc, "Cache-aside read/write")
  Rel(qry_customer, cache_svc, "Cache-aside read/write")
  Rel(qry_payment, cache_svc, "Cache-aside read/write")
  Rel(qry_products, repos, "DB fallback on cache miss")
  Rel(qry_customer, repos, "DB fallback on cache miss")
  Rel(qry_payment, repos, "DB fallback on cache miss")
  Rel(cmd_auth, jwt, "GenerateToken(customer)")
  Rel(cmd_order, eventbus, "PublishAsync(OrderCreatedEvent)")
  Rel(cmd_auth, eventbus, "PublishAsync(CustomerRegisteredEvent)")
  Rel(repos, postgres, "SQL via Npgsql + EF Core")
  Rel(cache_svc, redis, "GET / SET / DEL")
  Rel(eventbus, kafka, "Produce JSON message")
  Rel(obs_ext, otel, "OTLP gRPC :4317")
```

---

## Level 3 — Component Diagram: sphone-app

```mermaid
C4Component
  title sphone-app Internal Components

  Person(customer, "Customer")
  System_Ext(api, "sphone-api", ".NET REST API :5154")
  System_Ext(otel, "OTel Collector", ":4317")

  Container_Boundary(app, "sphone-app (Next.js 16)") {
    Component(layout, "layout.tsx", "Next.js Root Layout", "QueryClientProvider, Navbar, global metadata")
    Component(pages, "Pages", "React App Router", "Home, Login, Register, Products, Apply, Dashboard")
    Component(components, "UI Components", "React Client Components", "Navbar, ProductCard, InstallmentCalculator, PaymentScheduleTable")
    Component(api_lib, "lib/api.ts", "Axios Instance", "Base URL :5154/api, Bearer token interceptor, 401 auto-logout")
    Component(auth_lib, "lib/auth.ts", "Zustand Store", "token + customer state, login/logout, localStorage persistence")
    Component(types_lib, "lib/types.ts", "TypeScript Interfaces", "Customer, Product, Order, PaymentSchedule, PaymentItem")
    Component(instrumentation, "instrumentation.ts", "OTel Node SDK", "Auto-instruments HTTP on server startup, OTLP trace + metric export")
  }

  Rel(customer, pages, "Browser navigation", "HTTPS")
  Rel(layout, pages, "Wraps all pages")
  Rel(pages, components, "Renders")
  Rel(pages, api_lib, "useQuery / useMutation via TanStack Query")
  Rel(pages, auth_lib, "useAuthStore()")
  Rel(api_lib, auth_lib, "Reads token for Bearer header")
  Rel(api_lib, types_lib, "Typed responses")
  Rel(api_lib, api, "HTTP REST calls", "JSON over HTTP")
  Rel(instrumentation, otel, "OTLP traces + metrics", "gRPC :4317")
```

---

## Data Flow: Create Order (Happy Path)

```mermaid
sequenceDiagram
  actor Customer
  participant App as sphone-app
  participant API as sphone-api
  participant Val as FluentValidation
  participant Domain as Order Aggregate
  participant DB as PostgreSQL
  participant Cache as Redis
  participant Kafka as Kafka
  participant OTel as OTel Collector

  Customer->>App: Submit installment form
  App->>API: POST /api/orders {customerId, productId, downPayment, months}
  API->>Val: Validate CreateOrderCommand
  Val-->>API: Valid
  API->>Domain: Order.Create(customerId, productId, installmentPlan)
  Note over Domain: Calculates PMT formula<br/>Creates PaymentSchedule<br/>Raises OrderCreatedEvent
  API->>DB: SaveChanges (Order + PaymentSchedule)
  API->>Cache: RemoveAsync schedule:{orderId}
  API->>Kafka: Produce OrderCreatedEvent to sphone.orders
  API->>OTel: Emit trace span + increment sphone.orders.created counter
  API-->>App: 201 Created {orderId}
  App-->>Customer: Redirect to /dashboard
```
