# 🔒 Security Checklist - Before Making Repository Public

## ⚠️ Required Security Checks (Current Repository State)

Verified from this codebase:

### 1. Environment File Handling

- ⚠️ `frontend/.env` is currently **tracked in git**.
- ✅ `backend/.env` is ignored by `backend/.gitignore`.
- ✅ `backend/.env.example` and `frontend/.env.example` exist.

### 2. Auth/Secret Handling in Code

- ⚠️ `backend/src/controllers/authController.ts` includes `debugOtp` in auth responses.
- ⚠️ `backend/src/controllers/authController.ts` logs generated OTP to console.
- ⚠️ `backend/src/controllers/authController.ts` and `backend/src/middleware/authMiddleware.ts` use fallback JWT secret (`default_secret_key_change_me`) if env is missing.

### 3. Optional External Integrations

- ⚠️ Price provider may use `MANDI_API_KEY` and `MANDI_API_BASE_URL`; these must stay in env files only.
- ⚠️ Optional `REDIS_URL` should never be hardcoded.

---

## 🚨 Critical Actions Required BEFORE Public Release

### 1. Stop Tracking `frontend/.env`

```powershell
# From repository root
git rm --cached frontend/.env
```

Then ensure frontend ignore rules include `.env`.

### 2. Remove OTP Debug Exposure

- Remove `debugOtp` from API responses.
- Remove OTP console logging from non-local debug paths.

### 3. Enforce Strong JWT Secret

- Require `JWT_SECRET` to be set.
- Fail fast on startup if missing in non-local environments.

### 4. Scan for Secrets Before Every Merge

```powershell
# Broad scan (excluding node_modules and git internals)
rg -n --hidden -S --glob '!**/node_modules/**' --glob '!**/.git/**' "(api[_-]?key|secret|token|password|mongodb://|JWT_SECRET|MANDI_API_KEY|DATABASE_URL|debugOtp)"
```

```powershell
# Focused env/credential scan in tracked files
git ls-files | rg -n "(\.env$|\.pem$|\.key$|credentials|secret)"
```

### 5. Rotate Secrets If Exposure Is Suspected

- Rotate JWT secret
- Rotate API keys (for mandi provider or any future services)
- Update local env values securely

---

## 📋 Pre-Publication Checklist

- [ ] `frontend/.env` removed from git tracking
- [ ] `.env` files ignored in both backend and frontend
- [ ] No hardcoded secrets in source files
- [ ] No debug OTP values in API responses
- [ ] No debug OTP logging in production paths
- [ ] `JWT_SECRET` set securely in deployment environment
- [ ] Secret scan command returns no sensitive leaks
- [ ] Commit history reviewed for accidental leaks

---

## 🛑 What NOT to Commit

- `.env` files with real values
- API keys and tokens
- MongoDB URIs with credentials
- Private key/certificate material (`*.pem`, `*.key`)
- Secret manager exports or credential dumps

---

## ✅ Safe to Commit

- `.env.example` files with placeholders
- Source code without secrets
- Documentation (with placeholder values only)
- Build/test configs without credential literals

---

## 🧹 If Secrets Were Previously Committed

### Option 1: Rotate and Continue (minimum)

- Rotate all exposed secrets
- Keep incident notes in team documentation

### Option 2: Rewrite History (stronger cleanup)

```powershell
# Example using git-filter-repo (if installed)
# Remove tracked frontend/.env from history
git filter-repo --path frontend/.env --invert-paths
```

History rewrite requires coordinated force-push and teammate re-sync.

---

## 📞 Additional Security Practices

- Protect `main` with required PR reviews
- Require CI checks before merge
- Restrict who can manage repository secrets
- Schedule periodic secret scanning

---

## 🔗 Related Docs

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [TEAM_SETUP_GUIDE.md](./TEAM_SETUP_GUIDE.md)
- [DEVELOPMENT.md](./DEVELOPMENT.md)

