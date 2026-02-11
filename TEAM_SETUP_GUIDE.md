# Team Member Setup Guide

## Quick Start (30 seconds)

```powershell
# 1. Clone the repository
git clone https://github.com/SaranHiruthikM/FarmSmart.git
cd FarmSmart

# 2. Backend setup
Set-Location backend
npm install
Copy-Item .env.example .env
docker compose up -d
npm run dev
```

Open a second terminal:

```powershell
# 3. Frontend setup
# From repository root:
Set-Location frontend
npm install
Copy-Item .env.example .env
npm run dev
```

That is enough for local onboarding.

---

## What the Setup Does

1. ✅ Installs dependencies in `backend/` and `frontend/`
2. ✅ Creates `.env` files from `.env.example`
3. ✅ Starts local MongoDB via Docker (optional path)
4. ✅ Runs backend and frontend dev servers

---

## Environment Values You Need

### Backend `.env`

Use placeholders from `backend/.env.example` and fill values provided by your team lead:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `MANDI_API_BASE_URL` (if live mandi provider is used)
- `MANDI_API_KEY` (if live mandi provider is used)
- `REDIS_URL` (if Redis cache is used)
- `PRICE_CACHE_ENABLED`

### Frontend `.env`

- `VITE_API_BASE_URL` (usually local backend URL for dev)

### Where to get values

- Team lead / repository maintainers
- Organization secrets manager (if your team uses one)
- Never from random chat screenshots or old commits

---

## Troubleshooting

### `Cannot connect to MongoDB`

```powershell
Set-Location backend
docker compose up -d
```

Then verify `DATABASE_URL` in `backend/.env`.

### Backend starts but frontend requests fail

- Check `frontend/.env` has valid `VITE_API_BASE_URL`
- Confirm backend is running on configured `PORT`

### Port `3000` already in use

```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object LocalAddress,LocalPort,State,OwningProcess
Stop-Process -Id <PID> -Force
```

### Dependency install issues

```powershell
Remove-Item -Recurse -Force backend\node_modules, frontend\node_modules
Set-Location backend
npm install
Set-Location ..\frontend
npm install
```

---

## Important: Never Commit `.env`

- Do not commit secrets or API keys.
- Keep `.env` local-only.
- Commit only `.env.example` with placeholders.

Note: `frontend/.env` is currently tracked in this repository and should be removed from tracking before public release (see [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)).

---

## For Team Leads: Secure Onboarding Practice

1. Share secrets through approved channels only.
2. Rotate any secret if it is ever pasted into chat or committed.
3. Review pull requests for accidental env/secret inclusion.

---

## Running the App

```powershell
# Backend
Set-Location backend
npm run dev

# Frontend
Set-Location frontend
npm run dev
```

---

## Questions?

Check these docs first:

- [QUICK_START.md](./QUICK_START.md)
- [DEVELOPMENT.md](./DEVELOPMENT.md)
- [backend/README.md](./backend/README.md)

