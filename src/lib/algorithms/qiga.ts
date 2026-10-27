import { RoadNetworkGraph } from './graph';
import { ObjectiveWeights, VehicleProfile, AlgorithmConvergenceStep } from '../types';
import { calculateConsumptionAndCost } from './vehicleModels';

export interface Qbit {
  alpha: number; // probability amplitude of |0>
  beta: number;  // probability amplitude of |1>
}

export interface QigaResult {
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
  quantumAmplitudesSample: {
    qubitIndex: number;
    alphaSq: number;
    betaSq: number;
    phaseTheta: number;
  }[];
}

export function runQIGA(
  graph: RoadNetworkGraph,
  originId: string,
  destinationId: string,
  vehicle: VehicleProfile,
  weights: ObjectiveWeights,
  options: {
    populationSize?: number;
    generations?: number;
    layerCount?: number;
    nodesPerLayer?: number;
    baseRotationAngle?: number;
  } = {}
): QigaResult {
  const startTime = performance.now();

  const popSize = options.populationSize || 20; // QIGA requires smaller population due to quantum superposition
  const maxGen = options.generations || 40;
  const layers = options.layerCount || 5;
  const perLayer = options.nodesPerLayer || 4; // 4 choices -> 2 qubits per layer
  const bitsPerLayer = 2; // 2 bits represent 0, 1, 2, 3
  const totalQubits = layers * bitsPerLayer;

  // Quantum chromosome: array of Qbits
  type QChromosome = Qbit[];

  // Initialize Quantum Population in equal superposition: alpha = 1/sqrt(2), beta = 1/sqrt(2)
  const invSqrt2 = 1 / Math.sqrt(2);
  let qPopulation: QChromosome[] = [];

  for (let i = 0; i < popSize; i++) {
    const qInd: QChromosome = [];
    for (let q = 0; q < totalQubits; q++) {
      // Add a slight micro-jitter to avoid symmetric stagnation
      const jitter = (Math.random() - 0.5) * 0.05;
      const alpha = Math.cos(Math.PI / 4 + jitter);
      const beta = Math.sin(Math.PI / 4 + jitter);
      qInd.push({ alpha, beta });
    }
    qPopulation.push(qInd);
  }

  // Measurement/Collapse helper: collapse Q-bits to classical bitstring
  const measureQChromosome = (qInd: QChromosome): number[] => {
    return qInd.map((qbit) => {
      const prob1 = qbit.beta * qbit.beta;
      return Math.random() < prob1 ? 1 : 0;
    });
  };

  // Decode classical bitstring into layer corridor choices
  const decodeBitstring = (bits: number[]): number[] => {
    const choices: number[] = [];
    for (let l = 0; l < layers; l++) {
      const b0 = bits[l * 2] ?? 0;
      const b1 = bits[l * 2 + 1] ?? 0;
      const choice = (b0 * 2 + b1) % perLayer;
      choices.push(choice);
    }
    return choices;
  };

  // Evaluate candidate route path
  const evaluateChoices = (choices: number[]): {
    score: number;
    distance: number;
    duration: number;
    cost: number;
    emissions: number;
    nodeIds: string[];
  } => {
    const nodeIds = [originId];
    for (let l = 1; l <= layers; l++) {
      const p = choices[l - 1] ?? 0;
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

  // Keep track of best solution
  let bestEverBits: number[] = measureQChromosome(qPopulation[0]);
  let bestEverEval = evaluateChoices(decodeBitstring(bestEverBits));
  const convergenceHistory: AlgorithmConvergenceStep[] = [];

  for (let gen = 1; gen <= maxGen; gen++) {
    // 1. Measure / Collapse all individuals in quantum population
    const collapsedSolutions = qPopulation.map((qInd) => {
      const bits = measureQChromosome(qInd);
      const choices = decodeBitstring(bits);
      const evalResult = evaluateChoices(choices);
      const fitness = 1000 / (1 + evalResult.score);
      return { bits, choices, evalResult, fitness };
    });

    // 2. Identify best solution in current generation
    collapsedSolutions.sort((a, b) => b.fitness - a.fitness);
    const genBest = collapsedSolutions[0];

    if (genBest.evalResult.score < bestEverEval.score) {
      bestEverEval = genBest.evalResult;
      bestEverBits = [...genBest.bits];
    }

    const avgFitness = collapsedSolutions.reduce((sum, s) => sum + s.fitness, 0) / popSize;

    // 3. Compute quantum entropy diversity metric across all qubits
    // H = -sum( |alpha|^2 * log2(|alpha|^2) + |beta|^2 * log2(|beta|^2) ) / totalQubits
    let totalEntropy = 0;
    for (const qInd of qPopulation) {
      for (const qbit of qInd) {
        const p0 = Math.max(1e-6, qbit.alpha * qbit.alpha);
        const p1 = Math.max(1e-6, qbit.beta * qbit.beta);
        const ent = -(p0 * Math.log2(p0) + p1 * Math.log2(p1));
        totalEntropy += ent;
      }
    }
    const avgEntropy = totalEntropy / (popSize * totalQubits);

    convergenceHistory.push({
      generation: gen,
      bestFitness: Number(genBest.fitness.toFixed(2)),
      avgFitness: Number(avgFitness.toFixed(2)),
      diversityMetric: Number(avgEntropy.toFixed(3)),
      bestCostScore: Number(bestEverEval.score.toFixed(4)),
    });

    // 4. Quantum Rotation Gate Update
    // Annealing rotation angle schedule: high exploration early, fine exploitation late
    const baseTheta = (options.baseRotationAngle || 0.035 * Math.PI) * (1 - (0.6 * gen) / maxGen);

    for (let i = 0; i < popSize; i++) {
      const qInd = qPopulation[i];
      const indBits = collapsedSolutions[i].bits;
      const indFitness = collapsedSolutions[i].fitness;
      const isFitterThanBest = indFitness > bestEverEval.score;

      for (let q = 0; q < totalQubits; q++) {
        const xi = indBits[q];
        const bi = bestEverBits[q];
        const alpha = qInd[q].alpha;
        const beta = qInd[q].beta;

        // Lookup table for quantum rotation direction and sign
        // Based on Han & Kim (2002) QIGA rotation gate design:
        let deltaTheta = 0;

        if (xi === 0 && bi === 1) {
          // Best solution has 1, current has 0 -> rotate toward 1
          if (alpha * beta > 0) deltaTheta = +baseTheta;
          else if (alpha * beta < 0) deltaTheta = -baseTheta;
          else deltaTheta = +baseTheta;
        } else if (xi === 1 && bi === 0) {
          // Best solution has 0, current has 1 -> rotate toward 0
          if (alpha * beta > 0) deltaTheta = -baseTheta;
          else if (alpha * beta < 0) deltaTheta = +baseTheta;
          else deltaTheta = -baseTheta;
        } else {
          // xi === bi: already aligned or exploring
          if (Math.random() < 0.05) {
            // Quantum phase perturbation (prevents premature entanglement/lock-in)
            deltaTheta = (Math.random() - 0.5) * 0.02 * Math.PI;
          }
        }

        // Apply 2x2 Unitary Rotation Matrix:
        // [alpha'] = [cos(theta) -sin(theta)] [alpha]
        // [beta' ]   [sin(theta)  cos(theta)] [beta ]
        const cosT = Math.cos(deltaTheta);
        const sinT = Math.sin(deltaTheta);
        let newAlpha = cosT * alpha - sinT * beta;
        let newBeta = sinT * alpha + cosT * beta;

        // Normalize state vector to maintain |alpha|^2 + |beta|^2 = 1
        const norm = Math.sqrt(newAlpha * newAlpha + newBeta * newBeta) || 1;
        newAlpha = newAlpha / norm;
        newBeta = newBeta / norm;

        qInd[q] = { alpha: newAlpha, beta: newBeta };
      }
    }
  }

  // Extract quantum amplitude sample from best individual for visualization in UI
  const bestInd = qPopulation[0];
  const amplitudesSample = bestInd.slice(0, 10).map((qbit, idx) => {
    const alphaSq = qbit.alpha * qbit.alpha;
    const betaSq = qbit.beta * qbit.beta;
    const phaseTheta = Math.atan2(qbit.beta, qbit.alpha);
    return {
      qubitIndex: idx + 1,
      alphaSq: Number(alphaSq.toFixed(3)),
      betaSq: Number(betaSq.toFixed(3)),
      phaseTheta: Number(phaseTheta.toFixed(3)),
    };
  });

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
    quantumAmplitudesSample: amplitudesSample,
  };
}
