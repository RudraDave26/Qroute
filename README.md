# QuantumRoute AI

> **Quantum-Inspired Intelligent Traffic Route Optimization Using Metaheuristic Algorithms**  
> **Team:** MVP MAKERS  
> **Demo URL:** [https://quantum-traffic-optimizer.vercel.app/](https://quantum-traffic-optimizer.vercel.app/)

---

## 1. Project Overview

**QuantumRoute AI** is an advanced full-stack traffic navigation and intelligent route optimization platform inspired by Google Maps, designed with a distinctive visual identity, honest data-transparency architecture, and multi-objective metaheuristic optimization.

Unlike traditional single-objective GPS tools that optimize solely for travel time or shortest distance, QuantumRoute AI unifies travel time, fuel expenditures, EV energy consumption in kWh, and carbon emissions into a Pareto-optimal cost function. The system features a signature **Quantum-Inspired Genetic Algorithm (QIGA)** benchmarked directly against Classical Genetic Algorithms, A* Heuristic Search, and Dijkstra's Algorithm under identical geospatial conditions.

---

## 2. Core Features & Capabilities

- **Interactive Geospatial Dashboard (`/dashboard`)**:
  - Full-screen OpenStreetMap canvas powered by Leaflet.
  - Origin & destination geocoding with instant autocomplete and metropolitan presets.
  - Real-time alternative routes rendered in distinctive, accessible polyline styles.
  - Live incident markers with severity badges and delay estimations.
  - GPS geolocation and origin/destination endpoint swap.

- **Advanced Route Planner & Powertrain Profiler (`/plan`)**:
  - Multi-objective preference tuning: Fastest, Cheapest, Shortest, Eco / Green, Balanced.
  - Realistic powertrain simulation: Midsize Petrol Car, Diesel Sedan, CNG Hatchback, Electric Vehicle (EV), and Motorcycle.
  - Accurate EV calculations: Idle HVAC draw, regenerative braking, grid carbon intensity (52 g CO₂/km), and electricity tariffs in INR/kWh (never confuses EV power with petrol liters).
  - Explicit distinction between routing provider capabilities vs optimization engine weights.

- **Live Traffic Flow & Incident Intelligence (`/traffic`)**:
  - Traffic flow speeds, congestion indices, and travel delay telemetry.
  - Filterable verified incidents by type (Accidents, Congestion, Construction, Closures) and severity.
  - Transparent data freshness status badges: `LIVE`, `CACHED`, `HISTORICAL`, `DEMO`, and `UNAVAILABLE`.

- **Quantum-Inspired Optimization Lab (`/lab`)**:
  - Head-to-head comparison of **Dijkstra**, **A\***, **Classical Genetic Algorithm (GA)**, and **Quantum-Inspired Genetic Algorithm (QIGA)** on identical state graphs.
  - Real iteration-by-iteration convergence curves rendered with Recharts (zero fabricated or hardcoded charts).
  - Visual Q-bit amplitude matrix: displays state vectors $|\psi_i\rangle = \alpha_i |0\rangle + \beta_i |1\rangle$ and phase angles.
  - Accessible scientific documentation explaining the 2×2 unitary rotation gate and classical CPU execution substrate.

- **Analytics Dashboard & Journey Logging (`/analytics`)**:
  - Fleet powertrain cost and carbon comparisons per 100 km.
  - Diurnal congestion cycles and hourly arterial flow speed correlations.
  - Local journey log with client-side CSV export.

- **Saved Routes & System Preferences (`/saved`)**:
  - Save, rename, and delete frequently traveled corridors.
  - Regional fuel and domestic electricity price overrides.
  - Privacy-preserving browser local storage persistence.

- **Research Dossier & Methodology (`/about`)**:
  - Formal mathematical formulation of $J(r)$.
  - QIGA theory, rotation lookup tables, comparative analysis, and academic references.

---

## 3. Mathematical Optimization Formulation

For any candidate corridor $r$, QuantumRoute AI evaluates the composite cost:

$$J(r) = w_t \cdot T_{\text{norm}}(r) + w_c \cdot C_{\text{norm}}(r) + w_d \cdot D_{\text{norm}}(r) + w_e \cdot E_{\text{norm}}(r)$$

Where:
- $T_{\text{norm}}(r)$: Normalized travel-time cost under dynamic traffic delays.
- $C_{\text{norm}}(r)$: Normalized financial cost (fuel liters or EV kWh + highway tolls).
- $D_{\text{norm}}(r)$: Normalized physical travel distance (km).
- $E_{\text{norm}}(r)$: Normalized CO₂ emissions (kg).
- Non-negative weights satisfy $\sum w_i = 1.0$.

### Quantum-Inspired Genetic Algorithm (QIGA) Mechanics
1. **Representation**: Chromosomes are encoded as strings of Q-bits:
   $$Q = \begin{bmatrix} \alpha_1 & \alpha_2 & \dots & \alpha_m \\ \beta_1 & \beta_2 & \dots & \beta_m \end{bmatrix}, \quad |\alpha_i|^2 + |\beta_i|^2 = 1.0$$
2. **Measurement**: Binary observation strings collapse via random sampling against $|\beta_i|^2$.
3. **Unitary Rotation Gate**: State vectors evolve toward the best-so-far solution using:
   $$\begin{bmatrix} \alpha_i^{t+1} \\ \beta_i^{t+1} \end{bmatrix} = \begin{bmatrix} \cos(\Delta\theta_i) & -\sin(\Delta\theta_i) \\ \sin(\Delta\theta_i) & \cos(\Delta\theta_i) \end{bmatrix} \begin{bmatrix} \alpha_i^t \\ \beta_i^t \end{bmatrix}$$
   with dynamic step annealing $\theta_0 = 0.035\pi \cdot (1 - \frac{t}{G}) + 0.005\pi$.

---

## 4. Technology Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS, PostCSS, Lucide React
- **Geospatial Mapping**: Leaflet, React Leaflet, OpenStreetMap
- **Data Visualization**: Recharts
- **Animations**: Framer Motion
- **Validation**: Zod
- **External Providers & Data Feeds**:
  - **OpenStreetMap (OSM)**: Base cartography, raster tiles, and Nominatim forward/reverse geocoding (`https://www.openstreetmap.org/`).
  - **OpenAdminData India**: Official 37 States/UTs and 635 districts hierarchy with Hindi/English bilingual names, population data, and geospatial centroids (`https://api.openadmindata.org/api/v1/countries/in.json`).
  - **LGD JSON API (Local Government Directory)**: India Urban Local Bodies (ULBs), municipal corporations, municipalities, and cities registry (`https://lgd-json-api.vercel.app/docs`).
  - **Open-Meteo Air Quality API**: Real-time European AQI, US AQI, PM2.5, PM10, and NO₂ levels (`https://open-meteo.com/en/docs/air-quality-api`).
  - **India Petroleum API**: Real-time PPAC daily petrol and diesel tariffs across Indian metros (`https://india-petroleum-api.vercel.app/docs`).
  - **Open Charge Map API**: Global electric vehicle charging station network with kW rating and connector types (`https://openchargemap.org/site/develop/api`).
  - **TomTom Traffic API**: Real-time incident telemetry, segment speed flow, and raster flow tiles (`https://developer.tomtom.com/`).

---

## 5. API Endpoints

- `GET /api/admin/states` — Returns all 37 Indian States and Union Territories with bilingual names and centroid coordinates.
- `GET /api/admin/districts?stateId=...` — Returns 635 Indian districts filtered by parent state or keyword.
- `GET /api/admin/cities?q=jaipur` — Queries LGD Indian Cities and pairs with geocoded coordinates.
- `GET /api/geocode?q=...` — Unified location search across Indian administrative boundaries, local presets, and OpenStreetMap.
- `GET /api/air-quality?lat=...&lng=...` — Live atmospheric air quality index and particulate metrics.
- `GET /api/fuel-prices` — Daily fuel tariffs from PPAC.
- `GET /api/charging-stations?lat=...&lng=...` — Nearby fast DC and AC EV charging hubs.
- `GET /api/traffic/flow` — Real-time TomTom flow vector metrics and tile endpoint.
- `GET /api/traffic/incidents` — Live traffic delay events, closures, and hazard telemetry.
- `POST /api/routes` — Multi-alternative route generator comparing fastest, cheapest, shortest, eco, and balanced paths.
- `POST /api/optimization/run` — Benchmarking suite running Dijkstra, A*, Classical GA, and QIGA.

---

## 5. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20.18.0)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/mvp-makers/quantumroute-ai.git
cd Q-ROUTE

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Run production build
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 6. Project Team

Developed with pride by **MVP MAKERS**:
- Full-Stack Geospatial Engineering & Optimization Research
- Academic and industrial research demonstration prototype
