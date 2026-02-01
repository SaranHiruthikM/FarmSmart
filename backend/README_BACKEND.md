# FarmSmart Backend (Express + Prisma + JWT Cookies)

This backend implements the API spec you provided using a **monolithic MVC-ish layout**:

- **Routes** = URL mapping
- **Controllers** = request/response logic
- **DB (Prisma)** = models + queries
- **Middleware** = auth, role checks, language, error format

## Folder structure

```
backend/
  prisma/schema.prisma
  src/
    app.js
    server.js
    config/env.js
    db/prisma.js
    middleware/
      auth.js
      lang.js
      error.js
    controllers/
      auth.controller.js
      crops.controller.js
      prices.controller.js
      decision.controller.js
      auctions.controller.js
      disputes.controller.js
      ratings.controller.js
    routes/
      auth.routes.js
      crops.routes.js
      prices.routes.js
      decision.routes.js
      auctions.routes.js
      disputes.routes.js
      ratings.routes.js
```

## Setup (local)

1) Create a Postgres DB named `farmsmart`.

2) Copy env file:

```bash
cd backend
cp .env.example .env
```

3) Install + migrate:

```bash
npm i
npx prisma generate
npx prisma migrate dev --name init
```

4) Run the API:

```bash
npm run dev
```

Backend will run on `http://localhost:4000`.

## Auth notes

- JWT is stored in an **HTTP-only cookie** named `token` (configurable via `COOKIE_NAME`).
- The frontend must send requests with `credentials: 'include'` (fetch) or `withCredentials: true` (axios).

## Language support

- Frontend sets `Accept-Language` header (e.g. `ta-IN`, `hi-IN`, `en`).
- Backend translates a small set of user-facing messages via `req.t(key)`.

## OTP email

- If SMTP env vars are not set, OTP is printed to console:

```
[DEV OTP] Email to user@example.com: 123456
```

## Endpoints implemented

### Auth
- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Crops
- `POST /api/crops` (FARMER)
- `GET /api/crops?search=Tomato&location=Coimbatore`

### Prices
- `GET /api/prices/current?crop=Tomato` (stubbed)

### Decision
- `GET /api/decision/recommend?cropId=101` (rule-based)

### Auctions/Bids
- `POST /api/auctions/:cropId/bid` (BUYER)
- `PATCH /api/auctions/bids/:bidId` (FARMER)

### Trust
- `POST /api/disputes`
- `POST /api/ratings`

## Common failure modes

- **CORS**: `FRONTEND_ORIGIN` must match your frontend origin.
- **Cookies not being sent**: ensure `credentials: 'include'` in frontend requests.
- **DB connection**: check `DATABASE_URL` and that Postgres is running.
