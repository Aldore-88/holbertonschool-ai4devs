# Architecture Comparison – SnapCircle

## Comparison Matrix

| Aspect | Monolith | Microservices | Winner & Why |
|---|---|---|---|
| Maintainability | One codebase, easy to navigate | Small codebases with clear ownership | Monolith: simpler for one small team |
| Scalability | Scale whole app | Scale upload and image services independently | Microservices: handles event upload spikes efficiently |
| DevOps Complexity | One build, deploy and log stream | Many pipelines, tracing and monitoring | Monolith: far less to run and debug |
| Performance | In-process calls, low latency | Network hops between services | Monolith: faster for everyday requests |
| Cost | One app and one database | Many services, databases and tools | Monolith: cheaper to build and host at launch |
| Fault Tolerance | One failure can take down the app | Failures isolated to one service | Microservices: uploads keep working if Analytics fails |
| Deployment | Whole app redeployed for any change | Each service released on its own | Microservices: independent, lower-risk releases |
| Team Size Fit | 1–10 developers | Several independent teams | Monolith: matches the starting team |

## Detailed Comparison

### 1. Maintainability
- **Monolith:** All modules share one repository, so cross-module changes and refactoring are easy. Over time, module boundaries can blur and code becomes tangled.
- **Microservices:** Each service owns its code and data, which enforces boundaries and lets teams own services end to end. Features spanning services (e.g. a new plan limit across Billing, Group and Album) need coordinated API changes.

### 2. Scalability
- **Monolith:** Scales vertically (bigger servers) or horizontally (more copies of the whole app). Every copy carries all modules, even when only uploads are busy.
- **Microservices:** Photo Upload and Image Processing scale horizontally on their own, with a queue absorbing bursts at live events. Quiet services like Billing stay small.

### 3. DevOps Complexity
- **Deployment:** Monolith ships one artifact; microservices need a pipeline per service and usually containers with an orchestrator.
- **Monitoring:** Monolith has one set of logs and metrics; microservices need centralized logging and per-service dashboards.
- **Debugging:** Monolith errors give one stack trace; microservices need distributed tracing to follow an upload across several services.

### 4. Performance
- **Latency:** Monolith uses function calls; microservices add network calls (Upload → Album → Group → Billing).
- **Throughput:** Microservices reach higher peak upload throughput by scaling only busy services.
- **Resource usage:** Monolith is leaner overall; each microservice adds its own runtime overhead.

### 5. Cost
- **Infrastructure:** Monolith needs a few servers and one database. Microservices add a gateway, queue, per-service databases and monitoring.
- **Development:** Monolith features ship faster. Microservices need API contracts, retries and failure handling.
- **Maintenance:** Monolith costs rise as it grows and deploys get riskier. Microservices cost more from day one but grow more evenly.

### 6. Team Size and Deployment Complexity
- **1–10 developers:** Monolith. Running 8+ services would pull the team away from product work.
- **10–30 developers:** Modular monolith with strict module boundaries.
- **30+ developers / multiple teams:** Microservices, so teams release independently without merge and release conflicts.

### 7. Migration Path
**Monolith → Microservices:**
1. Build a modular monolith with each module owning its own tables.
2. Store photos in object storage with a CDN so app servers stay stateless.
3. Put an API gateway in front of the monolith.
4. Extract services one at a time (strangler fig pattern): Image Processing, then Notifications, Photo Upload and Billing.
5. Split the database per service as each is extracted, syncing data through events.
6. Add centralized logging and tracing before the second extraction.

**Microservices → Monolith:** Merge services that always change together (e.g. Group and Album) to reduce network calls and running costs.

## Recommendation
**Start with a modular monolith, and extract Image Processing first when upload volume demands it.**

- **Speed to launch:** A small team can ship and test the freemium model faster with one codebase.
- **Low cost:** The free tier must be cheap to run until paid plans bring in revenue.
- **Consistency:** Group size, album size and per-person photo limits tie into billing plans, and are simplest to enforce in one database.
- **Enough scale:** Stateless app copies behind a load balancer, with photos served from object storage and a CDN, cover the 50K concurrent user target.
- **Clear growth path:** Modules match the microservices design, so services can be extracted later without a rewrite.
