import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildRoadNetwork } from '@/lib/algorithms/graph';
import { runDijkstra } from '@/lib/algorithms/dijkstra';
import { runAStar } from '@/lib/algorithms/astar';
import { runGeneticAlgorithm } from '@/lib/algorithms/genetic';
import { runQIGA } from '@/lib/algorithms/qiga';
import { DEFAULT_VEHICLE_PROFILES } from '@/lib/algorithms/vehicleModels';
import { OBJECTIVE_PRESETS } from '@/lib/algorithms/costModel';
import { AlgorithmResult, VehicleType, OptimizationObjective } from '@/lib/types';

const OptimizationRunSchema = z.object({
  origin: z.object({
    lat: z.number(),
    lng: z.number(),
    label: z.string().optional(),
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
    label: z.string().optional(),
  }),
  vehicleType: z.enum(['petrol', 'diesel', 'cng', 'ev', 'motorcycle', 'custom']).default('petrol'),
  objective: z.enum(['fastest', 'cheapest', 'shortest', 'eco', 'balanced']).default('balanced'),
  parameters: z.object({
    populationSize: z.number().min(10).max(100).default(30),
    generations: z.number().min(10).max(100).default(40),
    crossoverRate: z.number().min(0.1).max(1.0).default(0.85),
    mutationRate: z.number().min(0.01).max(0.5).default(0.12),
    gridDensity: z.number().min(3).max(8).default(5),
  }).default({}),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = OptimizationRunSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { origin, destination, vehicleType, objective, parameters } = parsed.data;

    const vehicle = DEFAULT_VEHICLE_PROFILES[vehicleType as VehicleType] || DEFAULT_VEHICLE_PROFILES.petrol;
    const weights = OBJECTIVE_PRESETS[objective as OptimizationObjective];

    // Build the identical road network graph used by all 4 algorithms
    const graph = buildRoadNetwork(origin, destination, parameters.gridDensity, 0.42);

    // 1. Dijkstra (Exact Shortest Baseline)
    const dijkstraRes = runDijkstra(graph, 'origin', 'destination', vehicle, weights);

    // 2. A* (Heuristic Baseline)
    const astarRes = runAStar(graph, 'origin', 'destination', vehicle, weights);

    // 3. Genetic Algorithm (Classical Metaheuristic)
    const gaRes = runGeneticAlgorithm(graph, 'origin', 'destination', vehicle, weights, {
      populationSize: parameters.populationSize,
      generations: parameters.generations,
      crossoverRate: parameters.crossoverRate,
      mutationRate: parameters.mutationRate,
      layerCount: parameters.gridDensity,
      nodesPerLayer: 4,
    });

    // 4. Quantum-Inspired Genetic Algorithm (QIGA Signature Feature)
    // QIGA utilizes qubit population representation: smaller population size achieves equivalent or superior exploration
    const qigaPop = Math.max(12, Math.round(parameters.populationSize * 0.65));
    const qigaRes = runQIGA(graph, 'origin', 'destination', vehicle, weights, {
      populationSize: qigaPop,
      generations: parameters.generations,
      layerCount: parameters.gridDensity,
      nodesPerLayer: 4,
    });

    // Assemble comprehensive comparison results
    const results: AlgorithmResult[] = [
      {
        algorithmId: 'dijkstra',
        name: "Dijkstra's Algorithm",
        category: 'Classical Exact',
        executionTimeMs: dijkstraRes.executionTimeMs,
        bestScore: dijkstraRes.objectiveScore,
        distanceKm: dijkstraRes.totalDistanceKm,
        travelTimeMin: dijkstraRes.totalDurationMin,
        costInr: dijkstraRes.totalCostInr,
        emissionsKg: dijkstraRes.totalEmissionsKg,
        iterations: dijkstraRes.visitedNodesCount,
        feasible: true,
        convergence: [
          { generation: 1, bestFitness: 1000 / (1 + dijkstraRes.objectiveScore), avgFitness: 1000 / (1 + dijkstraRes.objectiveScore), bestCostScore: dijkstraRes.objectiveScore },
          { generation: parameters.generations, bestFitness: 1000 / (1 + dijkstraRes.objectiveScore), avgFitness: 1000 / (1 + dijkstraRes.objectiveScore), bestCostScore: dijkstraRes.objectiveScore },
        ],
        pathCoordinates: dijkstraRes.coordinates,
        explanation: 'Deterministic exhaustive search finding the mathematically exact shortest path on the discretized state graph.',
      },
      {
        algorithmId: 'astar',
        name: 'A* Heuristic Search',
        category: 'Heuristic',
        executionTimeMs: astarRes.executionTimeMs,
        bestScore: astarRes.objectiveScore,
        distanceKm: astarRes.totalDistanceKm,
        travelTimeMin: astarRes.totalDurationMin,
        costInr: astarRes.totalCostInr,
        emissionsKg: astarRes.totalEmissionsKg,
        iterations: astarRes.visitedNodesCount,
        feasible: true,
        convergence: [
          { generation: 1, bestFitness: 1000 / (1 + astarRes.objectiveScore), avgFitness: 1000 / (1 + astarRes.objectiveScore), bestCostScore: astarRes.objectiveScore },
          { generation: parameters.generations, bestFitness: 1000 / (1 + astarRes.objectiveScore), avgFitness: 1000 / (1 + astarRes.objectiveScore), bestCostScore: astarRes.objectiveScore },
        ],
        pathCoordinates: astarRes.coordinates,
        explanation: 'Guided search using Haversine distance as an admissible heuristic to prune unpromising graph nodes.',
      },
      {
        algorithmId: 'genetic',
        name: 'Classical Genetic Algorithm (GA)',
        category: 'Metaheuristic',
        executionTimeMs: gaRes.executionTimeMs,
        bestScore: gaRes.objectiveScore,
        distanceKm: gaRes.totalDistanceKm,
        travelTimeMin: gaRes.totalDurationMin,
        costInr: gaRes.totalCostInr,
        emissionsKg: gaRes.totalEmissionsKg,
        iterations: gaRes.generations,
        feasible: gaRes.feasible,
        convergence: gaRes.convergence,
        pathCoordinates: gaRes.coordinates,
        explanation: 'Population-based search operating via tournament selection, 2-point crossover, bit mutation, and elitism.',
      },
      {
        algorithmId: 'qiga',
        name: 'Quantum-Inspired Genetic Algorithm (QIGA)',
        category: 'Quantum-Inspired Metaheuristic',
        executionTimeMs: qigaRes.executionTimeMs,
        bestScore: qigaRes.objectiveScore,
        distanceKm: qigaRes.totalDistanceKm,
        travelTimeMin: qigaRes.totalDurationMin,
        costInr: qigaRes.totalCostInr,
        emissionsKg: qigaRes.totalEmissionsKg,
        iterations: qigaRes.generations,
        feasible: qigaRes.feasible,
        convergence: qigaRes.convergence,
        pathCoordinates: qigaRes.coordinates,
        quantumAmplitudesSample: qigaRes.quantumAmplitudesSample,
        explanation: 'Quantum-inspired metaheuristic using Q-bit probability amplitudes [α, β] in superposition, guided by unitary quantum rotation gates U(Δθ).',
      },
    ];

    return NextResponse.json({
      status: 'completed',
      timestamp: new Date().toISOString(),
      origin,
      destination,
      vehicle,
      objective,
      weights,
      parameters,
      results,
    });
  } catch (err: any) {
    console.error('Error running optimization comparison:', err);
    return NextResponse.json({ error: 'Optimization execution failed', message: err.message }, { status: 500 });
  }
}
