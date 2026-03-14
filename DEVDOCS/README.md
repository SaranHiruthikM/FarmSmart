# FarmSmart - Smart Agriculture Marketplace

> A full-stack farm-to-buyer platform with OTP auth, crop listings, negotiation, instant buy, disputes, and market price insights.

[![Node.js](https://img.shields.io/badge/node-Required-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.2.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9.3-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-green)](https://www.mongodb.com/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Technology Stack](#-technology-stack)
- [Development](#-development)
- [Contributing](#-contributing)
- [Security](#-security)

---

## 🌟 Overview

FarmSmart is built as a two-part web application:

- **Frontend (`frontend/`)**: React + Vite client for farmer and buyer workflows
- **Backend (`backend/`)**: Express + TypeScript API using MongoDB (Mongoose)

The backend starts on **port `3000` by default** (`backend/src/index.ts`) and the frontend calls it through `VITE_API_BASE_URL` (or defaults to `http://localhost:3000`).

---

## 🚀 Quick Start

### For New Contributors

```powershell
# 1. Clone the repository
git clone https://github.com/SaranHiruthikM/FarmSmart.git
cd FarmSmart

# 2. Install backend dependencies
Set-Location backend
npm install

# 3. Create backend env file
Copy-Item .env.example .env

# 4. Optional: start MongoDB container
# (If you already run MongoDB locally, skip this)
docker compose up -d

# 5. Start backend API (http://localhost:3000)
npm run dev
```

Open a second PowerShell terminal:

```powershell
# 6. Start frontend
# From repository root:
Set-Location frontend
npm install
Copy-Item .env.example .env
npm run dev
```

For a full walkthrough, use [QUICK_START.md](./QUICK_START.md).

### For Existing Team Members

```powershell
# Backend terminal
Set-Location backend
npm run dev

# Frontend terminal
Set-Location ..\frontend
npm run dev
```

---

## ✨ Features

Verified from route/controller/service code:

- **OTP-based authentication**: register, login, OTP verify, resend
- **Role-aware access**: FARMER, BUYER, COOPERATIVE, LOGISTICS, ADMIN checks in middleware
- **Crop marketplace**: create/list/update/delete crops, own listings endpoint
- **Negotiation workflow**: buyer starts negotiation, both sides counter/respond
- **Order workflow**: create from accepted negotiation or use instant buy
- **Order lifecycle**: `CREATED` to `CONFIRMED` to `SHIPPED` to `DELIVERED` to `COMPLETED`
- **Reviews and reputation**: rating + comment with aggregated seller/buyer rating
- **Disputes**: raise, view, resolve, and admin update endpoints
- **Quality pricing**: grade-based price impact using `QualityRule`
- **Schemes and advisories**: scheme listing + eligibility + advisory feed
- **Market price insights**: current/history/compare APIs with cache + provider fallback
- **AI crop vision grading**: image-based quality detection with pricing impact
- **AI crop doctor**: symptom diagnosis and structured treatment guidance
- **Demand forecasting**: sell-now vs wait guidance with AI and ML signals
- **Season planning**: crop recommendations with profit projection
- **Cooperative pooling**: pooled batches for institutional buyers
- **Logistics hub**: provider acceptance and delivery detail tracking
- **Price forecasting**: ML-backed forecasts and AI market analysis
- **Frontend i18n scaffold**: English + Tamil resource initialization

---

## 📁 Project Structure

```text
FarmSmart/
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── index.ts
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── cache/
│   │   └── utils/
│   ├── __tests__/
│   ├── prisma/
│   ├── docker-compose.yml
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── i18n/
│   │   └── mock/
│   ├── public/
│   └── package.json
└── CODEOWNERS
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](./QUICK_START.md) | Fast local run instructions |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Full setup and environment guide |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design and data flow |
| [API.md](./API.md) | Route-level API contract |
| [FEATURES.md](./FEATURES.md) | New feature deep dive and developer notes |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution workflow and standards |
| [BRANCH_PLAN.md](./BRANCH_PLAN.md) | Branching strategy and implementation plan |
| [TEAM_SETUP_GUIDE.md](./TEAM_SETUP_GUIDE.md) | New teammate onboarding |
| [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) | Pre-public security checks |
| [backend/README.md](./backend/README.md) | Backend-only setup and operations |

---

## 🛠️ Technology Stack

### Frontend

- React 19 (`frontend/package.json`)
- Vite 7 (`frontend/package.json`)
- React Router (`frontend/package.json`)
- Tailwind CSS (`frontend/package.json`)
- Axios (`frontend/src/services/api.js`)

### Backend

- Node.js + Express 5 (`backend/package.json`)
- TypeScript (`backend/package.json`, `backend/tsconfig.json`)
- Mongoose + MongoDB (`backend/src/config/db.ts`)
- JWT + bcrypt auth (`backend/src/controllers/authController.ts`)
- Redis-compatible cache support for price endpoints (`backend/src/cache/redisCache.ts`)

---

## 💻 Development

- Setup and environment details: [DEVELOPMENT.md](./DEVELOPMENT.md)
- Fast day-to-day workflow: [QUICK_START.md](./QUICK_START.md)
- Backend-focused instructions: [backend/README.md](./backend/README.md)

---

## 🤝 Contributing

Follow [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, commit format, PR process, and quality checks.

---

## 🔒 Security

Before publishing or sharing wider access, run through [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md).
