import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DEFAULT_VEHICLE_PROFILES, calculateConsumptionAndCost } from '@/lib/algorithms/vehicleModels';
import { OBJECTIVE_PRESETS } from '@/lib/algorithms/costModel';
import { VehicleType, OptimizationObjective } from '@/lib/types';

const CompareSchema = z.object({
  distanceKm: z.number().positive(),
  trafficDelayMin: z.number().nonnegative().default(0),
  vehicles: z.array(z.enum(['petrol', 'diesel', 'cng', 'ev', 'motorcycle'])).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CompareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid comparison parameters' }, { status: 400 });
    }

    const { distanceKm, trafficDelayMin } = parsed.data;
    const vehicleKeys: VehicleType[] = ['petrol', 'diesel', 'cng', 'ev', 'motorcycle'];

    // Comparison 1: Fuel & Energy Cost across vehicles
    const vehicleComparison = vehicleKeys.map((type) => {
      const profile = DEFAULT_VEHICLE_PROFILES[type];
      const result = calculateConsumptionAndCost(distanceKm, trafficDelayMin, profile);
      return {
        vehicleType: type,
        name: profile.name,
        energyUnits: result.energyUsedUnits,
        unitLabel: profile.efficiencyUnit,
        costInr: result.totalCostInr,
        emissionsKg: result.emissionsKg,
        savingsVsPetrolInr: Number(
          (calculateConsumptionAndCost(distanceKm, trafficDelayMin, DEFAULT_VEHICLE_PROFILES.petrol).totalCostInr - result.totalCostInr).toFixed(1)
        ),
      };
    });

    // Comparison 2: Objective Weights distribution
    const objectives: OptimizationObjective[] = ['fastest', 'cheapest', 'shortest', 'eco', 'balanced'];
    const objectiveComparison = objectives.map((obj) => ({
      objective: obj,
      weights: OBJECTIVE_PRESETS[obj],
      description: getObjectiveDescription(obj),
    }));

    return NextResponse.json({
      distanceKm,
      trafficDelayMin,
      vehicleComparison,
      objectiveComparison,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to compute comparison', message: err.message }, { status: 500 });
  }
}

function getObjectiveDescription(obj: OptimizationObjective): string {
  switch (obj) {
    case 'fastest':
      return 'Prioritizes minimal travel time and high-speed bypass corridors';
    case 'cheapest':
      return 'Minimizes fuel/power burn and avoids expensive toll expressways';
    case 'shortest':
      return 'Selects the minimal physical kilometer path regardless of traffic';
    case 'eco':
      return 'Minimizes tailpipe and upstream CO2 emissions by optimizing speed band';
    case 'balanced':
      return 'Pareto-optimal multi-objective balance across time, cost, distance, and CO2';
  }
}
