import { VehicleProfile, VehicleType } from '../types';

export const DEFAULT_VEHICLE_PROFILES: Record<VehicleType, VehicleProfile> = {
  petrol: {
    type: 'petrol',
    name: 'Midsize Petrol Car',
    efficiency: 14.5, // km / Liter
    efficiencyUnit: 'km/L',
    fuelPrice: 105.0, // INR / Liter
    emissionFactor: 160, // g CO2 / km (tailpipe)
    tankCapacity: 45, // Liters
  },
  diesel: {
    type: 'diesel',
    name: 'Diesel Sedan / SUV',
    efficiency: 18.2, // km / Liter
    efficiencyUnit: 'km/L',
    fuelPrice: 92.0, // INR / Liter
    emissionFactor: 172, // g CO2 / km (tailpipe)
    tankCapacity: 50, // Liters
  },
  cng: {
    type: 'cng',
    name: 'CNG Hatchback / Sedan',
    efficiency: 22.0, // km / kg
    efficiencyUnit: 'km/kg',
    fuelPrice: 80.0, // INR / kg
    emissionFactor: 120, // g CO2 / km
    tankCapacity: 12, // kg
  },
  ev: {
    type: 'ev',
    name: 'Electric Vehicle (EV)',
    efficiency: 7.2, // km / kWh
    efficiencyUnit: 'km/kWh',
    fuelPrice: 8.0, // INR / kWh (Domestic/Commercial average charging tariff)
    emissionFactor: 52, // g CO2 / km (India average grid mix upstream emissions; 0 g tailpipe)
    tankCapacity: 40.5, // kWh battery pack
  },
  motorcycle: {
    type: 'motorcycle',
    name: '150cc Commuter Motorcycle',
    efficiency: 45.0, // km / Liter
    efficiencyUnit: 'km/L',
    fuelPrice: 105.0, // INR / Liter
    emissionFactor: 68, // g CO2 / km
    tankCapacity: 13, // Liters
  },
  custom: {
    type: 'custom',
    name: 'Custom Vehicle Profile',
    efficiency: 15.0,
    efficiencyUnit: 'km/unit',
    fuelPrice: 100.0,
    emissionFactor: 150,
    tankCapacity: 45,
  },
};

/**
 * Calculates estimated fuel or energy consumption based on distance, traffic delay, and vehicle characteristics
 */
export function calculateConsumptionAndCost(
  distanceKm: number,
  trafficDelayMin: number,
  profile: VehicleProfile
): {
  energyUsedUnits: number;
  totalCostInr: number;
  emissionsKg: number;
  congestionPenaltyPct: number;
} {
  // Congestion degradation factor: stop-and-go idling penalty
  // ICE vehicles consume ~0.8-1.5 L/hr of idle fuel during delays
  // EVs consume ~1.0-2.0 kW for HVAC & electronics during delays
  let delayPenaltyFactor = 1.0;
  if (trafficDelayMin > 0) {
    if (profile.type === 'ev') {
      // EV HVAC/idling overhead
      const idleKwh = (trafficDelayMin / 60) * 1.5;
      const baseUnits = distanceKm / profile.efficiency;
      const totalUnits = baseUnits + idleKwh;
      const totalCost = totalUnits * profile.fuelPrice;
      const emissionsKg = (distanceKm * profile.emissionFactor) / 1000;
      return {
        energyUsedUnits: Number(totalUnits.toFixed(2)),
        totalCostInr: Number(totalCost.toFixed(1)),
        emissionsKg: Number(emissionsKg.toFixed(2)),
        congestionPenaltyPct: Number(((idleKwh / (baseUnits || 1)) * 100).toFixed(1)),
      };
    } else {
      // ICE Idle burn ~1.0 L/hr during standstill
      const idleLiters = (trafficDelayMin / 60) * 1.1;
      const baseUnits = distanceKm / profile.efficiency;
      const totalUnits = baseUnits + idleLiters;
      const totalCost = totalUnits * profile.fuelPrice;
      const emissionsKg = (totalUnits * (profile.emissionFactor * (profile.efficiency / 1000)));
      return {
        energyUsedUnits: Number(totalUnits.toFixed(2)),
        totalCostInr: Number(totalCost.toFixed(1)),
        emissionsKg: Number((emissionsKg || (distanceKm * profile.emissionFactor) / 1000).toFixed(2)),
        congestionPenaltyPct: Number(((idleLiters / (baseUnits || 1)) * 100).toFixed(1)),
      };
    }
  }

  const energyUsedUnits = distanceKm / Math.max(1, profile.efficiency);
  const totalCostInr = energyUsedUnits * profile.fuelPrice;
  const emissionsKg = (distanceKm * profile.emissionFactor) / 1000;

  return {
    energyUsedUnits: Number(energyUsedUnits.toFixed(2)),
    totalCostInr: Number(totalCostInr.toFixed(1)),
    emissionsKg: Number(emissionsKg.toFixed(2)),
    congestionPenaltyPct: 0,
  };
}
