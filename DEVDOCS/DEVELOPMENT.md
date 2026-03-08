# Development Setup Guide

Complete guide for setting up your local development environment for FarmSmart.

## 📋 Table of Contents

- [System Requirements](#-system-requirements)
- [Installation Steps](#-installation-steps)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Database Setup](#-database-setup)
- [Seeding Data](#-seeding-data)
- [Troubleshooting](#-troubleshooting)
- [Development Tools](#-development-tools)

## 💻 System Requirements

### Required Software

| Software | Purpose | Where Used |
|----------|---------|------------|
| Node.js + npm | Package install and scripts | `frontend/`, `backend/` |
| MongoDB | Primary datastore | `backend/src/config/db.ts` |
| Git | Version control | Repository workflow |

### Optional Software

| Software | Purpose | Where Used |
|----------|---------|------------|
| Docker | Run MongoDB container quickly | `backend/docker-compose.yml` |
| Redis | Cache for market price endpoints | `backend/src/cache/redisCache.ts` |

### Operating Systems

- ✅ Windows (PowerShell commands documented in this guide)
- ✅ Other OS should work with equivalent shell commands

---

## 🚀 Installation Steps

### Method 1: Automated Setup

No automated setup script was found in this repository root (no `setup*.ps1` or root install script). Use manual setup below.

### Method 2: Manual Setup

#### Step 1: Install Dependencies

```powershell
# From repository root
Set-Location backend
npm install

Set-Location ..\frontend
npm install

Set-Location ..
```

#### Step 2: Configure Environment Files

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

#### Step 3: Start MongoDB

```powershell
# Option A: Docker
Set-Location backend
docker compose up -d
Set-Location ..
```

If you do not use Docker, run your local MongoDB service and ensure `DATABASE_URL` points to it.

---

## 🔧 Environment Configuration

### Backend (`backend/.env`)

| Variable | Required | Used By | Notes |
|----------|----------|---------|-------|
| `PORT` | Yes | `backend/src/index.ts` | API listen port (default fallback `3000`) |
| `DATABASE_URL` | Yes | `backend/src/config/db.ts` | MongoDB connection URI |
| `MONGODB_URI` | Optional | tests (`backend/__tests__/setup/testSetup.ts`) | Test helper fallback variable |
| `JWT_SECRET` | Yes | auth controller + auth middleware | JWT sign/verify secret |
| `MANDI_API_BASE_URL` | Optional | price provider (`backend/src/services/mandiPriceIngestion.ts`) | Enables live price provider |
| `MANDI_API_KEY` | Optional | price provider headers | API key for mandi provider |
| `REDIS_URL` | Optional | cache initialization | Enables Redis-backed cache |
| `PRICE_CACHE_ENABLED` | Optional | `backend/src/cache/cache.ts` | `true` by default if not provided |

### Frontend (`frontend/.env`)

| Variable | Required | Used By | Notes |
|----------|----------|---------|-------|
| `VITE_API_BASE_URL` | Recommended | `frontend/src/services/api.js` | Backend base URL; fallback is `http://localhost:3000` |

### Test Environment (`backend/.env.test`)

| Variable | Used By | Notes |
|----------|---------|-------|
| `NODE_ENV`, `PORT`, `MONGODB_URI`, `MONGODB_TEST_URI`, `JWT_SECRET` | Jest/test setup | Used for local backend tests |

---

## 🏃 Running the Application

### Quick Start (All Services)

Use two terminals:

```powershell
# Terminal 1: backend
Set-Location backend
npm run dev
```

```powershell
# Terminal 2: frontend
Set-Location frontend
npm run dev
```

### Individual Services

#### Backend Only

```powershell
Set-Location backend
npm run dev
```

#### Frontend Only

```powershell
Set-Location frontend
npm run dev
```

#### Production-style Backend Run

```powershell
Set-Location backend
npm run build
npm start
```

#### Frontend Build Preview

```powershell
Set-Location frontend
npm run build
npm run preview
```

---

## 🗄️ Database Setup

### Default Local URI

`backend/.env.example` uses:

```text
DATABASE_URL=mongodb://localhost:27017/farmsmart
```

### Docker Compose Service

`backend/docker-compose.yml` exposes MongoDB on port `27017`:

```powershell
Set-Location backend
docker compose up -d
```

---

## 🌱 Seeding Data

### Auto Seed on Backend Startup

On API startup, `seedSchemesAndAdvisory()` is called (`backend/src/index.ts`), which clears and reseeds:

- `Scheme`
- `Advisory`

### Manual Seed Scripts

```powershell
Set-Location backend

# Seed quality multipliers (QualityRule)
npx ts-node src/utils/seedQualityRules.ts

# Seed market price dataset (MarketPrice)
npx ts-node src/utils/seedMarketPrices.ts
```

---

## 🔍 Troubleshooting

### MongoDB connection failed

- Check `DATABASE_URL` in `backend/.env`
- Verify MongoDB is running (`docker compose up -d` or local service)

### Backend port conflict (`3000`)

```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object LocalAddress,LocalPort,State,OwningProcess
Stop-Process -Id <PID> -Force
```

### Missing JWT secret

Set `JWT_SECRET` in `backend/.env`. Without it, code falls back to a default string, which is unsafe for shared/public environments.

### Frontend calling wrong API

Set `VITE_API_BASE_URL` in `frontend/.env` if your backend is not at `http://localhost:3000`.

### TypeScript build errors (backend)

```powershell
Set-Location backend
npm run build
```

Fix compilation errors shown by `tsc` before `npm start`.

---

## 🧰 Development Tools

### Backend Scripts

```powershell
Set-Location backend
npm run dev
npm run build
npm start
npm test
npm run test:watch
npm run test:coverage
```

### Frontend Scripts

```powershell
Set-Location frontend
npm run dev
npm run build
npm run preview
npm run lint
```

### Related Docs

- [README.md](./README.md)
- [QUICK_START.md](./QUICK_START.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [backend/README.md](./backend/README.md)

