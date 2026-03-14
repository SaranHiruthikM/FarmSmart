# API Documentation

Complete API reference for the FarmSmart backend services.

## 📋 Table of Contents

- [Overview](#-overview)
- [Base URLs](#-base-urls)
- [Authentication](#-authentication)
- [Rate Limiting](#-rate-limiting)
- [Error Handling](#-error-handling)
- [API Endpoints](#-api-endpoints)
- [Response Formats](#-response-formats)

## 🌐 Overview

FarmSmart APIs are REST-style JSON endpoints implemented in Express.

### Base URLs

**Development:**

```text
Backend API: http://localhost:3000
```

### API Prefixes and Aliases

- Primary crop endpoints: `/crops`
- Alias crop endpoints: `/api/crops`
- Primary price endpoints: `/prices`
- Alias price endpoints: `/api/prices`

### API Versioning

No explicit version prefix (for example `/v1`) is currently configured.

---

## 🔐 Authentication

### Auth Method

- JWT Bearer token
- Middleware: `authenticate` in `backend/src/middleware/authMiddleware.ts`
- Header format:

```http
Authorization: Bearer <token>
```

### OTP Login Flow

1. `POST /auth/register` or `POST /auth/login`
2. Receive `requiresOtp` and `debugOtp` in response data
3. `POST /auth/verify` with `{ contact, code }`
4. Receive signed JWT token

### Token Payload

Token includes:

- `userId`
- `role`
- Expiry `7d`

---

## ⏱️ Rate Limiting

No explicit API rate-limiter middleware was found in `backend/src/app.ts`.

TODO: add route/global rate limiting before public deployment.

---

## ❌ Error Handling

Two response styles are currently used:

1. **Standard wrapper** (`sendResponse`) on auth and root health route:

```json
{
  "success": false,
  "message": "...",
  "data": null
}
```

2. **Raw controller JSON** on most domain routes:

```json
{
  "message": "..."
}
```

Common status codes seen in controllers: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`.

---

## 📡 API Endpoints

### Authentication Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | No | Register user and generate OTP |
| `POST` | `/auth/login` | No | Validate credentials and generate OTP |
| `POST` | `/auth/verify` | No | Verify OTP and issue JWT |
| `POST` | `/auth/resend` | No | Resend OTP to contact |
| `GET` | `/auth/me` | Yes | Get current user profile |
| `PATCH` | `/auth/profile` | Yes | Update user profile fields |
| `POST` | `/auth/kyc` | Yes | Upload KYC document (multipart form-data) |

#### Example: Verify OTP

```http
POST /auth/verify
Content-Type: application/json

{
  "contact": "9876543210",
  "code": "123456"
}
```

Example success contract:

```json
{
  "success": true,
  "message": "Verification successful",
  "data": {
    "user": {
      "_id": "...",
      "phoneNumber": "9876543210",
      "role": "FARMER"
    },
    "token": "<jwt-token>"
  }
}
```

### Admin Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/admin/login` | No | Admin/cooperative bypass login |
| `GET` | `/admin/dashboard` | Yes (`ADMIN`/`COOPERATIVE`) | Platform dashboard stats |
| `GET` | `/admin/kyc/pending` | Yes (`ADMIN`/`COOPERATIVE`) | List pending KYC verifications |
| `PUT` | `/admin/kyc/:userId` | Yes (`ADMIN`/`COOPERATIVE`) | Approve or reject KYC |

### Crop Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/crops` | Yes (`FARMER`) | Create crop listing |
| `PUT` | `/crops/:id` | Yes (`FARMER`) | Update crop |
| `DELETE` | `/crops/:id` | Yes (`FARMER`) | Delete crop |
| `PATCH` | `/crops/:id/quantity` | Yes (`FARMER`) | Update quantity only |
| `GET` | `/crops/my` | Yes (`FARMER`) | Get current farmer crops |
| `GET` | `/crops` | No | List active crops |
| `GET` | `/crops/:id` | No | Get crop details |

Query filters for `GET /crops`: `name`, `state`, `district`.

### Negotiation Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/negotiations/start` | Yes | Buyer starts negotiation |
| `POST` | `/negotiations/:id/respond` | Yes | Accept/reject/counter negotiation |
| `GET` | `/negotiations/my` | Yes | Get logged-in user negotiations |
| `GET` | `/negotiations/:id` | Yes | Get negotiation details |

Request fields used by start endpoint: `cropId`, `farmerId`, `pricePerUnit`, `quantity`, `message`.

### Order Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/orders/instant-buy` | Yes | Direct purchase flow |
| `POST` | `/orders` | Yes | Create order from accepted negotiation |
| `GET` | `/orders/my` | Yes | Get orders for logged-in role |
| `GET` | `/orders/available` | Yes (`LOGISTICS`) | List unassigned orders for pickup |
| `GET` | `/orders/:id` | Yes | Get order details |
| `PUT` | `/orders/:id/accept` | Yes (`LOGISTICS`) | Accept an order for delivery |
| `PATCH` | `/orders/:id/logistics` | Yes (`LOGISTICS`) | Update driver and delivery details |
| `PATCH` | `/orders/:id/status` | Yes (`LOGISTICS`/`ADMIN`) | Update order lifecycle status |

Valid status values in controller/model:

- `CREATED`
- `CONFIRMED`
- `SHIPPED`
- `DELIVERED`
- `COMPLETED`

### Review Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/reviews` | Yes | Create review (order-linked or direct target) |
| `GET` | `/reviews/my` | Yes | Get reviews received by current user |
| `GET` | `/reviews/user/:userId` | Yes | Get reviews received by user |

### Quality Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/quality/analyze` | Yes | Analyze image quality with AI vision |
| `POST` | `/quality/evaluate` | Yes | Evaluate final price for grade + base price |
| `GET` | `/quality/price-impact` | No | Preview final price impact |
| `GET` | `/quality` | Yes (`ADMIN`/`COOPERATIVE`) | List all quality rules |
| `PUT` | `/quality/:id` | Yes (`ADMIN`/`COOPERATIVE`) | Update a quality rule |

### Scheme and Advisory Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/schemes` | No | List all schemes |
| `GET` | `/schemes/eligible` | Yes | List eligible schemes for logged user state |
| `GET` | `/advisory` | No | Get advisory feed |
| `GET` | `/advisory/admin/all` | Yes (`ADMIN`/`COOPERATIVE`) | Get all advisories |
| `POST` | `/advisory` | Yes (`ADMIN`/`COOPERATIVE`) | Create advisory |
| `POST` | `/advisory/diagnose` | Yes | AI crop doctor diagnosis |
| `GET` | `/advisory/rotation-suggestion` | Yes | AI rotation suggestion |
| `POST` | `/schemes` | Yes (`ADMIN`/`COOPERATIVE`) | Create scheme |
| `PUT` | `/schemes/:id` | Yes (`ADMIN`/`COOPERATIVE`) | Update scheme |
| `DELETE` | `/schemes/:id` | Yes (`ADMIN`/`COOPERATIVE`) | Delete scheme |

### Demand Forecasting Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/demand/forecast` | Yes | Demand forecast and sell-now guidance |
| `GET` | `/demand/recommendations` | Yes | Crop recommendations by location |

### Crop Planning Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/planning/plan` | Yes | Season plan with ML profit projection |

### Cooperative Pooling Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/pooling/active` | Yes | List active pools |
| `POST` | `/pooling/join` | Yes | Join a pool and contribute quantity |
| `POST` | `/pooling/create` | Yes | Create a new pool (intended for admin/cooperative) |
| `GET` | `/pooling/institutional-batches` | Yes | List institutional batches |

### Dispute Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/disputes` | Yes | Raise dispute for order |
| `GET` | `/disputes/my` | Yes | Get user disputes |
| `GET` | `/disputes/:id` | Yes | Get dispute details |
| `PATCH` | `/disputes/:id/resolve` | Yes | Farmer resolves dispute |
| `GET` | `/disputes/admin/all` | Yes (`ADMIN`/`COOPERATIVE`) | List all disputes |
| `PATCH` | `/disputes/admin/:id` | Yes (`ADMIN`/`COOPERATIVE`) | Update dispute status + admin remark |

### Price Insight Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/prices/current?crop=` | No | Current price snapshot |
| `GET` | `/prices/history?crop=&location=&days=` | No | Price history |
| `GET` | `/prices/compare?crop=&location=` | No | Multi-mandi comparison |
| `GET` | `/prices/states` | No | List available states |
| `GET` | `/prices/districts?state=` | No | List districts for a state |
| `GET` | `/prices/crops?location=` | No | List crops for a district |
| `GET` | `/prices/csv-trends?crop=&range=` | No | CSV-based or simulated trends |
| `POST` | `/prices/ai-analysis` | No | AI market analysis from trend points |
| `POST` | `/prices/forecast` | No | ML forecast with optional chat query |

These are also mounted under `/api/prices/*`.

#### Example: Compare Prices

```http
GET /prices/compare?crop=Tomato&location=Coimbatore
```

Response contract (from provider interface):

```json
{
  "crop": "Tomato",
  "location": "Coimbatore",
  "unit": "INR/kg",
  "averageNearbyPrice": 30,
  "bestPriceHighlight": {
    "mandi": "District Hub",
    "price": 32
  },
  "comparedMandis": [
    { "mandi": "Local Mandi", "price": 29 }
  ]
}
```

---

## 📦 Response Formats

### Auth Wrapper Format

Used by `authController` and root health route via `sendResponse`:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

### Domain Object Format

Most non-auth controllers return model objects directly.

Example (`GET /orders/:id`) returns an `Order` document shape with populated relations when available.

TODO: unify all endpoints to one standardized response wrapper.

---

## 🔧 Testing the API

### Using cURL

```powershell
# Root health
curl http://localhost:3000/

# Public crop listing
curl http://localhost:3000/crops
```

### Using Frontend Service Layer

Frontend calls are centralized in `frontend/src/services/*.js`.

---

## 📚 Related Docs

- [README.md](./README.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [backend/README.md](./backend/README.md)

