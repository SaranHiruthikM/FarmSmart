# Architecture Documentation

Technical architecture overview for the FarmSmart platform.

## 📋 Table of Contents

- [System Overview](#-system-overview)
- [Technology Stack](#-technology-stack)
- [Architecture Diagram](#-architecture-diagram)
- [Component Architecture](#-component-architecture)
- [Data Flow](#-data-flow)
- [Storage Design](#-storage-design)
- [API Surface](#-api-surface)
- [Deployment Architecture](#-deployment-architecture)

## 🏗️ System Overview

FarmSmart is a web platform with a React frontend and an Express backend over MongoDB.

Core domains in the backend:

- Authentication (OTP + JWT)
- Crop marketplace
- Negotiation and order lifecycle
- Reviews and disputes
- Quality pricing
- Government schemes/advisory
- Market price insights with cache and provider fallback

---

## 🛠️ Technology Stack

### Frontend

- React 19 (`frontend/package.json`)
- Vite (`frontend/package.json`)
- React Router (`frontend/src/App.jsx`)
- Axios service layer (`frontend/src/services/api.js`)

### Backend

- Express 5 + TypeScript (`backend/package.json`)
- Mongoose models (`backend/src/models/*`)
- JWT auth middleware (`backend/src/middleware/authMiddleware.ts`)
- Optional Redis cache (`backend/src/cache/redisCache.ts`)

### Data Layer

- MongoDB primary database (`backend/src/config/db.ts`)
- Optional external mandi provider via `MANDI_API_BASE_URL`

---

## 📐 Architecture Diagram

### High-Level Architecture

```text
┌──────────────────────┐         ┌──────────────────────────┐         ┌──────────────────────┐
│      Frontend        │  HTTP   │         Backend          │  CRUD   │       MongoDB        │
│     React + Vite     │ ──────► │   Express + TypeScript   │ ──────► │   farmsmart database │
│   (Browser Client)   │ ◄────── │      REST Endpoints      │ ◄────── │   (Mongoose models)  │
└──────────────────────┘         └──────────────────────────┘         └──────────────────────┘
                                          │
                                          │ optional
                                          ▼
                               ┌──────────────────────────┐
                               │   Redis / In-memory      │
                               │        Price Cache       │
                               └──────────────────────────┘
                                          │
                                          │ optional
                                          ▼
                               ┌──────────────────────────┐
                               │  External Mandi API      │
                               │ (/current /history etc.) │
                               └──────────────────────────┘
```

---

## 🧩 Component Architecture

### Frontend Components

- Route shell: `frontend/src/App.jsx`
- Auth pages: `Login`, `Register`, `Otp`
- Dashboard modules: marketplace, pricing, negotiation, orders, reviews, disputes, schemes
- Service layer in `frontend/src/services/` handles all backend API calls

### Backend Components

- App bootstrap: `backend/src/index.ts`
- Express app and route mounting: `backend/src/app.ts`
- Domain routes: `backend/src/routes/*`
- Controllers: request handling and domain logic (`backend/src/controllers/*`)
- Models: MongoDB schemas (`backend/src/models/*`)
- Shared middleware: auth/role guards (`backend/src/middleware/authMiddleware.ts`)
- Utilities: response wrapper, seed scripts, HTTP fetch helper

### Price Subsystem

- API endpoints: `backend/src/routes/prices.routes.ts`
- Service abstraction: `backend/src/services/priceService.ts`
- Provider implementation: `backend/src/services/mandiPriceIngestion.ts`
- Fallback mocks: `backend/src/services/priceMocks.ts`
- Cache keys + adapters: `backend/src/cache/*`

---

## 🔄 Data Flow

### Authentication Flow (OTP + JWT)

1. Client calls `POST /auth/register` or `POST /auth/login`.
2. Backend validates user and generates OTP (`VerificationCode` collection).
3. Client calls `POST /auth/verify` with `{ contact, code }`.
4. Backend verifies OTP, marks user verified, and returns JWT token.
5. Client stores token and sends it in `Authorization: Bearer <token>`.

### Order Flow

1. Farmer creates crop listing (`POST /crops`).
2. Buyer either starts negotiation (`POST /negotiations/start`) or uses instant buy (`POST /orders/instant-buy`).
3. Negotiation can be countered/accepted/rejected (`POST /negotiations/:id/respond`).
4. Order is created (`POST /orders`) from accepted negotiation.
5. Farmer updates status (`PATCH /orders/:id/status`).
6. Buyer/Farmer can raise disputes (`POST /disputes`).

### Reviews Flow

1. User submits review (`POST /reviews`) with order-linked or direct target context.
2. Backend stores review and recalculates target user rating aggregate.
3. Reputation endpoints return received reviews (`GET /reviews/my`, `GET /reviews/user/:userId`).

### Price Insights Flow

1. Client requests `/prices/current`, `/prices/history`, or `/prices/compare`.
2. Backend service checks cache first.
3. If provider is configured and reachable, live data is returned.
4. If provider is unavailable, deterministic mock data is returned.
5. Response is cached with endpoint-specific TTL.

---

## 🗄️ Storage Design

### Primary Collections (Mongoose Models)

| Collection | Purpose |
|------------|---------|
| `User` | Auth identity, role, location, reputation summary |
| `VerificationCode` | OTP codes with expiry |
| `Crop` | Marketplace crop listings |
| `QualityRule` | Grade-to-price multiplier rules |
| `MarketPrice` | Market price history and comparison data |
| `Negotiation` | Buyer/farmer offer exchanges |
| `Order` | Order lifecycle, status timeline |
| `Review` | Ratings and comments |
| `Scheme` | Government scheme catalog |
| `Advisory` | Advisory feed entries |
| `Dispute` | Order dispute records |

### Additional Schema

- `backend/prisma/schema.prisma` exists and defines Mongo datasource models for auth entities.
- Runtime API logic currently uses Mongoose models from `backend/src/models`.

---

## 🔌 API Surface

Mounted base paths in `backend/src/app.ts`:

- `/auth`
- `/crops` and `/api/crops` (alias)
- `/negotiations`
- `/orders`
- `/reviews`
- `/quality`
- `/schemes`
- `/advisory`
- `/disputes`
- `/prices` and `/api/prices` (alias)

Full endpoint contract is documented in [API.md](./API.md).

---

## 🚀 Deployment Architecture

### Local Development

- Backend process: `npm run dev` in `backend/`
- Frontend process: `npm run dev` in `frontend/`
- MongoDB: local service or Docker (`backend/docker-compose.yml`)
- Optional Redis via `REDIS_URL`

### Production Notes

No production deployment manifest (for example Dockerfile, Kubernetes, or cloud IaC) was found in this repository.

TODO: add standardized production deployment documentation after the deployment target is finalized.

### Startup Behavior Note

Backend startup calls `seedSchemesAndAdvisory()` on boot, which clears and reseeds those collections.

---

## 📚 Related Docs

- [README.md](./README.md)
- [DEVELOPMENT.md](./DEVELOPMENT.md)
- [API.md](./API.md)

