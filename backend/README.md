# FarmSmart Backend

> Express + TypeScript API for authentication, crop marketplace, negotiation, orders, disputes, reviews, schemes, and price insights.

## 📖 Table of Contents

- [Quick Start](#-quick-start)
- [Scripts](#-scripts)
- [Environment Variables](#-environment-variables)
- [Run, Build, Test](#-run-build-test)
- [Seeding Data](#-seeding-data)
- [API Mounts](#-api-mounts)
- [Project Structure](#-project-structure)
- [MongoDB and TypeScript Notes](#-mongodb-and-typescript-notes)

---

## 🚀 Quick Start

```powershell
# From repository root
Set-Location backend
npm install
Copy-Item .env.example .env

# Optional: start local MongoDB container
docker compose up -d

# Start backend on PORT (default 3000)
npm run dev
```

Health check:

```powershell
curl http://localhost:3000/
```

---

## 📜 Scripts

Scripts from `backend/package.json`:

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `nodemon src/index.ts` | Development server |
| `npm run build` | `tsc` | Compile TypeScript to `dist/` |
| `npm start` | `node dist/index.js` | Run compiled server |
| `npm test` | `jest` | Run test suite |
| `npm run test:watch` | `jest --watch` | Watch mode tests |
| `npm run test:coverage` | `jest --coverage` | Coverage report |

---

## 🔧 Environment Variables

Values documented from `backend/.env.example` and source usage.

| Variable | Required | Used In | Description |
|----------|----------|---------|-------------|
| `PORT` | Yes | `src/index.ts` | Server listen port (fallback `3000`) |
| `DATABASE_URL` | Yes | `src/config/db.ts` | MongoDB URI |
| `MONGODB_URI` | Optional | test setup fallback | Alternate Mongo URI for tests |
| `JWT_SECRET` | Yes | auth controller + middleware | JWT signing/verification secret |
| `MANDI_API_BASE_URL` | Optional | price provider | External mandi API base URL |
| `MANDI_API_KEY` | Optional | price provider headers | API key for external provider |
| `REDIS_URL` | Optional | cache setup | Enables Redis cache adapter |
| `PRICE_CACHE_ENABLED` | Optional | cache flag | Disable with `false`/`0`/`off` |

Test-specific values are in `backend/.env.test`.

---

## 🏃 Run, Build, Test

### Development Run

```powershell
Set-Location backend
npm run dev
```

### Production-style Run

```powershell
Set-Location backend
npm run build
npm start
```

### Tests

```powershell
Set-Location backend
npm test
npm run test:watch
npm run test:coverage
```

---

## 🌱 Seeding Data

### Auto Seed on Startup

`src/index.ts` calls `seedSchemesAndAdvisory()` after DB connection.

This reseeds:

- `Scheme`
- `Advisory`

### Manual Seed Scripts

```powershell
Set-Location backend

# Quality multipliers
npx ts-node src/utils/seedQualityRules.ts

# Market prices
npx ts-node src/utils/seedMarketPrices.ts
```

---

## 🔌 API Mounts

Configured in `src/app.ts`:

- `/auth`
- `/crops` and `/api/crops`
- `/negotiations`
- `/orders`
- `/reviews`
- `/quality`
- `/schemes`
- `/advisory`
- `/disputes`
- `/prices` and `/api/prices`

---

## 📁 Project Structure

```text
backend/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── config/
│   │   └── db.ts
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── cache/
│   └── utils/
├── __tests__/
├── prisma/
├── docker-compose.yml
├── jest.config.js
├── tsconfig.json
└── package.json
```

---

## 🗄️ MongoDB and TypeScript Notes

- MongoDB is connected through Mongoose in `src/config/db.ts`.
- Default local DB fallback is `mongodb://localhost:27017/farmsmart`.
- TypeScript output directory is `dist/` (`tsconfig.json`).
- `npm start` requires a successful `npm run build` first.

---

## 📚 Related Docs

- [../README.md](../README.md)
- [../DEVELOPMENT.md](../DEVELOPMENT.md)
- [../API.md](../API.md)
- [../ARCHITECTURE.md](../ARCHITECTURE.md)

