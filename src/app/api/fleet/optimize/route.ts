import { NextRequest, NextResponse } from 'next/server';
import {
  PRESET_FLEET_PROBLEMS,
  generateFleetVrpProblem,
  solveVrpNearestNeighbor,
  solveVrpClarkeWright,
  solveVrpClassicalGa,
} from '@/lib/algorithms/fleetVrp';
import { solveFleetVrpQiga } from '@/lib/algorithms/qigaFleet';
import { generateFleetExplainabilityReport } from '@/lib/algorithms/fleetExplainability';
import { FleetVrpProblem, FleetVrpSolution } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      presetId = 'bengaluru-ecommerce',
      customProblem = null,
      stopCount = 20,
      vehicleCount = 4,
      objectiveWeights,
      algorithms = ['qiga-fleet', 'cga-fleet', 'clarke-wright', 'nearest-neighbor'],
    } = body;

    let problem: FleetVrpProblem;
    if (customProblem) {
      problem = customProblem;
    } else if (PRESET_FLEET_PROBLEMS[presetId]) {
      problem = JSON.parse(JSON.stringify(PRESET_FLEET_PROBLEMS[presetId]));
    } else {
      problem = generateFleetVrpProblem(stopCount, vehicleCount);
    }

    if (objectiveWeights) {
      problem.objectiveWeights = objectiveWeights;
    }

    const solutions: FleetVrpSolution[] = [];

    // Run requested algorithms on the exact same problem data
    if (algorithms.includes('qiga-fleet')) {
      solutions.push(solveFleetVrpQiga(problem));
    }
    if (algorithms.includes('cga-fleet')) {
      solutions.push(solveVrpClassicalGa(problem));
    }
    if (algorithms.includes('clarke-wright')) {
      solutions.push(solveVrpClarkeWright(problem));
    }
    if (algorithms.includes('nearest-neighbor')) {
      solutions.push(solveVrpNearestNeighbor(problem));
    }

    // Sort by best objective score (lower is better)
    solutions.sort((a, b) => a.objectiveScore - b.objectiveScore);
    const winningSolution = solutions[0];

    // Generate deterministic Explainable AI report
    const explanationReport = generateFleetExplainabilityReport(
      winningSolution,
      solutions,
      problem.objectiveWeights
    );

    return NextResponse.json({
      success: true,
      problem,
      solutions,
      winningSolution,
      explanationReport,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Fleet optimization error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to optimize fleet routes' },
      { status: 500 }
    );
  }
}
