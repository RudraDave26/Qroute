export type DataStatus = 'LIVE' | 'CACHED' | 'HISTORICAL' | 'DEMO' | 'UNAVAILABLE';

export interface LatLng {
  lat: number;
  lng: number;
  label?: string;
}

export type VehicleType = 'petrol' | 'diesel' | 'cng' | 'ev' | 'motorcycle' | 'custom';

export interface VehicleProfile {
  type: VehicleType;
  name: string;
  efficiency: number; // km per unit (km/L or km/kWh)
  efficiencyUnit: string; // 'km/L' | 'km/kWh'
  fuelPrice: number; // INR per unit
  emissionFactor: number; // grams CO2 per km
  tankCapacity: number; // Liters or kWh
  currentFuelPercent?: number; // % remaining
}

export type OptimizationObjective = 'fastest' | 'cheapest' | 'shortest' | 'eco' | 'balanced';

export interface ObjectiveWeights {
  time: number;      // w_t
  cost: number;      // w_c
  distance: number;  // w_d
  emissions: number; // w_e
}

export interface RouteAlternative {
  id: string;
  name: string;
  summary: string;
  distanceKm: number;
  durationMin: number;
  freeFlowDurationMin: number;
  trafficDelayMin: number;
  trafficCongestion: 'low' | 'moderate' | 'heavy' | 'severe';
  fuelCostInr: number;
  energyUsedUnits: number; // Liters or kWh
  emissionsKg: number;
  tollCostInr: number;
  coordinates: [number, number][]; // [lat, lng] array for Leaflet
  instructions: RouteStepInstruction[];
  algorithmUsed: string;
  normalizedScore: number;
  isRecommended: boolean;
  recommendationReason: string;
  dataStatus: DataStatus;
  dataSource: string;
}

export interface RouteStepInstruction {
  id: string;
  text: string;
  distanceKm: number;
  durationMin: number;
  roadName?: string;
  trafficStatus?: 'free' | 'slow' | 'congested' | 'moderate';
}

export interface TrafficIncident {
  id: string;
  type: 'accident' | 'construction' | 'congestion' | 'closure' | 'hazard' | 'weather';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  location: LatLng;
  roadName: string;
  delaySeconds: number;
  lengthMeters: number;
  verified: boolean;
  startTime: string;
  endTime?: string;
  dataStatus: DataStatus;
}

export interface WeatherCondition {
  temperatureC: number;
  weatherCode: number;
  description: string;
  windSpeedKmh: number;
  precipitationMm: number;
  humidityPercent: number;
  visibilityKm: number;
  impactOnTraffic: 'none' | 'low' | 'moderate' | 'high';
  isLive: boolean;
}

export interface AlgorithmConvergenceStep {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  diversityMetric?: number; // for QIGA / GA exploration vs exploitation
  bestCostScore: number;
}

export interface AlgorithmResult {
  algorithmId: 'dijkstra' | 'astar' | 'genetic' | 'qiga';
  name: string;
  category: 'Classical Exact' | 'Heuristic' | 'Metaheuristic' | 'Quantum-Inspired Metaheuristic';
  executionTimeMs: number;
  bestScore: number;
  distanceKm: number;
  travelTimeMin: number;
  costInr: number;
  emissionsKg: number;
  iterations: number;
  feasible: boolean;
  convergence: AlgorithmConvergenceStep[];
  pathCoordinates: [number, number][];
  quantumAmplitudesSample?: { qubitIndex: number; alphaSq: number; betaSq: number; phaseTheta: number }[];
  explanation: string;
}

export interface FuelPriceQuote {
  fuelType: 'petrol' | 'diesel' | 'cng' | 'ev';
  priceInr: number;
  unit: string;
  city: string;
  provider: string;
  lastUpdated: string;
  isLive: boolean;
}

export interface SavedRouteItem {
  id: string;
  title: string;
  origin: LatLng;
  destination: LatLng;
  vehicleType: VehicleType;
  objective: OptimizationObjective;
  distanceKm: number;
  estDurationMin: number;
  estCostInr: number;
  savedAt: string;
  notes?: string;
}

export interface TrafficFlowSegment {
  id: string;
  currentSpeedKmh: number;
  freeFlowSpeedKmh: number;
  congestionPercent: number;
  coordinates: [number, number][];
  status: 'smooth' | 'moderate' | 'congested' | 'blocked';
}

export interface AirQualityData {
  usAqi: number;
  europeanAqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  healthRecommendation: string;
  isLive: boolean;
  timestamp: string;
}

export interface EVChargingStation {
  id: string;
  title: string;
  operator: string;
  address: string;
  lat: number;
  lng: number;
  powerKw: number;
  connectionType: 'CCS2' | 'Type 2' | 'GB/T' | 'CHAdeMO' | 'Fast DC';
  numberOfPoints: number;
  isOperational: boolean;
  distanceKm?: number;
  dataSource: 'OpenChargeMap API' | 'Verified National EV Registry';
}
