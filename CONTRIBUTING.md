# Contributing to FarmSmart

Welcome. This guide explains how to contribute safely and consistently to FarmSmart.

## 📋 Table of Contents

- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Branch Strategy](#-branch-strategy)
- [Code Standards](#-code-standards)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Testing Requirements](#-testing-requirements)

## 🚀 Getting Started

### Prerequisites

- Node.js + npm
- MongoDB (local service or Docker)
- Git

### First-Time Setup

1. **Clone the repository**

```powershell
git clone https://github.com/SaranHiruthikM/FarmSmart.git
cd FarmSmart
```

2. **Install backend dependencies**

```powershell
Set-Location backend
npm install
Copy-Item .env.example .env
```

3. **Install frontend dependencies**

```powershell
Set-Location ..\frontend
npm install
Copy-Item .env.example .env
```

4. **Start development servers**

```powershell
# backend terminal
Set-Location backend
npm run dev

# frontend terminal
Set-Location frontend
npm run dev
```

### Project Ownership

`CODEOWNERS` currently lists:

- `@SaranHiruthikM`
- `@Vimal-Sabari`

---

## 💻 Development Workflow

### Run Services Individually

```powershell
# Backend
Set-Location backend
npm run dev
```

```powershell
# Frontend
Set-Location frontend
npm run dev
```

### Database Setup

```powershell
Set-Location backend
docker compose up -d
```

### Seed Data (Optional)

```powershell
Set-Location backend
npx ts-node src/utils/seedQualityRules.ts
npx ts-node src/utils/seedMarketPrices.ts
```

---

## 🌿 Branch Strategy

### Current Repository Patterns (observed from git history)

- `feat/<topic>`
- `fix/<topic>`
- `small/<topic>`
- occasional direct branch names (for example `schemeIntegration`)

### Recommended Branch Naming

Use consistent prefixes for all new work:

- `feat/<area>-<summary>`
- `fix/<area>-<summary>`
- `chore/<area>-<summary>`
- `docs/<area>-<summary>`
- `test/<area>-<summary>`

### Examples Aligned with Existing Work

- `feat/sales-revenue-dashboard`
- `fix/dispute-admin-status-update`
- `fix/backend-integration`
- `docs/api-contract-sync`

---

## 📝 Code Standards

### Backend (TypeScript + Express)

- Keep controllers focused on request/response logic.
- Keep domain persistence in model/service utilities.
- Use explicit status codes and consistent error messages.
- Preserve role checks using middleware (`authenticate`, `farmerOnly`, `adminOnly`).

### Frontend (React)

- Route wiring in `frontend/src/App.jsx`.
- API calls through `frontend/src/services/` only.
- Keep view components focused on UI concerns.

### Formatting and Linting

```powershell
Set-Location frontend
npm run lint
```

Backend has no dedicated lint script in `backend/package.json` currently.

---

## 📌 Commit Guidelines

### Commit Format

Use Conventional Commits:

```text
type(scope): short summary
```

### Common Types

- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`

### Examples

- `feat(orders): add instant buy flow for buyers`
- `fix(disputes): enforce admin role on status updates`
- `docs(api): align auth OTP flow with backend routes`

---

## 🔄 Pull Request Process

### Before Creating a PR

1. Sync with `main`.
2. Re-run relevant checks:

```powershell
# backend checks
Set-Location backend
npm run build
npm test

# frontend checks
Set-Location ..\frontend
npm run lint
npm run build
```

3. Verify env or secret files are not included.

### PR Title Format

```text
<type>(<scope>): <summary>
```

### PR Description Template

```markdown
## Description

## Type of Change

## Related Issues

## Testing

## Screenshots (if applicable)

## Checklist
- [ ] Backend build passes
- [ ] Backend tests updated/passing where applicable
- [ ] Frontend lint/build passes
- [ ] No secrets or env files committed
```

### Review Process

- At least one code owner/reviewer should approve.
- Resolve all review comments before merge.
- Prefer squash merge for clean history.

---

## 🧪 Testing Requirements

### Backend

```powershell
Set-Location backend
npm test
npm run test:watch
npm run test:coverage
```

### Frontend

```powershell
Set-Location frontend
npm run lint
npm run build
```

No frontend unit test script is currently defined in `frontend/package.json`.

---

## 🔒 Security Best Practices

- Never commit `.env` files.
- Rotate secrets if exposure is suspected.
- Keep `JWT_SECRET` strong and private.
- Review [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) before public releases.

---

## 📚 Related Docs

- [README.md](./README.md)
- [DEVELOPMENT.md](./DEVELOPMENT.md)
- [BRANCH_PLAN.md](./BRANCH_PLAN.md)

