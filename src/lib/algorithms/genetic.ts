import { RoadNetworkGraph, GraphEdge } from './graph';
import { ObjectiveWeights, VehicleProfile, AlgorithmConvergenceStep } from '../types';
import { calculateConsumptionAndCost } from './vehicleModels';

export interface GAResult {
  pathNodeIds: string[];
  coordinates: [number, number][];
  totalDistanceKm: number;
  totalDurationMin: number;
  totalCostInr: number;
  totalEmissionsKg: number;
  objectiveScore: number;
  convergence: AlgorithmConvergenceStep[];
  generations: number;
  populationSize: number;
  executionTimeMs: number;
  feasible: boolean;
}

export function runGeneticAlgorithm(
  graph: RoadNetworkGraph,
  originId: string,
  destinationId: string,
  vehicle: VehicleProfile,
  weights: ObjectiveWeights,
  options: {
    populationSize?: number;
    generations?: number;
    crossoverRate?: number;
    mutationRate?: number;
    layerCount?: number;
    nodesPerLayer?: number;
  } = {}
): GAResult {
  const startTime = performance.now();

  const popSize = options.populationSize || 30;
  const maxGen = options.generations || 40;
  const pCrossover = options.crossoverRate || 0.85;
  const pMutation = options.mutationRate || 0.12;

  // Detect layer structure from graph
  const layers = options.layerCount || 5;
  const perLayer = options.nodesPerLayer || 4;

  // Chromosome is an array of integer choices [choice_1, choice_2, ..., choice_layers]
  type Chromosome = number[];

  // Helper to calculate raw cost of chromosome
  const evaluateChromosome = (chromo: Chromosome): {
    score: number;
    distance: number;
    duration: number;
    cost: number;
    emissions: number;
    nodeIds: string[];
  } => {
    const nodeIds = [originId];
    for (let l = 1; l <= layers; l++) {
      const p = chromo[l - 1] ?? 0;
      nodeIds.push(`N_${l}_${p}`);
    }
    nodeIds.push(destinationId);

    let totalDist = 0;
    let totalDur = 0;
    let totalToll = 0;

    for (let i = 0; i < nodeIds.length - 1; i++) {
      const u = nodeIds[i];
      const v = nodeIds[i + 1];
      const edges = graph.adjacency.get(u) || [];
      const edge = edges.find((e) => e.to === v);

      if (edge) {
        totalDist += edge.distanceKm;
        const effSpeed = Math.max(15, edge.freeFlowSpeedKmh / edge.congestionFactor);
        totalDur += (edge.distanceKm / effSpeed) * 60 + edge.incidentPenaltyMin;
        if (edge.isToll) totalToll += edge.tollFeeInr;
      } else {
        // Penalty for broken/unconnected segment
        totalDist += 12;
        totalDur += 25;
      }
    }

    const consumption = calculateConsumptionAndCost(totalDist, 0, vehicle);
    const costInr = consumption.totalCostInr + totalToll;
    const emissionsKg = consumption.emissionsKg;

    const compositeScore =
      weights.time * (totalDur / 10) +
      weights.cost * (costInr / 50) +
      weights.distance * (totalDist / 5) +
      weights.emissions * (emissionsKg / 2);

    return {
      score: compositeScore,
      distance: totalDist,
      duration: totalDur,
      cost: costInr,
      emissions: emissionsKg,
      nodeIds,
    };
  };

  // Initialize random population
  let population: Chromosome[] = [];
  for (let i = 0; i < popSize; i++) {
    const ind: Chromosome = [];
    for (let l = 0; l < layers; l++) {
      ind.push(Math.floor(Math.random() * perLayer));
    }
    population.push(ind);
  }

  let bestEverChromo: Chromosome = [...population[0]];
  let bestEverEval = evaluateChromosome(bestEverChromo);
  const convergenceHistory: AlgorithmConvergenceStep[] = [];

  for (let gen = 1; gen <= maxGen; gen++) {
    const evaluated = population.map((ind) => ({
      chromo: ind,
      eval: evaluateChromosome(ind),
      fitness: 1000 / (1 + evaluateChromosome(ind).score),
    }));

    // Find best in current generation
    evaluated.sort((a, b) => b.fitness - a.fitness);

    if (evaluated[0].eval.score < bestEverEval.score) {
      bestEverEval = evaluated[0].eval;
      bestEverChromo = [...evaluated[0].chromo];
    }

    const avgFitness = evaluated.reduce((sum, item) => sum + item.fitness, 0) / popSize;

    // Diversity metric: ratio of unique chromosomes
    const uniqueStrings = new Set(population.map((c) => c.join('-'))).size;
    const diversityMetric = Number((uniqueStrings / popSize).toFixed(3));

    convergenceHistory.push({
      generation: gen,
      bestFitness: Number(evaluated[0].fitness.toFixed(2)),
      avgFitness: Number(avgFitness.toFixed(2)),
      diversityMetric,
      bestCostScore: Number(bestEverEval.score.toFixed(4)),
    });

    // Selection & Next Generation
    const nextPop: Chromosome[] = [];
    // Elitism: preserve top 2
    nextPop.push([...evaluated[0].chromo]);
    if (popSize > 1) nextPop.push([...evaluated[1].chromo]);

    // Tournament selection
    const tournamentSelect = (): Chromosome => {
      const k = 3;
      let best = evaluated[Math.floor(Math.random() * popSize)];
      for (let t = 1; t < k; t++) {
        const candidate = evaluated[Math.floor(Math.random() * popSize)];
        if (candidate.fitness > best.fitness) {
          best = candidate;
        }
      }
      return [...best.chromo];
    };

    while (nextPop.length < popSize) {
      const p1 = tournamentSelect();
      const p2 = tournamentSelect();

      // Crossover
      let c1 = [...p1];
      let c2 = [...p2];
      if (Math.random() < pCrossover) {
        const point = 1 + Math.floor(Math.random() * (layers - 1));
        c1 = [...p1.slice(0, point), ...p2.slice(point)];
        c2 = [...p2.slice(0, point), ...p1.slice(point)];
      }

      // Mutation
      for (let l = 0; l < layers; l++) {
        if (Math.random() < pMutation) {
          c1[l] = Math.floor(Math.random() * perLayer);
        }
        if (Math.random() < pMutation) {
          c2[l] = Math.floor(Math.random() * perLayer);
        }
      }

      nextPop.push(c1);
      if (nextPop.length < popSize) nextPop.push(c2);
    }

    population = nextPop;
  }

  const coordinates: [number, number][] = bestEverEval.nodeIds.map((id) => {
    const n = graph.nodes.get(id);
    return n ? [n.lat, n.lng] : [0, 0];
  });

  const executionTimeMs = performance.now() - startTime;

  return {
    pathNodeIds: bestEverEval.nodeIds,
    coordinates,
    totalDistanceKm: Number(bestEverEval.distance.toFixed(2)),
    totalDurationMin: Number(bestEverEval.duration.toFixed(1)),
    totalCostInr: Number(bestEverEval.cost.toFixed(1)),
    totalEmissionsKg: Number(bestEverEval.emissions.toFixed(2)),
    objectiveScore: Number(bestEverEval.score.toFixed(4)),
    convergence: convergenceHistory,
    generations: maxGen,
    populationSize: popSize,
    executionTimeMs: Number(executionTimeMs.toFixed(2)),
    feasible: true,
  };
}
