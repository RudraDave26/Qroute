import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    engine: 'QuantumRoute Metaheuristic Engine',
    version: '1.0.0',
    status: 'idle',
    ready: true,
    supportedAlgorithms: [
      { id: 'dijkstra', name: "Dijkstra's Shortest Path", complexity: 'O(|V|^2 + |E|)', type: 'Classical Exact' },
      { id: 'astar', name: 'A* Heuristic Search', complexity: 'O(|E| log |V|)', type: 'Heuristic' },
      { id: 'genetic', name: 'Genetic Algorithm', complexity: 'O(G * N * L)', type: 'Metaheuristic' },
      { id: 'qiga', name: 'Quantum-Inspired Genetic Algorithm (QIGA)', complexity: 'O(G * N_q * L)', type: 'Quantum-Inspired Metaheuristic' },
    ],
    quantumRepresentation: {
      qubitState: '|ψ⟩ = α|0⟩ + β|1⟩, |α|² + |β|² = 1',
      rotationGate: 'U(Δθ) = [[cos(Δθ), -sin(Δθ)], [sin(Δθ), cos(Δθ)]]',
      executionSubstrate: 'Classical CPU (Simulated Quantum State Vectors)',
    },
  });
}
