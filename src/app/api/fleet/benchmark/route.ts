import { NextRequest, NextResponse } from 'next/server';
import {
  generateFleetVrpProblem,
  solveVrpNearestNeighbor,
  solveVrpClarkeWright,
  solveVrpClassicalGa,
} from '@/lib/algorithms/fleetVrp';
import { solveFleetVrpQiga } from '@/lib/algorithms/qigaFleet';
import { FleetBenchmarkRun } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      stopCount = 20,
      vehicleCount = 4,
      repeatRuns = 3, // Monte Carlo repeats
      algorithms = ['qiga-fleet', 'cga-fleet', 'clarke-wright', 'nearest-neighbor'],
    } = body;

    const problem = generateFleetVrpProblem(stopCount, vehicleCount);
    const benchmarkRuns: FleetBenchmarkRun[] = [];

    for (let r = 0; r < repeatRuns; r++) {
      if (algorithms.includes('qiga-fleet')) {
        const sol = solveFleetVrpQiga(problem);
        benchmarkRuns.push({
          runIndex: r + 1,
          algorithmId: 'qiga-fleet',
          executionTimeMs: sol.executionTimeMs,
          totalOperatingCostInr: sol.totalOperatingCostInr,
          totalDistanceKm: sol.totalDistanceKm,
          totalDurationMin: sol.totalDurationMin,
          totalEmissionsKg: sol.totalEmissionsKg,
          isFeasible: sol.isFeasible,
          objectiveScore: sol.objectiveScore,
        });
      }

      if (algorithms.includes('cga-fleet')) {
        const sol = solveVrpClassicalGa(problem, 24, 30);
        benchmarkRuns.push({
          runIndex: r + 1,
          algorithmId: 'cga-fleet',
          executionTimeMs: sol.executionTimeMs,
          totalOperatingCostInr: sol.totalOperatingCostInr,
          totalDistanceKm: sol.totalDistanceKm,
          totalDurationMin: sol.totalDurationMin,
          totalEmissionsKg: sol.totalEmissionsKg,
          isFeasible: sol.isFeasible,
          objectiveScore: sol.objectiveScore,
        });
      }

      if (algorithms.includes('clarke-wright')) {
        const sol = solveVrpClarkeWright(problem);
        benchmarkRuns.push({
          runIndex: r + 1,
          algorithmId: 'clarke-wright',
          executionTimeMs: sol.executionTimeMs,
          totalOperatingCostInr: sol.totalOperatingCostInr,
          totalDistanceKm: sol.totalDistanceKm,
          totalDurationMin: sol.totalDurationMin,
          totalEmissionsKg: sol.totalEmissionsKg,
          isFeasible: sol.isFeasible,
          objectiveScore: sol.objectiveScore,
        });
      }

      if (algorithms.includes('nearest-neighbor')) {
        const sol = solveVrpNearestNeighbor(problem);
        benchmarkRuns.push({
          runIndex: r + 1,
          algorithmId: 'nearest-neighbor',
          executionTimeMs: sol.executionTimeMs,
          totalOperatingCostInr: sol.totalOperatingCostInr,
          totalDistanceKm: sol.totalDistanceKm,
          totalDurationMin: sol.totalDurationMin,
          totalEmissionsKg: sol.totalEmissionsKg,
          isFeasible: sol.isFeasible,
          objectiveScore: sol.objectiveScore,
        });
      }
    }

    // Statistical aggregation per algorithm
    const stats: Record<string, any> = {};
    for (const alg of algorithms) {
      const runs = benchmarkRuns.filter((b) => b.algorithmId === alg);
      if (runs.length === 0) continue;

      const meanTime = runs.reduce((s, r) => s + r.executionTimeMs, 0) / runs.length;
      const meanCost = runs.reduce((s, r) => s + r.totalOperatingCostInr, 0) / runs.length;
      const meanDistance = runs.reduce((s, r) => s + r.totalDistanceKm, 0) / runs.length;
      const meanEmissions = runs.reduce((s, r) => s + r.totalEmissionsKg, 0) / runs.length;
      const feasibleCount = runs.filter((r) => r.isFeasible).length;

      // Variance & StdDev
      const varianceTime = runs.reduce((s, r) => s + Math.pow(r.executionTimeMs - meanTime, 2), 0) / runs.length;
      const stdDevTime = Math.sqrt(varianceTime);

      stats[alg] = {
        runsCount: runs.length,
        meanTimeMs: Number(meanTime.toFixed(1)),
        stdDevTimeMs: Number(stdDevTime.toFixed(1)),
        meanCostInr: Number(meanCost.toFixed(2)),
        meanDistanceKm: Number(meanDistance.toFixed(2)),
        meanEmissionsKg: Number(meanEmissions.toFixed(2)),
        feasibilityRate: Number(((feasibleCount / runs.length) * 100).toFixed(0)),
      };
    }

    return NextResponse.json({
      success: true,
      stopCount,
      vehicleCount,
      repeatRuns,
      benchmarkRuns,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Fleet benchmark error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to run fleet benchmark' },
      { status: 500 }
    );
  }
}
