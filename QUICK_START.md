# Quick Start - Local Development

## First Time Only

```powershell
# 1. Clone repo
git clone https://github.com/SaranHiruthikM/FarmSmart.git
cd FarmSmart

# 2. Backend setup
Set-Location backend
npm install
Copy-Item .env.example .env

# 3. Optional: start MongoDB with Docker
# Skip if MongoDB is already running locally
docker compose up -d

# 4. Start backend
npm run dev
```

Open a second PowerShell terminal:

```powershell
# 5. Frontend setup + start
# From repository root:
Set-Location frontend
npm install
Copy-Item .env.example .env
npm run dev
```

---

## Every Time You Want to Develop

```powershell
# Terminal 1 (backend)
Set-Location backend
npm run dev

# Terminal 2 (frontend)
Set-Location frontend
npm run dev
```

---

## Options

```powershell
# Fresh dependency install
Remove-Item -Recurse -Force backend\node_modules, frontend\node_modules
Set-Location backend
npm install
Set-Location ..\frontend
npm install
```

```powershell
# Reseed quality rules (backend terminal)
Set-Location backend
npx ts-node src/utils/seedQualityRules.ts
```

```powershell
# Reseed market prices (backend terminal)
Set-Location backend
npx ts-node src/utils/seedMarketPrices.ts
```

```powershell
# Backend tests
Set-Location backend
npm test
```

---

## Troubleshooting

### MongoDB is not running

- If you use Docker:

```powershell
Set-Location backend
docker compose up -d
```

- If you use local MongoDB service, make sure it is reachable at the URI in `backend/.env` (`DATABASE_URL`).

### Port already in use (backend `3000`)

```powershell
# Find process using port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object LocalAddress,LocalPort,State,OwningProcess

# Stop process by PID (replace <PID>)
Stop-Process -Id <PID> -Force
```

### Missing env file

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

### Build fails

```powershell
# Backend build check
Set-Location backend
npm run build

# Frontend build check
Set-Location ..\frontend
npm run build
```

---

## What the Commands Do

1. Install dependencies separately in `backend/` and `frontend/`.
2. Configure required env files from `.env.example` templates.
3. Start the backend API on `http://localhost:3000`.
4. Start the Vite frontend dev server and connect it to the backend.
5. Optionally seed database data (`QualityRule`, `MarketPrice`) from backend utility scripts.

