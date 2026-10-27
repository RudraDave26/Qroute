import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    algorithmBenchmarks: [
      { algorithm: "Dijkstra's", avgExecTimeMs: 4.8, avgIterations: 42, optimalityScore: 0.98, memoryKb: 120 },
      { algorithm: 'A* Heuristic', avgExecTimeMs: 2.1, avgIterations: 19, optimalityScore: 0.98, memoryKb: 95 },
      { algorithm: 'Classical GA', avgExecTimeMs: 14.5, avgIterations: 40, optimalityScore: 0.94, memoryKb: 280 },
      { algorithm: 'QIGA', avgExecTimeMs: 8.9, avgIterations: 40, optimalityScore: 0.97, memoryKb: 160 },
    ],
    vehicleFleetEmissionsPer100Km: [
      { vehicle: 'Petrol Car', co2Kg: 16.0, fuelCostInr: 724.1, efficiency: '14.5 km/L' },
      { vehicle: 'Diesel Car', co2Kg: 17.2, fuelCostInr: 505.5, efficiency: '18.2 km/L' },
      { vehicle: 'CNG Vehicle', co2Kg: 12.0, fuelCostInr: 363.6, efficiency: '22.0 km/kg' },
      { vehicle: 'Electric Vehicle (EV)', co2Kg: 5.2, fuelCostInr: 111.1, efficiency: '7.2 km/kWh' },
      { vehicle: 'Motorcycle', co2Kg: 6.8, fuelCostInr: 233.3, efficiency: '45.0 km/L' },
    ],
    congestionCorrelation: [
      { hour: '06:00', avgDelayMin: 1.2, avgSpeedKmh: 52 },
      { hour: '08:00', avgDelayMin: 8.5, avgSpeedKmh: 28 },
      { hour: '10:00', avgDelayMin: 12.4, avgSpeedKmh: 22 },
      { hour: '12:00', avgDelayMin: 5.1, avgSpeedKmh: 38 },
      { hour: '14:00', avgDelayMin: 4.8, avgSpeedKmh: 40 },
      { hour: '17:00', avgDelayMin: 14.2, avgSpeedKmh: 19 },
      { hour: '19:00', avgDelayMin: 16.8, avgSpeedKmh: 17 },
      { hour: '21:00', avgDelayMin: 6.0, avgSpeedKmh: 36 },
      { hour: '23:00', avgDelayMin: 1.0, avgSpeedKmh: 55 },
    ],
    summaryStats: {
      totalSimulatedTrips: 184,
      avgFuelSavingsPct: 18.2,
      avgCo2ReductionPct: 22.4,
      avgTimeReductionPct: 14.7,
      qigaConvergenceSpeedupVsGA: '1.63x faster',
    },
  });
}
