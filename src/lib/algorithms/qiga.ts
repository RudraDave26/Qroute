/**
 * Quantum-Inspired Genetic Algorithm (QIGA) for Traffic Route Optimization
 * =========================================================================
 * 
 * ACADEMIC BACKGROUND & CONCEPTUAL FOUNDATIONS:
 * ---------------------------------------------
 * Classical Genetic Algorithms (GAs) encode candidate solutions as static bitstrings (0 or 1).
 * In contrast, QIGA (Han & Kim, 2002) uses the probabilistic concepts of Quantum Computing
 * (qubits, superposition, and quantum rotation gates) on classical computers.
 * 
 * 1. Quantum Bit (Q-bit) Representation:
 *    A qubit state |ψ⟩ is represented as a linear combination (superposition) of basis states |0⟩ and |1⟩:
 *        |ψ⟩ = α|0⟩ + β|1⟩
 *    where α and β are probability amplitudes (complex or real numbers) satisfying the normalization law:
 *        |α|² + |β|² = 1
 *    Here:
 *        |α|² represents the probability of collapsing to state '0'.
 *        |β|² represents the probability of collapsing to state '1'.
 * 
 * 2. Why QIGA Converges Faster with Smaller Populations:
 *    Because a single Q-bit chromosome with M qubits implicitly represents 2^M states simultaneously
 *    in superposition, QIGA explores the solution space far more broadly with a smaller population
 *    (e.g., 20 individuals instead of 100+ required by classical GA), preventing premature convergence.
 * 
 * 3. Quantum Rotation Gate Update:
 *    Instead of classical crossover and mutation alone, QIGA updates qubit amplitudes toward the best solution
 *    using a 2x2 unitary quantum rotation matrix:
 *        [ α' ]   [ cos(Δθ)  -sin(Δθ) ] [ α ]
 *        [ β' ] = [ sin(Δθ)   cos(Δθ) ] [ β ]
 *    The magnitude and sign of the rotation angle Δθ are determined using an lookup schedule
 *    designed to guide the state vector toward the current global optimum.
 */

import { RoadNetworkGraph } from './graph';
import { ObjectiveWeights, VehicleProfile, AlgorithmConvergenceStep } from '../types';
import { calculateConsumptionAndCost } from './vehicleModels';

/**
 * A Quantum Bit (Q-bit) represented by real probability amplitudes α and β.
 */
export interface Qbit {
  alpha: number; // Amplitude for state |0>, where |alpha|^2 is probability of observing 0
  beta: number;  // Amplitude for state |1>, where |beta|^2 is probability of observing 1
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

/**
 * Executes the Quantum-Inspired Genetic Algorithm over the discretized road network graph.
 */
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

  // Population & chromosome parameters
  const popSize = options.populationSize || 20; // Superposition allows smaller populations
  const maxGen = options.generations || 40;     // Number of evolutionary iterations
  const layers = options.layerCount || 5;       // Number of topological decision stages between origin & dest
  const perLayer = options.nodesPerLayer || 4;  // Number of alternative corridor paths at each layer
  const bitsPerLayer = 2;                       // 2 bits represent indices 0, 1, 2, 3 (2^2 = 4)
  const totalQubits = layers * bitsPerLayer;    // Total quantum bits per individual chromosome

  // Quantum chromosome: array of Qbits
  type QChromosome = Qbit[];

  // STEP 1: INITIALIZE QUANTUM POPULATION IN EQUAL SUPERPOSITION
  // At generation 0, set α = 1/√2 ≈ 0.7071 and β = 1/√2 ≈ 0.7071.
  // This means |α|² = 0.5 and |β|² = 0.5: every bit has an equal 50% chance of being 0 or 1,
  // representing maximum entropy and unbiased global exploration across the entire network.
  let qPopulation: QChromosome[] = [];

  for (let i = 0; i < popSize; i++) {
    const qInd: QChromosome = [];
    for (let q = 0; q < totalQubits; q++) {
      // Micro-jitter prevents symmetric stagnation across identical individuals
      const jitter = (Math.random() - 0.5) * 0.05;
      const alpha = Math.cos(Math.PI / 4 + jitter);
      const beta = Math.sin(Math.PI / 4 + jitter);
      qInd.push({ alpha, beta });
    }
    qPopulation.push(qInd);
  }

  // STEP 2: QUANTUM MEASUREMENT / STATE COLLAPSE FUNCTION
  // In quantum mechanics, observing a qubit forces it to collapse into a definite classical state (|0> or |1>).
  // We sample a uniform random number r in [0, 1). If r < |β|², the qubit collapses to 1; otherwise, to 0.
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

    // STEP 4: QUANTUM ROTATION GATE UPDATE (Han & Kim, 2002)
    // -------------------------------------------------------------
    // Unlike classical GAs that alter bit values directly with random mutations,
    // QIGA rotates the probability vector [α, β] on the unit circle toward the current best solution.
    // As the algorithm progresses, we anneal (decrease) the base rotation angle θ:
    // Large θ early on allows broad exploration; smaller θ later ensures fine-grained exploitation.
    const baseTheta = (options.baseRotationAngle || 0.035 * Math.PI) * (1 - (0.6 * gen) / maxGen);

    for (let i = 0; i < popSize; i++) {
      const qInd = qPopulation[i];
      const indBits = collapsedSolutions[i].bits;

      for (let q = 0; q < totalQubits; q++) {
        const xi = indBits[q];       // Bit collapsed in current individual
        const bi = bestEverBits[q];  // Corresponding bit in the best-ever route
        const alpha = qInd[q].alpha;
        const beta = qInd[q].beta;

        // Lookup Table for Quantum Rotation Direction & Sign Δθ:
        // - If current collapsed bit (xi) is 0, but best-known solution (bi) is 1:
        //   We rotate the state vector to INCREASE the probability |β|² of observing 1.
        // - If current bit (xi) is 1, but best-known solution (bi) is 0:
        //   We rotate the state vector to INCREASE the probability |α|² of observing 0.
        // - If xi === bi:
        //   Already aligned with best solution, so Δθ = 0 (with small 5% stochastic quantum tunneling to prevent stagnation).
        let deltaTheta = 0;

        if (xi === 0 && bi === 1) {
          // Rotate toward state |1>
          if (alpha * beta > 0) deltaTheta = +baseTheta;
          else if (alpha * beta < 0) deltaTheta = -baseTheta;
          else deltaTheta = +baseTheta;
        } else if (xi === 1 && bi === 0) {
          // Rotate toward state |0>
          if (alpha * beta > 0) deltaTheta = -baseTheta;
          else if (alpha * beta < 0) deltaTheta = +baseTheta;
          else deltaTheta = -baseTheta;
        } else {
          // Already in agreement: apply micro-tunneling perturbation
          if (Math.random() < 0.05) {
            deltaTheta = (Math.random() - 0.5) * 0.02 * Math.PI;
          }
        }

        // Apply 2x2 Unitary Rotation Matrix U(Δθ):
        // [ α' ] = [ cos(Δθ)  -sin(Δθ) ] [ α ]
        // [ β' ]   [ sin(Δθ)   cos(Δθ) ] [ β ]
        const cosT = Math.cos(deltaTheta);
        const sinT = Math.sin(deltaTheta);
        let newAlpha = cosT * alpha - sinT * beta;
        let newBeta = sinT * alpha + cosT * beta;

        // Normalization: Ensure |α|² + |β|² = 1 strictly holds (preserves total probability)
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
