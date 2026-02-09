# FarmSmart Release Readiness - Implementation Plan

## Git Branch Structure

```text
main
 └── feat/release-readiness
     ├── fix/auth-otp-contract-consistency
     ├── fix/tests-align-with-current-auth-flow
     ├── feat/prices-provider-hardening
     ├── fix/frontend-env-hygiene
     ├── feat/ci-quality-gates
     └── docs/repo-documentation-baseline
```

Observed history confirms active use of `feat/*` and `fix/*` branch styles (for example `feat/SalesRevenue`, `fix/backendErr`, `backend-integration-fixes`).

---

## BRANCH 1: auth-otp-contract-consistency

**Branch**: `fix/auth-otp-contract-consistency`  
**Parent**: `feat/release-readiness`  
**Goal**: Standardize OTP auth response contracts and remove debug-only fields in non-development usage.

### Files to Modify:

1. `backend/src/controllers/authController.ts`
2. `backend/src/middleware/authMiddleware.ts`
3. `backend/src/utils/response.ts`

### Code Changes:

#### authController.ts - Response Contract Tightening

- Keep `requiresOtp` behavior.
- Gate or remove `debugOtp` for production-safe responses.
- Keep register/login/verify field naming consistent.

#### authMiddleware.ts - Token Decode Consistency

- Keep one canonical token payload shape (`userId`, `role`).
- Remove fallback ambiguity between `decoded.userId` and `decoded.id` if not needed.

---

## BRANCH 2: tests-align-with-current-auth-flow

**Branch**: `fix/tests-align-with-current-auth-flow`  
**Parent**: `feat/release-readiness`  
**Goal**: Update backend tests to match current OTP-based auth implementation.

### Files to Modify:

1. `backend/__tests__/auth/register.test.ts`
2. `backend/__tests__/auth/login.test.ts`
3. `backend/__tests__/auth/verify.test.ts`

### Code Changes:

#### register/login tests

- Replace token-on-login/register expectations with OTP flow expectations.
- Validate `requiresOtp` and verify step behavior.

#### verify tests

- Replace legacy `501 not implemented` expectation with current implemented flow.

---

## BRANCH 3: prices-provider-hardening

**Branch**: `feat/prices-provider-hardening`  
**Parent**: `feat/release-readiness`  
**Goal**: Harden price ingestion path, cache behavior, and error observability.

### Files to Modify:

1. `backend/src/services/priceService.ts`
2. `backend/src/services/mandiPriceIngestion.ts`
3. `backend/src/cache/redisCache.ts`
4. `backend/src/controllers/prices.controller.ts`

### Code Changes:

#### priceService.ts

- Add clear logging boundaries for provider failures versus cache failures.
- Ensure fallback behavior remains deterministic.

#### mandiPriceIngestion.ts

- Validate payloads defensively with explicit error messages.

#### prices.controller.ts

- Keep strict query validation and consistent 400 response format.

---

## BRANCH 4: frontend-env-hygiene

**Branch**: `fix/frontend-env-hygiene`  
**Parent**: `feat/release-readiness`  
**Goal**: Remove tracked env risk and align frontend env management with backend practices.

### Files to Modify:

1. `frontend/.gitignore`
2. `frontend/.env.example`
3. `frontend/src/services/api.js`

### Code Changes:

#### .gitignore and env handling

- Ignore `frontend/.env`.
- Keep only placeholder values in `.env.example`.
- Verify `VITE_API_BASE_URL` fallback remains safe for local dev.

---

## BRANCH 5: ci-quality-gates

**Branch**: `feat/ci-quality-gates`  
**Parent**: `feat/release-readiness`  
**Goal**: Add repeatable checks before merges.

### Files to Create/Modify:

1. `.github/workflows/backend-checks.yml` (new)
2. `.github/workflows/frontend-checks.yml` (new)
3. `CONTRIBUTING.md`

### Code Changes:

#### backend checks

- Install deps, run `npm run build`, run `npm test`.

#### frontend checks

- Install deps, run `npm run lint`, run `npm run build`.

---

## BRANCH 6: repo-documentation-baseline

**Branch**: `docs/repo-documentation-baseline`  
**Parent**: `feat/release-readiness`  
**Goal**: Establish full docs baseline and keep docs synced with code.

### Files to Modify:

1. `README.md`
2. `QUICK_START.md`
3. `DEVELOPMENT.md`
4. `ARCHITECTURE.md`
5. `API.md`
6. `CONTRIBUTING.md`
7. `BRANCH_PLAN.md`
8. `TEAM_SETUP_GUIDE.md`
9. `SECURITY_CHECKLIST.md`
10. `backend/README.md`

### Code Changes:

#### Documentation alignment

- Keep command consistency across docs.
- Keep env variable names code-accurate.
- Keep route contracts synced with `backend/src/routes/*`.

---

## Testing Checklist

### Branch 1 - Auth Contract

- Register/login returns OTP-required flow.
- Verify endpoint returns JWT and user payload.

### Branch 2 - Auth Tests

- Backend auth test suites reflect current controller behavior.

### Branch 3 - Price Hardening

- Current/history/compare endpoints continue returning deterministic fallback data when provider fails.
- Cache behavior validated with existing test patterns.

### Branch 4 - Env Hygiene

- `.env` is no longer tracked.
- Frontend still resolves `VITE_API_BASE_URL` correctly.

### Branch 5 - CI Gates

- Workflow runs pass on PRs.

### Branch 6 - Documentation

- All docs link correctly and commands stay in sync.

---

## Merge Strategy

1. Create `feat/release-readiness` from `main`.
2. Implement and merge branches in this order:
   - `fix/auth-otp-contract-consistency`
   - `fix/tests-align-with-current-auth-flow`
   - `feat/prices-provider-hardening`
   - `fix/frontend-env-hygiene`
   - `feat/ci-quality-gates`
   - `docs/repo-documentation-baseline`
3. Run final regression checks on backend and frontend.
4. Merge `feat/release-readiness` into `main` with squash merge.

