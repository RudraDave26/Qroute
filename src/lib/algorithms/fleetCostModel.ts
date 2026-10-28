/**
 * Fleet Total Operating Cost (TCO) & Multi-Objective Pareto Engine
 * ===============================================================
 * 
 * MATHEMATICAL FORMULATION & COST ACCOUNTING:
 * -------------------------------------------
 * For commercial logistics and enterprise delivery fleets, minimizing purely distance (km)
 * or purely travel time (min) leads to suboptimal and expensive routing decisions.
 * 
 * QuantumRoute AI models the comprehensive Total Cost of Operation (TCO) across 4 core operational pillars:
 * 
 * 1. Fuel / Energy Expense:
 *    - ICE (Petrol/Diesel/CNG):
 *        Fuel_Liters = (Distance_km / Efficiency_km_per_L) + (Delay_Hours × Idle_Burn_Rate_L_per_hr)
 *        Fuel_Cost = Fuel_Liters × Fuel_Price_INR
 *    - Electric (EV):
 *        Energy_kWh = (Distance_km / Efficiency_km_per_kWh) + (Trip_Hours × Aux_AC_Draw_kW)
 *        Charging_Cost = Energy_kWh × Electricity_Tariff_INR
 * 
 * 2. Commercial Driver Labor Cost:
 *    - Total Time = Driving Travel Time + Customer Service Unloading Dwell Time
 *    - Driver_Cost = (Total_Minutes / 60) × Commercial_Hourly_Wage_INR (Default: ₹180 / hour)
 * 
 * 3. Vehicle Wear, Depreciation & Preventive Maintenance:
 *    - Maintenance_Cost = Distance_km × ₹3.50 / km (tyre degradation, oil, brakes, scheduled servicing)
 * 
 * 4. Toll Corridors & Road Tariffs:
 *    - Fixed national / municipal expressway toll tariffs encountered along highway sections.
 * 
 * 5. Constraint Penalties (Hard & Soft Violations):
 *    - Capacity Overload: ₹15 / kg excess payload
 *    - Delivery Deadline Lateness: ₹25 / minute past customer time window
 *    - Capability Incompatibility: ₹1,000 hard penalty (e.g. cold-chain goods in non-refrigerated van)
 *    - Shift Overtime: ₹50 / minute over max legal driver shift duration
 */

import {
  FleetVehicle,
  DeliveryStop,
  FleetVehicleTour,
  FleetConstraintViolation,
  FleetObjectiveWeights,
  VehicleType,
} from '../types';
import { DEFAULT_VEHICLE_PROFILES } from './vehicleModels';

export const FLEET_OBJECTIVE_PRESETS: Record<'cost' | 'speed' | 'eco' | 'balanced', FleetObjectiveWeights> = {
  cost: {
    costWeight: 0.65,
    timeWeight: 0.20,
    emissionsWeight: 0.15,
  },
  speed: {
    costWeight: 0.20,
    timeWeight: 0.65,
    emissionsWeight: 0.15,
  },
  eco: {
    costWeight: 0.20,
    timeWeight: 0.20,
    emissionsWeight: 0.60,
  },
  balanced: {
    costWeight: 0.34,
    timeWeight: 0.33,
    emissionsWeight: 0.33,
  },
};

/**
 * Calculates authentic fuel/energy consumption and tailpipe/grid carbon emissions
 */
export function calculateTourEnergyAndEmissions(
  vehicleType: VehicleType,
  distanceKm: number,
  trafficDelayMin: number = 0
): {
  energyUsedUnits: number; // Liters or kWh
  fuelCostInr: number;
  emissionsKg: number;
} {
  const profile = DEFAULT_VEHICLE_PROFILES[vehicleType] || DEFAULT_VEHICLE_PROFILES.petrol;
  const baseBurnUnits = distanceKm / Math.max(1, profile.efficiency);

  let extraDelayUnits = 0;
  if (vehicleType === 'petrol' || vehicleType === 'diesel') {
    // ICE engines burn ~1.1 Liters/hour while stuck idling in traffic
    extraDelayUnits = (trafficDelayMin / 60) * 1.1;
  } else if (vehicleType === 'cng') {
    // CNG idles at ~0.85 kg/hour
    extraDelayUnits = (trafficDelayMin / 60) * 0.85;
  } else if (vehicleType === 'ev') {
    // EV motor draws 0 kW while stopped, but cabin HVAC draws ~1.5 kW
    extraDelayUnits = (trafficDelayMin / 60) * 1.5;
  }

  const totalEnergyUnits = baseBurnUnits + extraDelayUnits;
  const fuelCostInr = totalEnergyUnits * profile.fuelPrice;
  const emissionsKg = (distanceKm * profile.emissionFactor) / 1000;

  return {
    energyUsedUnits: Number(totalEnergyUnits.toFixed(2)),
    fuelCostInr: Number(fuelCostInr.toFixed(2)),
    emissionsKg: Number(emissionsKg.toFixed(2)),
  };
}

/**
 * Evaluates a vehicle tour against all real-world fleet constraints:
 * - Vehicle payload capacity (kg)
 * - Vehicle capabilities matching delivery stop requirement (e.g. refrigerated)
 * - Customer time window earliest / latest arrival minutes
 * - Maximum driver shift duration (min)
 */
export function evaluateTourConstraints(
  vehicle: FleetVehicle,
  stops: DeliveryStop[],
  stopArrivalTimesMin: number[],
  totalDurationMin: number
): {
  violations: FleetConstraintViolation[];
  totalPayloadKg: number;
  totalPenaltyInr: number;
  isFeasible: boolean;
} {
  const violations: FleetConstraintViolation[] = [];
  let totalPenaltyInr = 0;

  // 1. Total payload check
  const totalPayloadKg = stops.reduce((sum, s) => sum + s.demandKg, 0);
  if (totalPayloadKg > vehicle.capacityKg) {
    const excess = totalPayloadKg - vehicle.capacityKg;
    const penalty = excess * 15; // ₹15 per kg overload
    totalPenaltyInr += penalty;
    violations.push({
      vehicleId: vehicle.id,
      type: 'capacity_exceeded',
      description: `${vehicle.name} payload ${totalPayloadKg} kg exceeds capacity ${vehicle.capacityKg} kg (+${excess} kg excess).`,
      magnitude: excess,
      penaltyCostInr: penalty,
    });
  }

  // 2. Capabilities matching (e.g. refrigerated requirements)
  for (const stop of stops) {
    if (stop.requiredCapability && stop.requiredCapability !== 'standard') {
      const hasCapability = vehicle.capabilities.includes(stop.requiredCapability);
      if (!hasCapability) {
        const penalty = 1000; // Hard violation penalty
        totalPenaltyInr += penalty;
        violations.push({
          vehicleId: vehicle.id,
          stopId: stop.id,
          type: 'capability_mismatch',
          description: `Stop '${stop.name}' requires '${stop.requiredCapability}' capability, but ${vehicle.name} lacks it.`,
          magnitude: 1,
          penaltyCostInr: penalty,
        });
      }
    }
  }

  // 3. Time window constraints
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const arrivalTime = stopArrivalTimesMin[i] || 0;

    if (arrivalTime > stop.latestArrivalMin) {
      const lateness = arrivalTime - stop.latestArrivalMin;
      const penalty = lateness * 25; // ₹25 per minute late
      totalPenaltyInr += penalty;
      violations.push({
        vehicleId: vehicle.id,
        stopId: stop.id,
        type: 'time_window_lateness',
        description: `Late arrival at '${stop.name}': arrived at ${Math.round(arrivalTime)} min, latest allowed was ${stop.latestArrivalMin} min (+${Math.round(lateness)} min late).`,
        magnitude: lateness,
        penaltyCostInr: penalty,
      });
    }
  }

  // 4. Maximum shift duration
  if (totalDurationMin > vehicle.maxShiftDurationMin) {
    const overtime = totalDurationMin - vehicle.maxShiftDurationMin;
    const penalty = overtime * 50; // ₹50 per minute overtime
    totalPenaltyInr += penalty;
    violations.push({
      vehicleId: vehicle.id,
      type: 'shift_overtime',
      description: `${vehicle.name} tour duration ${Math.round(totalDurationMin)} min exceeds driver maximum shift ${vehicle.maxShiftDurationMin} min.`,
      magnitude: overtime,
      penaltyCostInr: penalty,
    });
  }

  return {
    violations,
    totalPayloadKg,
    totalPenaltyInr,
    isFeasible: violations.length === 0,
  };
}

/**
 * Calculates composite multi-objective Pareto score across a fleet solution:
 * J(S) = w_cost * Cost'(S) + w_time * Time'(S) + w_emissions * Emissions'(S) + Penalty(S)
 * Lower score is better.
 */
export function calculateFleetObjectiveScore(
  totalCostInr: number,
  totalDurationMin: number,
  totalEmissionsKg: number,
  totalPenaltyInr: number,
  weights: FleetObjectiveWeights = FLEET_OBJECTIVE_PRESETS.balanced,
  baselineCost: number = 3000,
  baselineDuration: number = 360,
  baselineEmissions: number = 25
): number {
  // Normalize each dimension proportionally against realistic baseline scales
  const normCost = totalCostInr / Math.max(1, baselineCost);
  const normTime = totalDurationMin / Math.max(1, baselineDuration);
  const normEmissions = totalEmissionsKg / Math.max(1, baselineEmissions);

  const baseScore =
    weights.costWeight * normCost +
    weights.timeWeight * normTime +
    weights.emissionsWeight * normEmissions;

  // Penalties scale directly into objective score to reject infeasible solutions
  const penaltyScore = totalPenaltyInr / 500;

  return Number((baseScore + penaltyScore).toFixed(4));
}
