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

export type PlaceCategory = 'hotel' | 'park' | 'cafe' | 'rest_stop';

export interface IntermediatePlace {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  address?: string;
  rating?: number; // e.g. 4.6
  distanceFromRouteKm?: number; // perpendicular distance off route corridor
  amenities?: string[];
  description?: string;
  isVerified?: boolean;
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

// =========================================================================
// FLEET & MULTI-VEHICLE CAPACITATED ROUTING (MC-VRPTW-P) TYPES
// =========================================================================

export type VehicleCapability = 'standard' | 'refrigerated' | 'express' | 'heavy';

export interface FleetVehicle {
  id: string;
  name: string;
  type: VehicleType; // 'ev' | 'petrol' | 'diesel' | 'cng'
  capacityKg: number; // e.g. 500, 800, 1200
  capabilities: VehicleCapability[]; // e.g. ['standard', 'refrigerated']
  driverHourlyWageInr: number; // e.g. ₹180 / hr
  maintenanceCostPerKmInr: number; // e.g. ₹3.50 / km
  startLocation: LatLng; // Starting depot
  endLocation?: LatLng; // Optional return depot (defaults to startLocation)
  maxShiftDurationMin: number; // e.g. 480 min (8 hours)
  colorHex?: string;
  isActive: boolean;
  isAvailable: boolean;
}

export interface DeliveryStop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  demandKg: number; // weight or parcel count
  requiredCapability?: VehicleCapability; // e.g. 'refrigerated' for cold-chain medicines/groceries
  earliestArrivalMin: number; // e.g. 60 (01:00 hour from shift start)
  latestArrivalMin: number; // e.g. 180 (03:00 hours from shift start)
  serviceDurationMin: number; // e.g. 8 min unloading time
  priority: 'normal' | 'urgent' | 'express';
  isDelivered?: boolean;
}

export interface FleetConstraintViolation {
  vehicleId: string;
  stopId?: string;
  type: 'capacity_exceeded' | 'time_window_lateness' | 'capability_mismatch' | 'shift_overtime';
  description: string;
  magnitude: number; // e.g. 45 kg over, or 22 min late
  penaltyCostInr: number;
}

export interface FleetVehicleTour {
  vehicleId: string;
  vehicleName: string;
  vehicleType: VehicleType;
  stops: DeliveryStop[];
  totalDistanceKm: number;
  totalDurationMin: number;
  travelTimeMin: number;
  serviceTimeMin: number;
  fuelCostInr: number;
  energyUsedUnits: number; // Liters or kWh
  emissionsKg: number;
  driverCostInr: number;
  maintenanceCostInr: number;
  tollCostInr: number;
  operatingCostInr: number; // sum of fuel + driver + maintenance + tolls
  totalPayloadKg: number;
  capacityUtilizationPercent: number;
  pathCoordinates: [number, number][]; // Full driving geometry
  violations: FleetConstraintViolation[];
  isFeasible: boolean;
}

export interface FleetVrpProblem {
  id: string;
  title: string;
  depot: LatLng;
  vehicles: FleetVehicle[];
  stops: DeliveryStop[];
  timeHorizonMin: number; // e.g. 480 min
  objectiveWeights: FleetObjectiveWeights;
}

export interface FleetObjectiveWeights {
  costWeight: number; // w_c ∈ [0, 1]
  timeWeight: number; // w_t ∈ [0, 1]
  emissionsWeight: number; // w_e ∈ [0, 1]
}

export interface FleetVrpSolution {
  problemId: string;
  algorithmId: 'qiga-fleet' | 'cga-fleet' | 'clarke-wright' | 'nearest-neighbor';
  algorithmName: string;
  tours: FleetVehicleTour[];
  totalOperatingCostInr: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  totalEmissionsKg: number;
  totalPayloadDeliveredKg: number;
  unassignedStops: DeliveryStop[];
  violations: FleetConstraintViolation[];
  isFeasible: boolean;
  executionTimeMs: number;
  objectiveScore: number;
  convergenceTrajectory?: { generation: number; bestScore: number; avgScore: number; diversity: number }[];
  explanationSummary?: string;
}

export type DynamicEventType = 'vehicle_breakdown' | 'rush_order_injection' | 'traffic_gridlock';

export interface DynamicReoptEvent {
  id: string;
  type: DynamicEventType;
  timestampMin: number;
  targetVehicleId?: string;
  newStops?: DeliveryStop[];
  delayMinutes?: number;
  corridorDescription?: string;
}

export interface DynamicReoptResult {
  event: DynamicReoptEvent;
  priorSolution: FleetVrpSolution;
  reoptimizedSolution: FleetVrpSolution;
  computeTimeMs: number;
  costDeltaInr: number;
  durationDeltaMin: number;
  emissionsDeltaKg: number;
  affectedVehicleIds: string[];
  reassignedStopIds: string[];
  explanation: string;
}

export interface FleetBenchmarkRun {
  runIndex: number;
  algorithmId: string;
  executionTimeMs: number;
  totalOperatingCostInr: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  totalEmissionsKg: number;
  isFeasible: boolean;
  objectiveScore: number;
}

export interface FleetExplainabilityReport {
  selectedAlgorithm: string;
  primarySelectionReason: string;
  costBreakdownExplanation: string;
  multiObjectiveTradeoffExplanation: string;
  constraintSatisfactionProof: string;
  alternativeComparisons: {
    comparisonAlgorithm: string;
    costDifferenceInr: number;
    timeDifferenceMin: number;
    emissionsDifferenceKg: number;
    advantageExplanation: string;
  }[];
}
