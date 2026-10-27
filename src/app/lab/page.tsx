'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { QuantumConvergenceChart } from '@/components/QuantumConvergenceChart';
import { StatusBadge } from '@/components/StatusBadge';
import { AlgorithmResult, OptimizationObjective, VehicleType } from '@/lib/types';
import { PRESET_LOCATIONS } from '@/lib/providers/nominatim';
import { formatCurrency, formatDistance, formatDuration, formatEmissions } from '@/lib/utils';
import {
  Atom,
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
  Activity,
  Zap,
  Trophy,
  Lightbulb,
  BookOpen,
} from 'lucide-react';

export default function OptimizationLabPage() {
  // Origin & Destination
  const [origin, setOrigin] = useState(PRESET_LOCATIONS[0]); // Koramangala
  const [destination, setDestination] = useState(PRESET_LOCATIONS[1]); // Whitefield ITPL

  // Parameters
  const [objective, setObjective] = useState<OptimizationObjective>('balanced');
  const [vehicleType, setVehicleType] = useState<VehicleType>('ev');
  const [populationSize, setPopulationSize] = useState<number>(30);
  const [generations, setGenerations] = useState<number>(35);
  const [mutationRate, setMutationRate] = useState<number>(0.12);
  const [gridDensity, setGridDensity] = useState<number>(5);

  // Results & UI State
  const [results, setResults] = useState<AlgorithmResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedChartMetric, setSelectedChartMetric] = useState<'fitness' | 'cost' | 'diversity'>('fitness');
  const [showAdvancedMath, setShowAdvancedMath] = useState<boolean>(false);

  const runOptimizationComparison = useCallback(async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/optimization/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: { lat: origin.lat, lng: origin.lng, label: origin.name },
          destination: { lat: destination.lat, lng: destination.lng, label: destination.name },
          vehicleType,
          objective,
          parameters: {
            populationSize,
            generations,
            mutationRate,
            gridDensity,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (e) {
      console.error('Failed to run optimization comparison:', e);
    } finally {
      setIsRunning(false);
    }
  }, [origin, destination, vehicleType, objective, populationSize, generations, mutationRate, gridDensity]);

  useEffect(() => {
    runOptimizationComparison();
  }, [runOptimizationComparison]);

  const qigaResult = results.find((r) => r.algorithmId === 'qiga');
  const gaResult = results.find((r) => r.algorithmId === 'genetic');
  const dijkstraResult = results.find((r) => r.algorithmId === 'dijkstra');
  const astarResult = results.find((r) => r.algorithmId === 'astar');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-quantum-500/10 text-quantum-700 dark:text-quantum-300 border border-quantum-500/20 mb-2">
            <Atom className="h-3.5 w-3.5 text-quantum-500 animate-spin-slow" />
            <span>Algorithm Comparison Lab • Made Simple</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            How Quantum-Inspired AI Finds the Best Route
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            We run 4 different computer algorithms on the exact same city map to see which one finds the fastest, cheapest, and lowest-emission path.
          </p>
        </div>

        <button
          onClick={runOptimizationComparison}
          disabled={isRunning}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all disabled:opacity-50 self-start md:self-auto"
        >
          {isRunning ? (
            <>
              <RotateCcw className="h-4 w-4 animate-spin text-quantum-300" />
              <span>Running Simulation...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 text-quantum-300 fill-quantum-300" />
              <span>Run Head-to-Head Comparison</span>
            </>
          )}
        </button>
      </div>

      {/* Simple Explainer Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-navy-900/60 dark:to-navy-950/60 border border-sky-200 dark:border-navy-800 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-sky-500 text-white shrink-0 mt-0.5 shadow-sm">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            What is happening here in plain English?
          </h3>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Standard GPS navigation (like Dijkstra or A*) only looks for the mathematically shortest distance.
            Our <strong>Quantum-Inspired Genetic Algorithm (QIGA)</strong> explores multiple alternate bypass roads at the same time using probability waves (like quantum physics).
            This discovers hidden arterial routes that bypass heavy traffic jams, saving fuel and time.
          </p>
        </div>
      </div>

      {/* Control Configuration Matrix */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Cpu className="h-4 w-4 text-quantum-500" /> Test Settings (Customize Your Test)
          </h2>
          <span className="text-xs text-muted-foreground">Pick a city corridor or vehicle to compare</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Origin & Destination Pair */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">City Corridor</label>
            <select
              value={origin.id}
              onChange={(e) => {
                const found = PRESET_LOCATIONS.find((p) => p.id === e.target.value);
                if (found) setOrigin(found);
              }}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-medium"
            >
              <option value="blr-koramangala">Bengaluru: Koramangala → Whitefield ITPL</option>
              <option value="del-connaught">Delhi: Connaught Place → Cyber City</option>
              <option value="mum-bkc">Mumbai: BKC → Nariman Point</option>
              <option value="hyd-hitec">Hyderabad: Banjara Hills → HITEC City</option>
            </select>
          </div>

          {/* Objective Target */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Your Goal</label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value as OptimizationObjective)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-medium"
            >
              <option value="balanced">⚖️ Balanced (Best mix of time & cost)</option>
              <option value="fastest">⚡ Fastest Travel Time</option>
              <option value="cheapest">💰 Lowest Cost (Fuel & Tolls)</option>
              <option value="shortest">📏 Shortest Physical Distance</option>
              <option value="eco">🌿 Lowest Carbon Pollution</option>
            </select>
          </div>

          {/* Vehicle Powertrain */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as VehicleType)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-medium"
            >
              <option value="ev">⚡ Electric Vehicle (EV - 7.2 km/kWh)</option>
              <option value="petrol">🚗 Petrol Car (14.5 km/L)</option>
              <option value="diesel">⛽ Diesel Sedan (18.2 km/L)</option>
              <option value="cng">🟢 CNG Hatchback (22.0 km/kg)</option>
              <option value="motorcycle">🛵 Motorcycle (45.0 km/L)</option>
            </select>
          </div>

          {/* Exploration Rounds */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold text-foreground">
              <span>Optimization Rounds</span>
              <span className="text-quantum-600 font-mono">{generations} iterations</span>
            </div>
            <input
              type="range"
              min="15"
              max="50"
              value={generations}
              onChange={(e) => setGenerations(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-quantum-500 mt-2"
            />
            <span className="text-[10px] text-muted-foreground block">
              More rounds = deeper search for bypass shortcuts
            </span>
          </div>
        </div>
      </div>

      {/* 4-Algorithm Comparative Scorecard */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Head-to-Head Algorithm Results:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {results.map((alg) => {
            const isQiga = alg.algorithmId === 'qiga';
            return (
              <div
                key={alg.algorithmId}
                className={`p-5 rounded-2xl border transition-all ${
                  isQiga
                    ? 'bg-quantum-500/10 dark:bg-quantum-500/15 border-quantum-500 ring-2 ring-quantum-500/30 shadow-md'
                    : 'bg-card border-border shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {alg.category}
                  </span>
                  {isQiga && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-quantum-500 text-white flex items-center gap-1 shadow-xs">
                      <Sparkles className="h-3 w-3" /> Best Choice
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-foreground">{alg.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{alg.explanation}</p>

                <div className="mt-4 pt-3 border-t border-border/60 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Travel Duration:</span>
                    <span className="font-extrabold text-foreground">{formatDuration(alg.travelTimeMin)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Trip Cost:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(alg.costInr)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Physical Distance:</span>
                    <span className="font-semibold text-foreground">{formatDistance(alg.distanceKm)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CO₂ Emissions:</span>
                    <span className="font-semibold text-foreground">{formatEmissions(alg.emissionsKg)}</span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-border/40">
                    <span className="text-muted-foreground">Calculation Speed:</span>
                    <span className="font-mono text-quantum-600 dark:text-quantum-400 font-bold">
                      {alg.executionTimeMs} ms
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Convergence Chart */}
      {qigaResult && qigaResult.convergence?.length > 0 && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  Live Learning & Improvement Curve
                </h2>
                <StatusBadge status="LIVE" label="Real Computed Telemetry" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Watch how QIGA rapidly improves the route quality with each round.
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted border border-border text-xs">
              <button
                type="button"
                onClick={() => setSelectedChartMetric('fitness')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  selectedChartMetric === 'fitness'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Route Quality (Fitness)
              </button>
              <button
                type="button"
                onClick={() => setSelectedChartMetric('cost')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  selectedChartMetric === 'cost'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Total Trip Cost J(r)
              </button>
            </div>
          </div>

          <QuantumConvergenceChart
            qigaData={qigaResult.convergence}
            gaData={gaResult?.convergence}
            metricType={selectedChartMetric}
          />
        </div>
      )}

      {/* Advanced Research Math Toggle */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setShowAdvancedMath(!showAdvancedMath)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
        >
          <BookOpen className="h-4 w-4 text-quantum-500" />
          <span>{showAdvancedMath ? 'Hide Advanced Quantum Equations' : 'Want to see the Deep Math? (Click here)'}</span>
        </button>
      </div>

      {/* Optional Advanced Math Section */}
      {showAdvancedMath && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2 animate-accordion-down">
          {/* Sample Q-Bit Amplitudes Matrix */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Atom className="h-4 w-4 text-quantum-500" />
              Live Q-Bit Probability Amplitudes Matrix (Sample)
            </h3>
            <p className="text-xs text-muted-foreground">
              Each decision state is encoded by a Q-bit $|\psi_i\rangle = \alpha_i |0\rangle + \beta_i |1\rangle$ satisfying unitary constraint $|\alpha_i|^2 + |\beta_i|^2 = 1.0$.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground font-semibold">
                    <th className="py-2">Qubit</th>
                    <th className="py-2">P(|0⟩) = |α|²</th>
                    <th className="py-2">P(|1⟩) = |β|²</th>
                    <th className="py-2">Phase Angle (θ)</th>
                    <th className="py-2">State Vector Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {qigaResult?.quantumAmplitudesSample?.slice(0, 6).map((q) => (
                    <tr key={q.qubitIndex}>
                      <td className="py-2 font-bold text-foreground">q_{q.qubitIndex}</td>
                      <td className="py-2 text-sky-600 dark:text-sky-400">{(q.alphaSq * 100).toFixed(1)}%</td>
                      <td className="py-2 text-indigo-600 dark:text-indigo-400">{(q.betaSq * 100).toFixed(1)}%</td>
                      <td className="py-2 text-slate-500">{q.phaseTheta} rad</td>
                      <td className="py-2">
                        <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-navy-800 flex overflow-hidden">
                          <div style={{ width: `${q.alphaSq * 100}%` }} className="bg-sky-500 h-full" />
                          <div style={{ width: `${q.betaSq * 100}%` }} className="bg-indigo-500 h-full" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quantum Rotation Gate Mathematical Architecture */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-quantum-500" />
              Unitary Quantum Rotation Gate Update Rule
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In QIGA, qubits evolve through a 2×2 unitary rotation gate $U(\Delta\theta_i)$ applied to each state vector:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-navy-900 border border-border/80 font-mono text-xs text-foreground space-y-2">
              <div>
                <code>
                  [ α_(i)^(t+1) ] = [ cos(Δθ_i)  -sin(Δθ_i) ] [ α_(i)^(t) ]<br />
                  [ β_(i)^(t+1) ]   [ sin(Δθ_i)   cos(Δθ_i) ] [ β_(i)^(t) ]
                </code>
              </div>
              <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                Where rotation direction $s(\alpha_i, \beta_i)$ is looked up by comparing collapsed bit $x_i$ with the Pareto-best bit $b_i$.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
              <strong>Honest Academic Disclosure:</strong> This implementation executes quantum state calculations on classical hardware
              (simulating unitary matrices). It does not require a physical quantum refrigeration dilution cryostat.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
