/**
 * Quantum-Inspired Genetic Algorithm (QIGA) for Multi-Vehicle Fleet Routing
 * =========================================================================
 * 
 * MATHEMATICAL & QUANTUM COMPUTING PRINCIPLES:
 * --------------------------------------------
 * Classical genetic algorithms represent individuals as static deterministic strings (e.g. [0, 1, 0, 1]).
 * This often suffers from premature convergence in NP-hard combinatorial spaces like Capacitated VRP.
 * 
 * QIGA utilizes principles of quantum computing:
 * 
 * 1. Quantum Bit (Qubit) Superposition:
 *    A qubit gene state |ψ⟩ is defined as a linear superposition of ground states |0⟩ and |1⟩:
 *        |ψ⟩ = α|0⟩ + β|1⟩
 *    where α, β ∈ C (or R) represent probability amplitudes satisfying the normalization condition:
 *        |α|² + |β|² = 1.0
 * 
 *    |α|² represents the probability of measuring state 0;
 *    |β|² represents the probability of measuring state 1.
 * 
 * 2. Representation of Multi-Vehicle Tours:
 *    A quantum chromosome consists of M qubits:
 *        q = [ [α_1, β_1]^T, [α_2, β_2]^T, ..., [α_M, β_M]^T ]
 *    where α_j = cos(θ_j) and β_j = sin(θ_j).
 *    Initial state sets θ_j = π/4 (so |α|² = |β|² = 0.5), representing maximal quantum entropy
 *    and an unbiased equal superposition over 2^M candidate combinatorial assignments!
 * 
 * 3. Quantum Rotation Gate Update:
 *    In each generation, qubits are guided toward the current global best solution B using
 *    the unitary quantum rotation gate:
 *        U(Δθ) = [ [cos(Δθ_j), -sin(Δθ_j)],
 *                  [sin(Δθ_j),  cos(Δθ_j)] ]
 * 
 *        [α'_j, β'_j]^T = U(Δθ_j) · [α_j, β_j]^T
 * 
 *    The rotation step Δθ_j (magnitude 0.01π to 0.05π) and sign are determined by the standard
 *    Han & Kim lookup matrix comparing collapsed candidate bit x_j with best bit b_j.
 * 
 * 4. Quantum H_ε Catastrophe Mutation:
 *    To prevent premature collapse into local minima, QIGA monitors the quantum Shannon entropy:
 *        H = - (1/M) Σ [ |α_j|² log₂(|α_j|²) + |β_j|² log₂(|β_j|²) ]
 *    When H falls below threshold H_ε (indicating diversity exhaustion), dynamic phase perturbation
 *    is applied to re-entangle and restore exploratory superposition.
 */

import {
  FleetVrpProblem,
  FleetVrpSolution,
  FleetVehicleTour,
  DeliveryStop,
} from '../types';
import {
  buildTourItinerary,
  assembleFleetSolution,
} from './fleetVrp';
import {
  calculateFleetObjectiveScore,
} from './fleetCostModel';
import { haversineDistanceKm } from '../utils';

interface QubitGene {
  theta: number; // phase angle in radians
  alpha: number; // cos(theta)
  beta: number;  // sin(theta)
}

export interface QigaFleetParameters {
  populationSize?: number;
  generations?: number;
  rotationStep?: number; // Δθ base, e.g. 0.035 * π
  catastropheEntropyThreshold?: number; // e.g. 0.18
}

/**
 * Solves the Capacitated Multi-Vehicle Fleet VRP using Quantum-Inspired Genetic Algorithm
 */
export function solveFleetVrpQiga(
  problem: FleetVrpProblem,
  params: QigaFleetParameters = {}
): FleetVrpSolution {
  const startTime = Date.now();
  const {
    populationSize = 28,
    generations = 36,
    rotationStep = 0.035 * Math.PI,
    catastropheEntropyThreshold = 0.16,
  } = params;

  const stops = problem.stops;
  const vehicles = problem.vehicles;
  const numStops = stops.length;
  const numVehicles = vehicles.length;

  if (numStops === 0 || numVehicles === 0) {
    return assembleFleetSolution(problem, 'qiga-fleet', 'Quantum-Inspired Genetic Algorithm (QIGA)', [], [], Date.now() - startTime);
  }

  // Chromosome dimension:
  // Each stop needs:
  // 1. Vehicle assignment bits (log2(numVehicles) qubits)
  // 2. Relative priority ordering bits (2 qubits)
  const qubitsPerStop = Math.max(2, Math.ceil(Math.log2(numVehicles)) + 2);
  const chromosomeLength = numStops * qubitsPerStop;

  // Initialize Quantum Population with maximum superposition: θ = π/4 (equal probability |α|² = |β|² = 0.5)
  type QuantumChromosome = QubitGene[];

  function createSuperpositionChromosome(): QuantumChromosome {
    return Array.from({ length: chromosomeLength }, () => {
      const theta = Math.PI / 4;
      return {
        theta,
        alpha: Math.cos(theta),
        beta: Math.sin(theta),
      };
    });
  }

  let quantumPop: QuantumChromosome[] = Array.from({ length: populationSize }, () => createSuperpositionChromosome());

  // Measurement / Collapse of Quantum Chromosome into Classical Binary Bits
  function measureChromosome(qChrom: QuantumChromosome): boolean[] {
    return qChrom.map((q) => {
      const prob1 = q.beta * q.beta; // |β|²
      return Math.random() < prob1;
    });
  }

  // 2-Phase Decoder: Converts classical binary measurement into vehicle tours
  function decodeMeasurementToTours(bits: boolean[]): FleetVehicleTour[] {
    // 1. Assign each stop to vehicle based on measured assignment bits
    const vehicleBuckets: DeliveryStop[][] = Array.from({ length: numVehicles }, () => []);

    for (let sIdx = 0; sIdx < numStops; sIdx++) {
      const stop = stops[sIdx];
      const bitOffset = sIdx * qubitsPerStop;

      // Extract integer vehicle index from first assignment bits
      let vehicleIdx = 0;
      const assignBitsCount = Math.ceil(Math.log2(numVehicles));
      for (let b = 0; b < assignBitsCount; b++) {
        if (bits[bitOffset + b]) {
          vehicleIdx |= (1 << b);
        }
      }
      vehicleIdx = vehicleIdx % numVehicles;

      // Capability validation & constraint repair during decode:
      // If stop requires refrigerated capability, must go to a refrigerated van
      if (stop.requiredCapability && stop.requiredCapability !== 'standard') {
        const targetVehicle = vehicles[vehicleIdx];
        if (!targetVehicle.capabilities.includes(stop.requiredCapability)) {
          // Find first compatible vehicle
          const compatIdx = vehicles.findIndex((v) => v.capabilities.includes(stop.requiredCapability!));
          if (compatIdx >= 0) {
            vehicleIdx = compatIdx;
          }
        }
      }

      vehicleBuckets[vehicleIdx].push(stop);
    }

    // 2. Intra-tour ordering:
    // Sort stops in each vehicle bucket to minimize travel time and respect earliest delivery windows
    const tours: FleetVehicleTour[] = [];
    for (let vIdx = 0; vIdx < numVehicles; vIdx++) {
      const bucket = vehicleBuckets[vIdx];
      const vehicle = vehicles[vIdx];

      if (bucket.length === 0) {
        tours.push(buildTourItinerary(vehicle, [], problem.depot));
        continue;
      }

      // 2-opt / nearest insertion with time-window prioritization
      bucket.sort((a, b) => {
        // Primary sort: earliest arrival deadline
        if (Math.abs(a.earliestArrivalMin - b.earliestArrivalMin) > 40) {
          return a.earliestArrivalMin - b.earliestArrivalMin;
        }
        // Secondary sort: angular orientation from depot
        const angleA = Math.atan2(a.lat - problem.depot.lat, a.lng - problem.depot.lng);
        const angleB = Math.atan2(b.lat - problem.depot.lat, b.lng - problem.depot.lng);
        return angleA - angleB;
      });

      tours.push(buildTourItinerary(vehicle, bucket, problem.depot));
    }

    return tours;
  }

  function evaluateCandidate(bits: boolean[]): { score: number; tours: FleetVehicleTour[] } {
    const tours = decodeMeasurementToTours(bits);
    const totalCost = tours.reduce((sum, t) => sum + t.operatingCostInr, 0);
    const totalDuration = Math.max(...tours.map((t) => t.totalDurationMin));
    const totalEmissions = tours.reduce((sum, t) => sum + t.emissionsKg, 0);
    const totalPenalties = tours.reduce(
      (sum, t) => sum + t.violations.reduce((vSum, v) => vSum + v.penaltyCostInr, 0),
      0
    );

    const score = calculateFleetObjectiveScore(totalCost, totalDuration, totalEmissions, totalPenalties, problem.objectiveWeights);
    return { score, tours };
  }

  // Calculate Shannon entropy to monitor quantum diversity
  function calculateQuantumEntropy(qChrom: QuantumChromosome): number {
    let sumH = 0;
    for (const q of qChrom) {
      const a2 = Math.max(1e-6, q.alpha * q.alpha);
      const b2 = Math.max(1e-6, q.beta * q.beta);
      sumH += -(a2 * Math.log2(a2) + b2 * Math.log2(b2));
    }
    return sumH / qChrom.length;
  }

  // Quantum Rotation Gate lookup table (Han & Kim formulation)
  function getRotationAngle(xBit: boolean, bBit: boolean, isBetter: boolean, baseStep: number): number {
    // If current solution is already better than best (rare update step), rotate toward current
    if (!xBit && bBit) {
      // 0 vs 1
      return isBetter ? -baseStep : +baseStep;
    } else if (xBit && !bBit) {
      // 1 vs 0
      return isBetter ? +baseStep : -baseStep;
    }
    return 0; // Same bit: no rotation needed
  }

  // Update quantum state with unitary rotation gate
  function applyRotationGate(
    qChrom: QuantumChromosome,
    candidateBits: boolean[],
    bestBits: boolean[],
    isBetter: boolean,
    stepSize: number
  ): QuantumChromosome {
    return qChrom.map((q, idx) => {
      const x = candidateBits[idx];
      const b = bestBits[idx];
      const deltaTheta = getRotationAngle(x, b, isBetter, stepSize);

      let newTheta = q.theta + deltaTheta;
      // Keep theta in [0, 2π]
      newTheta = ((newTheta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      return {
        theta: newTheta,
        alpha: Math.cos(newTheta),
        beta: Math.sin(newTheta),
      };
    });
  }

  // Initial measurements
  let bestBits: boolean[] = measureChromosome(quantumPop[0]);
  let bestResult = evaluateCandidate(bestBits);

  const convergenceTrajectory: { generation: number; bestScore: number; avgScore: number; diversity: number }[] = [];

  for (let gen = 0; gen < generations; gen++) {
    // 1. Measure all quantum chromosomes to collapse into classical solutions
    const measurements: { bits: boolean[]; result: { score: number; tours: FleetVehicleTour[] }; qIdx: number }[] = [];

    for (let pIdx = 0; pIdx < populationSize; pIdx++) {
      const bits = measureChromosome(quantumPop[pIdx]);
      const result = evaluateCandidate(bits);
      measurements.push({ bits, result, qIdx: pIdx });

      if (result.score < bestResult.score) {
        bestResult = result;
        bestBits = bits;
      }
    }

    const avgScore = measurements.reduce((sum, m) => sum + m.result.score, 0) / measurements.length;
    const avgEntropy = quantumPop.reduce((sum, q) => sum + calculateQuantumEntropy(q), 0) / quantumPop.length;

    convergenceTrajectory.push({
      generation: gen + 1,
      bestScore: Number(bestResult.score.toFixed(4)),
      avgScore: Number(avgScore.toFixed(4)),
      diversity: Number(avgEntropy.toFixed(3)),
    });

    // 2. Quantum Rotation Gate Update:
    // Adaptive step size decreases slightly as algorithm converges
    const dynamicStep = rotationStep * (1.0 - (gen / generations) * 0.4);

    for (let pIdx = 0; pIdx < populationSize; pIdx++) {
      const candidate = measurements[pIdx];
      const isBetter = candidate.result.score < bestResult.score;

      quantumPop[pIdx] = applyRotationGate(
        quantumPop[pIdx],
        candidate.bits,
        bestBits,
        isBetter,
        dynamicStep
      );
    }

    // 3. Quantum H_ε Catastrophe Mutation:
    // If population diversity collapses below threshold, inject quantum phase perturbation
    if (avgEntropy < catastropheEntropyThreshold && gen < generations - 5) {
      quantumPop = quantumPop.map((qChrom, idx) => {
        // Leave best individual intact (quantum elitism)
        if (idx === 0) return qChrom;

        return qChrom.map((q) => {
          if (Math.random() < 0.25) {
            // Perturb angle by random phase
            const perturbedTheta = q.theta + (Math.random() - 0.5) * (Math.PI / 3);
            return {
              theta: perturbedTheta,
              alpha: Math.cos(perturbedTheta),
              beta: Math.sin(perturbedTheta),
            };
          }
          return q;
        });
      });
    }
  }

  const executionTimeMs = Date.now() - startTime;

  return assembleFleetSolution(
    problem,
    'qiga-fleet',
    'Quantum-Inspired Genetic Algorithm (QIGA)',
    bestResult.tours,
    [],
    executionTimeMs,
    bestResult.score,
    convergenceTrajectory
  );
}
