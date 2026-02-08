# 🌾 FarmSmart – Backend System

FarmSmart is a backend platform designed to support farmers with **secure authentication**, **crop listing**, and **data-driven price intelligence**.
The backend is built with **Node.js, TypeScript, Express, and MongoDB**, and includes a **fully automated smoke-test / unit-test workflow** to validate correctness end-to-end.

---

## ✅ Current Status (Verified)

As of now, **all core backend features are working and verified automatically** using a PowerShell-based test runner.

✔ Authentication (OTP-based)
✔ Crop creation & listing
✔ Price APIs (current, history, comparison)
✔ Database seeding
✔ Build & runtime stability

The system passes **end-to-end automated verification with zero manual steps**.

---

## 🧱 Tech Stack

* **Runtime:** Node.js
* **Language:** TypeScript
* **Framework:** Express.js
* **Database:** MongoDB
* **Auth:** OTP-based authentication (dev-friendly `debugOtp`)
* **Testing:** PowerShell smoke-test script (API + auth aware)

---

## 🔐 Authentication Flow (OTP-Based)

FarmSmart uses a **two-step authentication flow**:

1. **Login with phone + password**
2. **OTP verification**

   * In development mode, backend returns a `debugOtp`
   * This allows **automated verification without SMS dependency**

### Example Login Response

```json
{
  "success": true,
  "message": "Credentials valid. Please verify OTP.",
  "data": {
    "requiresOtp": true,
    "phoneNumber": "9XXXXXXXXX",
    "debugOtp": "123456"
  }
}
```

After OTP verification, a **JWT token** is issued and used for all protected routes.

---

## 🌱 Core API Features

### 1. Authentication

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/verify` (OTP verification)

### 2. Crops (Authenticated)

* `POST /crops`
* `GET /crops`

> Routes are accessible via both:
>
> * `/crops`
> * `/api/crops`
>   (alias support for compatibility)

### 3. Price Intelligence (Public)

* `GET /prices/current`
* `GET /prices/history`
* `GET /prices/compare`

---

## 🧪 Automated Testing & Verification (IMPORTANT)

FarmSmart does **not rely on manual testing**.
Instead, it uses a **single PowerShell script** that performs **end-to-end smoke tests**, including auth and database operations.

### Test Script

```
verify_farmsmart_features_v7.ps1
```

### What the Script Does

The script automatically:

1. Checks MongoDB availability
2. Installs backend dependencies
3. Builds the TypeScript project
4. Seeds required database data (Quality Rules)
5. Starts the backend server
6. Runs API smoke tests:

   * User registration
   * Login
   * OTP verification (using `debugOtp`)
   * Token-based authentication
   * Create crop
   * List crops
   * Fetch price data
7. Stops the server cleanly

---

## ▶️ How to Run Tests

From the **repository root**:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify_farmsmart_features_v7.ps1
```

### ✅ Expected Output (Success)

```text
OK: MongoDB reachable
OK: Build OK
OK: QualityRules seeded
OK: Server running
OK: Register OK
OK: Login OK
OK: OTP verified
OK: Auth OK (token ready)
OK: Create crop OK
OK: List crops OK
OK: Price endpoints OK
==> All smoke checks passed.
```

If you see this output, **the backend is fully functional**.

---

## 📂 Logs

During testing, logs are automatically written to:

```
scripts/_verify_server_stdout.log
scripts/_verify_server_stderr.log
```

These are useful for debugging if a test fails.

---

## 🧠 Design Philosophy

* **Minimal, predictable API surface**
* **OTP-first security**
* **Automation over manual testing**
* **Backward-compatible routing** (`/` and `/api`)
* **Fail-fast verification**

---

## 🚀 Conclusion

FarmSmart’s backend is:

* ✔ Secure
* ✔ Tested
* ✔ Reproducible
* ✔ Production-ready in structure

The PowerShell verification script acts as both **unit testing and integration testing**, ensuring that **any evaluator or developer can validate correctness in one command**.
