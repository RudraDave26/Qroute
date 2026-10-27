# Project Audit Report: QuantumRoute AI

**Project Title:** Quantum-Inspired Intelligent Traffic Route Optimization in Transportation Systems Using Metaheuristic Optimization  
**Project Name:** QuantumRoute AI  
**Research & Development Team:** MVP MAKERS  
**Audit Timestamp:** October 2026  
**Auditor:** Senior Full-Stack Software Architect & Debugging Engineer  

---

## 1. Executive Summary

QuantumRoute AI is a comprehensive, production-grade Next.js 14 web application designed to demonstrate multi-objective traffic routing, powertrain energy profiling (Petrol, Diesel, CNG, EV), and comparative metaheuristic optimization (Dijkstra, A*, Genetic Algorithm, and Quantum-Inspired Genetic Algorithm — QIGA).

This audit was conducted by inspecting every file in the codebase, testing all frontend routes, auditing all backend API endpoints, running the production Next.js compiler (`next build`), running ESLint, and checking external service fallbacks.

Overall, the project has a strong foundation, clean UI design, authentic OSRM road geometry generation, and a verified mathematical QIGA implementation. However, several critical runtime bugs, broken inter-page parameter linkages, coordinate discrepancies, and deployment gaps were discovered and documented below with prioritised fixes.

---

## 2. Existing Architecture

### 2.1 Technology Stack
- **Framework:** Next.js 14.2.15 (App Router, React Server Components & Client Components).
- **Language & Types:** TypeScript 5.6.3, strict mode enabled.
- **Styling:** Tailwind CSS 3.4.14 with Tailwind Animate and custom CSS theme tokens.
- **Mapping & GIS:** Leaflet 1.9.4 & React-Leaflet 4.2.1 with dynamic client-side SSR disabling (`next/dynamic`).
- **Road Routing Provider:** Open Source Routing Machine (OSRM) public HTTP API for verified turn-by-turn road vectors; TomTom Routing API v1 when `TOMTOM_API_KEY` is supplied.
- **Data Providers:**
  - **Open-Meteo:** Public weather forecast and air quality telemetry.
  - **India Petroleum API / PPAC MoPNG:** Live fuel price quotes with city benchmark fallback.
  - **OpenChargeMap / National Registry:** EV charging hub locations and power ratings.
  - **OpenStreetMap Nominatim / OpenAdminData:** Geocoding and administrative entity resolution.
- **State Management & Persistence:** Browser `localStorage` for saved commutes, recent searches, and custom tariffs, complemented by Next.js API session storage.
- **Visualization:** Recharts 2.13.0 for convergence trends, Pareto distributions, and fleet comparisons.

### 2.2 Directory & Module Structure
```text
c:/Users/ASUS/OneDrive/Desktop/Q-ROUTE/
├── .env.example                  # Environment template
├── .env.local                    # Local environment variables
├── next.config.mjs               # Webpack fallback & Next.js config
├── package.json                  # Dependencies and build scripts
├── tsconfig.json                 # TypeScript configuration
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Global HTML root layout with Navbar
│   │   ├── page.tsx              # Landing page with hero & quick trip shortcuts
│   │   ├── dashboard/page.tsx    # Interactive map navigation canvas
│   │   ├── plan/page.tsx         # Powertrain & objective calibration
│   │   ├── traffic/page.tsx      # Real-time traffic flow & incident monitor
│   │   ├── lab/page.tsx          # Optimization comparison lab (QIGA, GA, A*, Dijkstra)
│   │   ├── analytics/page.tsx    # Historical analytics & CSV exporter
│   │   ├── saved/page.tsx        # Saved route itinerary manager
│   │   ├── features/page.tsx     # Interactive platform capabilities
│   │   ├── about/page.tsx        # Academic research dossier & team attribution
│   │   └── api/                  # 17 REST API endpoints
│   ├── components/               # Reusable UI & Map components
│   └── lib/
│       ├── types.ts              # Core TypeScript interfaces
│       ├── utils.ts              # Unit formatters & math helpers
│       ├── storage.ts            # LocalStorage persistence layer
│       ├── algorithms/           # QIGA, GA, Dijkstra, A*, Cost & Vehicle models
│       └── providers/            # OSRM, TomTom, OpenMeteo, AirQuality, Nominatim
```

---

## 3. Current Working Features (Verified)

1. **Multi-Powertrain Physics Engine:**
   - Accurate fuel consumption, battery kWh usage, stop-and-go idle penalties, and $CO_2$ emissions across Petrol, Diesel, CNG, EV, and Motorcycle profiles (`src/lib/algorithms/vehicleModels.ts`).
2. **Authentic Road Geometry via OSRM:**
   - Actual road distances, driving times, turn-by-turn maneuvers, and polyline coordinates fetched via Open Source Routing Machine (`src/lib/providers/osrm.ts`).
3. **Four-Algorithm Benchmark Suite:**
   - Real, dynamic runtime benchmarking across Dijkstra, A*, GA, and QIGA executed using `performance.now()` over identical road network graphs (`src/app/api/optimization/run/route.ts`).
4. **Interactive Leaflet Map Canvas:**
   - OpenStreetMap tile layers, smooth bounding box transitions, custom markers (A/B endpoints, hazards, EV hubs), and dual-route vector rendering (electric cyan selected vs. dashed gray alternative).
5. **Multi-Objective Cost Model:**
   - Mathematical normalization and composite scoring $J(r) = w_t T + w_c C + w_d D + w_e E$ (`src/lib/algorithms/costModel.ts`).
6. **Live Weather & Air Quality Feeds:**
   - Live Open-Meteo current weather and European/US AQI indices with traffic impact evaluations (`src/app/api/weather`, `src/app/api/air-quality`).
7. **Production Build Cleanliness:**
   - `next build` successfully generates all 30 static pages and dynamic routes.

---

## 4. Confirmed Bugs & Broken Functionality

### 🔴 Critical Bugs (Severity 1)
1. **Dashboard Ignores Navigation Query Parameters:**
   - **Locations:** `src/app/dashboard/page.tsx`
   - **Root Cause:** When users click "Quick Demo Trips" on the homepage (`/dashboard?from=koramangala&to=whitefield`, `/dashboard?from=cp&to=cybercity`, `/dashboard?from=nariman&to=bkc`), or click "Navigate" on a saved route (`/dashboard?lat1=...&lng1=...&lat2=...&lng2=...`), or click "Launch Navigation" from the Route Planner (`/dashboard?vehicle=...&objective=...`), `dashboard/page.tsx` never parsed `useSearchParams()`. As a result, the map always reverted to the default Koramangala $\to$ Whitefield route.
   - **Impact:** Breaks all inbound links to the route navigation canvas.

2. **Fuel Price Data Structure Mismatch:**
   - **Locations:** `src/app/api/fuel-prices/route.ts` vs `src/app/dashboard/page.tsx:178`
   - **Root Cause:** `dashboard/page.tsx` expects `data.prices.petrol` and `data.dataStatus === 'LIVE'`. However, `/api/fuel-prices/route.ts` returns an array `prices: result.prices` where each element is `{ fuelType, priceInr }`. Accessing `data.prices.petrol` evaluates to `undefined`, silently failing fuel price integration in the dashboard.
   - **Impact:** Live fuel price badge and tariff indicator fail to display.

3. **Mumbai BKC Coordinate Typo (Geocoding Glitch):**
   - **Location:** `src/lib/providers/nominatim.ts:29`
   - **Root Cause:** Bandra Kurla Complex (BKC) longitude was erroneously recorded as `77.8687` instead of `72.8687`.
   - **Impact:** Selecting BKC routed the user 500 km east into central Maharashtra (near Nanded) instead of central Mumbai, causing unrealistic driving distances (~580 km) for the Mumbai demo trip.

### 🟡 Moderate Bugs (Severity 2)
4. **Missing Custom 404 (`not-found.tsx`):**
   - **Location:** `src/app/not-found.tsx` (Missing)
   - **Impact:** Invalid URLs display the default Next.js unstyled error page rather than the branded QuantumRoute AI layout.

5. **Missing Vercel Deployment Configuration (`vercel.json`):**
   - **Location:** `vercel.json` (Missing)
   - **Impact:** Security headers, caching policies, and clean region routing are not configured for Vercel edge deployment.

6. **ESLint Hook Dependency Warnings:**
   - **Locations:** `src/app/dashboard/page.tsx:90`, `src/app/lab/page.tsx:79`, `src/app/traffic/page.tsx:74`
   - **Root Cause:** `useEffect` hooks called async fetch functions without declaring them in dependency arrays or wrapping them in `useCallback`.
   - **Impact:** Potential stale closure references or unnecessary re-renders.

### 🟢 Minor Bugs & Code Smells (Severity 3)
7. **Health API Stale Routing Description:**
   - **Location:** `src/app/api/health/route.ts:15`
   - **Root Cause:** States routing is "Multi-Objective Graph Routing Engine" rather than identifying the primary OSRM engine.
8. **Lack of Educational Comments in Complex Algorithm Code:**
   - **Locations:** `src/lib/algorithms/qiga.ts`, `src/lib/algorithms/costModel.ts`
   - **Impact:** Difficult for students and academic evaluators to immediately trace Q-bit state vectors, rotation matrices, and multi-objective Pareto normalization.

---

## 5. Security Audit & Risks

| Category | Finding | Status |
| :--- | :--- | :--- |
| **API Key Exposure** | All secret keys (`TOMTOM_API_KEY`, `TRAFFIC_API_KEY`, `OPENCHARGEMAP_API_KEY`) reside exclusively in server-side files and are never prefixed with `NEXT_PUBLIC_`. | ✅ Secure |
| **Input Validation** | API endpoints (`/api/routes`, `/api/optimization/run`, `/api/routes/compare`) use Zod schemas to sanitize coordinates and parameters. | ✅ Secure |
| **Error Leakage** | Production API routes catch exceptions and return sanitized messages, preventing stack trace disclosure. | ✅ Secure |
| **Client LocalStorage** | Only user route preferences and commute waypoints are persisted client-side. No credentials or auth tokens are stored. | ✅ Secure |

---

## 6. Deployment Blockers

1. **`useSearchParams()` without Suspense Boundary:**
   - Next.js 14 App Router requires any component using `useSearchParams()` to be wrapped in a `<Suspense>` boundary during static generation to avoid de-opting into client-only bailout.
2. **Missing `vercel.json`:**
   - Required for setting proper HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`) and caching policies.

---

## 7. Recommended Fixes (Ranked by Priority)

1. **Fix 1 (P0):** Update `src/app/dashboard/page.tsx` to wrap content in `<Suspense>` and parse `useSearchParams()` for `lat1`, `lng1`, `lat2`, `lng2`, `from`, `to`, `vehicle`, and `objective`.
2. **Fix 2 (P0):** Update `src/lib/providers/nominatim.ts` to correct BKC Mumbai coordinates to `lng: 72.8687`.
3. **Fix 3 (P0):** Update `src/app/api/fuel-prices/route.ts` to return both object-keyed fuel prices and structured lists with `dataStatus`.
4. **Fix 4 (P1):** Create `src/app/not-found.tsx` with branded QuantumRoute navigation.
5. **Fix 5 (P1):** Create `vercel.json` with security headers and deployment configuration.
6. **Fix 6 (P2):** Clean up ESLint hook dependency warnings using `useCallback`.
7. **Fix 7 (P2):** Add beginner-friendly academic comments throughout `qiga.ts`, `genetic.ts`, `astar.ts`, and `dijkstra.ts`.
8. **Fix 8 (P3):** Update `README.md` with complete architecture defense guide, installation steps, and API key setup.
