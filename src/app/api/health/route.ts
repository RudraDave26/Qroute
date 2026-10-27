import { NextResponse } from 'next/server';

export async function GET() {
  const trafficKeyPresent = !!(process.env.TOMTOM_API_KEY || process.env.TRAFFIC_API_KEY);
  const fuelKeyPresent = !!process.env.FUEL_PRICE_API_KEY;

  return NextResponse.json({
    status: 'healthy',
    application: 'QuantumRoute AI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    providers: {
      maps: 'OpenStreetMap (Leaflet)',
      traffic: trafficKeyPresent ? 'TomTom Live Traffic API' : 'Synthetic Traffic Physics Engine (DEMO mode)',
      routing: trafficKeyPresent ? 'TomTom Routing API' : 'Multi-Objective Graph Routing Engine',
      weather: 'Open-Meteo Public API',
      fuelPrices: fuelKeyPresent ? 'IndianAPI Live Feed' : 'City Regulatory Benchmark Tariffs',
      optimizationEngine: 'Internal Classical & Quantum-Inspired Metaheuristics (QIGA)',
    },
    capabilities: [
      'dijkstra-exact',
      'astar-heuristic',
      'genetic-metaheuristic',
      'quantum-inspired-genetic-algorithm',
      'multi-objective-scoring',
      'ev-energy-profiling',
    ],
  });
}
