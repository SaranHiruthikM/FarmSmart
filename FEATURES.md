# FarmSmart Feature Deep Dive (New Additions)

This document captures the most recent feature additions across AI intelligence, market planning, pooling, logistics, and cooperative operations. It is designed to help developers understand the intent, data flow, and integration points for each new capability.

## Feature Map

- AI Crop Vision Quality Grading
- AI Crop Doctor (Symptom Diagnosis)
- AI Rotation Advisor
- Demand Forecasting and Crop Recommendations
- Seasonal Crop Planning with ML Price Prediction
- Market Price Intelligence 2.0 (Live Mandi, CSV Trends, AI Analysis, Chat Forecast)
- Cooperative Pooling and Institutional Batches
- Logistics Hub and Role-Based Order Hand-off
- Cooperative Official and Admin Operations

## AI Crop Vision Quality Grading

Purpose: Convert crop images into standardized grades with defect insights and a pricing impact preview.

How it works:
The service tries Groq Llama 4 Scout first, then falls back to Gemini 2.0 Flash. The response is parsed as JSON, normalized to a grade, and enriched with QualityRule multipliers.

Primary endpoints:
- POST /quality/analyze (auth, multipart form-data, field name `image`)
- POST /quality/evaluate (auth, JSON body with `grade` and `basePrice`)
- GET /quality/price-impact (public, query `grade` and `basePrice`)
- GET /quality (auth + adminOnly)
- PUT /quality/:id (auth + adminOnly)

Key implementation:
- backend/src/services/visionService.ts
- backend/src/controllers/qualityController.ts
- backend/src/models/QualityRule.ts

Notes:
If both AI providers fail, the service returns a safe fallback payload so the frontend remains usable.

## AI Crop Doctor (Symptom Diagnosis)

Purpose: Provide diagnosis, causes, and a treatment plan based on farmer-reported symptoms.

Primary endpoint:
- POST /advisory/diagnose (auth, JSON body with `symptoms`, optional `crop`, `location`, `language`)

Key implementation:
- backend/src/services/aiAdvisoryService.ts
- backend/src/controllers/aiAdvisoryController.ts

Notes:
If AI is unavailable, a structured fallback response is returned to avoid blocking the UI.

## AI Rotation Advisor

Purpose: Recommend the next best crop for rotation based on district context and season.

Primary endpoint:
- GET /advisory/rotation-suggestion (auth, query `lastCrop`, `district`)

Key implementation:
- backend/src/services/rotationService.ts
- backend/src/controllers/rotationController.ts

Notes:
The prompt is season-aware and currently uses March 2026 context for the Rabi to Summer transition.

## Demand Forecasting and Crop Recommendations

Purpose: Help farmers decide whether to sell now or wait, and suggest profitable crops based on location and rotation.

Primary endpoints:
- GET /demand/forecast (auth, query `crop`, `location`)
- GET /demand/recommendations (auth, query `location`, optional `crop`)

How it works:
The demand signal is computed from active negotiations, crop supply, recent mandi prices, and ML price prediction. Groq AI optionally summarizes the decision for clarity.

Key implementation:
- backend/src/services/demandService.ts
- backend/src/controllers/demandController.ts
- backend/src/services/predictionService.ts

Notes:
If AI is not configured, a crop-aware fallback recommendation list is used instead of a generic default.

## Seasonal Crop Planning with ML Price Prediction

Purpose: Generate a season plan that projects profits for the current sowing window.

Primary endpoint:
- POST /planning/plan (auth, JSON body with `landSize`, `soilType`, `district`, optional `date`)

How it works:
The service filters suitable crops for the current month and soil type, then uses the ML price model to estimate revenue and profit.

Key implementation:
- backend/src/services/planningService.ts
- backend/src/controllers/planningController.ts
- backend/src/services/predictionService.ts

Notes:
If the ML model is missing or a crop is not supported, that crop is skipped to keep the plan high confidence.

## Market Price Intelligence 2.0

Purpose: Provide live mandi data, historical trends, AI summaries, and ML forecasting for price planning.

Primary endpoints:
- GET /prices/current (query `crop`, optional `location`)
- GET /prices/history (query `crop`, `location`, optional `days`)
- GET /prices/compare (query `crop`, `location`)
- GET /prices/states
- GET /prices/districts (query `state`)
- GET /prices/crops (query `location`)
- GET /prices/csv-trends (query `crop`, optional `range`)
- POST /prices/ai-analysis (JSON body with `crop`, `timeline`, `points`, optional `language`)
- POST /prices/forecast (JSON body with `crop`, `district`, `currentPrice`, optional `query`, `language`)

Key implementation:
- backend/src/services/mandiPriceIngestion.ts
- backend/src/services/priceService.ts
- backend/src/services/csvTrendService.ts
- backend/src/services/marketAnalysisService.ts
- backend/src/services/predictionService.ts
- backend/src/controllers/prices.controller.ts

Notes:
Live mandi calls are cached (Redis or in-memory). If the provider or dataset is unavailable, endpoints return deterministic safe responses to keep the UI stable.

## Cooperative Pooling and Institutional Batches

Purpose: Aggregate supply from multiple farmers to unlock larger buyers and stable pricing.

Primary endpoints:
- GET /pooling/active (auth, query `district`, optional `cropName`)
- POST /pooling/join (auth, JSON body with `poolId`, `cropId`, `contributedQuantity`)
- POST /pooling/create (auth, admin or cooperative, JSON body with `cropName`, `targetQuantity`, `unit`, `district`, `state`, `basePrice`, optional `expiryDays`)
- GET /pooling/institutional-batches (auth, query `cropName`, optional `district`)

Key implementation:
- backend/src/models/Pool.ts
- backend/src/controllers/poolingController.ts
- backend/src/routes/pooling.routes.ts

Notes:
Pool join is transactional and auto-locks when the target quantity is reached.

## Logistics Hub and Role-Based Order Hand-off

Purpose: Assign logistics providers to orders and track delivery details and status transitions.

Primary endpoints:
- GET /orders/available (auth, logistics role)
- PUT /orders/:id/accept (auth, logistics role)
- PATCH /orders/:id/logistics (auth, logistics role)
- PATCH /orders/:id/status (auth, logistics or admin role)

Key implementation:
- backend/src/models/Order.ts
- backend/src/controllers/orderController.ts
- backend/src/routes/orderRoutes.ts

Notes:
Logistics providers can accept unassigned orders, attach driver and vehicle details, and update the order lifecycle.

## Cooperative Official and Admin Operations

Purpose: Enable cooperative officials to manage KYC, advisories, schemes, and platform health.

Primary endpoints:
- POST /admin/login
- GET /admin/dashboard (auth + adminOnly)
- GET /admin/kyc/pending (auth + adminOnly)
- PUT /admin/kyc/:userId (auth + adminOnly)
- GET /advisory/admin/all (auth + adminOnly)
- POST /advisory (auth + adminOnly)
- POST /schemes (auth + adminOnly)
- PUT /schemes/:id (auth + adminOnly)
- DELETE /schemes/:id (auth + adminOnly)

Key implementation:
- backend/src/controllers/adminController.ts
- backend/src/controllers/advisoryController.ts
- backend/src/controllers/schemeController.ts
- backend/src/middleware/authMiddleware.ts

Notes:
The COOPERATIVE role is supported alongside ADMIN for admin-only middleware checks.

## Frontend Surfaces for New Features

Key pages and modules:
- frontend/src/pages/DemandForecast.jsx
- frontend/src/pages/CropPlanning.jsx
- frontend/src/pages/logistics/LogisticsDashboard.jsx
- frontend/src/pages/official/OfficialDashboard.jsx
- frontend/src/pages/official/AdvisoryManager.jsx
- frontend/src/pages/official/SchemesManager.jsx
- frontend/src/pages/official/DisputeTribunal.jsx
- frontend/src/pages/official/KycVerification.jsx
- frontend/src/pages/official/QualityStandards.jsx
- frontend/src/components/dashboard/RotationAdvisoryCard.jsx

Service layer entry points:
- frontend/src/services/price.service.js
- frontend/src/services/aiAdvisory.service.js
- frontend/src/services/pooling.service.js
- frontend/src/services/rotation.service.js

## Environment and Model Requirements

Backend environment variables (backend/.env):
- GROQ_API_KEY for AI advisory, AI market analysis, and chat forecasting
- GEMINI_API_KEY for vision fallback
- MANDI_API_KEY for live mandi data via data.gov.in
- REDIS_URL and PRICE_CACHE_ENABLED for caching
- JWT_SECRET and DATABASE_URL for core auth and data

ML model assets and dataset:
- backend/models/monthly_crop_price_model.pkl
- backend/models/crop_label_encoder.pkl
- backend/dataset/Agriculture_price_dataset.csv

Python dependency:
- Python is required for backend price predictions via backend/scripts/predict_price.py

## Developer Notes

- AI features are built with safe fallbacks to avoid blocking the UI when providers are unavailable.
- Forecasting endpoints intentionally return deterministic strings to keep frontend rendering consistent.
- Pooling joins run in a transaction to prevent partial updates on failure.
- Role gating is centralized in backend/src/middleware/authMiddleware.ts.

