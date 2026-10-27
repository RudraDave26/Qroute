/**
 * Multi-Objective Cost Model for Intelligent Urban Routing
 * ========================================================
 * 
 * MATHEMATICAL FORMULATION:
 * -------------------------
 * In urban transportation, selecting the optimal route is rarely a single-objective problem:
 * motorists care about arriving quickly (travel time), spending less (fuel/toll costs),
 * reducing vehicle wear (distance), and minimizing their environmental footprint (CO2 emissions).
 * 
 * The composite objective function J(r) evaluates candidate route 'r' as:
 *     J(r) = w_t · T'(r) + w_c · C'(r) + w_d · D'(r) + w_e · E'(r)
 * 
 * where:
 *   - w_t, w_c, w_d, w_e ∈ [0, 1] are user-configured or preset objective weights satisfying:
 *         w_t + w_c + w_d + w_e = 1.0
 *   - T'(r), C'(r), D'(r), E'(r) are min-max normalized metrics in [0, 1].
 * 
 * WHY MIN-MAX NORMALIZATION IS ESSENTIAL:
 * ---------------------------------------
 * Raw values have vastly different physical units and magnitudes (e.g., travel time = 45 min,
 * fuel cost = ₹280, distance = 25 km, emissions = 4.2 kg CO₂).
 * Without normalization, higher-magnitude numbers (such as monetary costs in hundreds of Rupees)
 * would dominate the objective score, completely drowning out emissions or distance.
 * 
 * Min-Max normalization scales each dimension proportionally:
 *     X'(r) = (X(r) - X_min) / (X_max - X_min)
 * Lower J(r) values denote superior (closer to Pareto-optimal) route choices.
 */

import { ObjectiveWeights, OptimizationObjective } from '../types';

export const OBJECTIVE_PRESETS: Record<OptimizationObjective, ObjectiveWeights> = {
  fastest: {
    time: 0.70,
    cost: 0.10,
    distance: 0.10,
    emissions: 0.10,
  },
  cheapest: {
    time: 0.15,
    cost: 0.65,
    distance: 0.10,
    emissions: 0.10,
  },
  shortest: {
    time: 0.10,
    cost: 0.10,
    distance: 0.70,
    emissions: 0.10,
  },
  eco: {
    time: 0.15,
    cost: 0.15,
    distance: 0.10,
    emissions: 0.60,
  },
  balanced: {
    time: 0.25,
    cost: 0.25,
    distance: 0.25,
    emissions: 0.25,
  },
};

export interface RouteRawMetrics {
  durationMin: number;
  costInr: number;
  distanceKm: number;
  emissionsKg: number;
}

/**
 * Normalizes metrics across candidate routes and calculates composite multi-objective score J(r)
 * J(r) = w_t * T(r) + w_c * C(r) + w_d * D(r) + w_e * E(r)
 * Lower J(r) is better.
 */
export function calculateMultiObjectiveScore(
  metrics: RouteRawMetrics,
  bounds: {
    minDuration: number;
    maxDuration: number;
    minCost: number;
    maxCost: number;
    minDistance: number;
    maxDistance: number;
    minEmissions: number;
    maxEmissions: number;
  },
  weights: ObjectiveWeights
): {
  normalizedScore: number;
  breakdown: {
    timeCost: number;
    financialCost: number;
    distanceCost: number;
    emissionsCost: number;
  };
} {
  const norm = (val: number, min: number, max: number): number => {
    if (max <= min) return 0.5;
    return Math.max(0, Math.min(1, (val - min) / (max - min)));
  };

  const tNorm = norm(metrics.durationMin, bounds.minDuration, bounds.maxDuration);
  const cNorm = norm(metrics.costInr, bounds.minCost, bounds.maxCost);
  const dNorm = norm(metrics.distanceKm, bounds.minDistance, bounds.maxDistance);
  const eNorm = norm(metrics.emissionsKg, bounds.minEmissions, bounds.maxEmissions);

  // Normalize weights sum to 1.0 to guarantee stability
  const totalW = weights.time + weights.cost + weights.distance + weights.emissions || 1.0;
  const wt = weights.time / totalW;
  const wc = weights.cost / totalW;
  const wd = weights.distance / totalW;
  const we = weights.emissions / totalW;

  const timeCost = wt * tNorm;
  const financialCost = wc * cNorm;
  const distanceCost = wd * dNorm;
  const emissionsCost = we * eNorm;

  const J = timeCost + financialCost + distanceCost + emissionsCost;

  return {
    normalizedScore: Number(J.toFixed(4)),
    breakdown: {
      timeCost: Number(timeCost.toFixed(4)),
      financialCost: Number(financialCost.toFixed(4)),
      distanceCost: Number(distanceCost.toFixed(4)),
      emissionsCost: Number(emissionsCost.toFixed(4)),
    },
  };
}
