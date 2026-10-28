'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  FleetVrpProblem,
  FleetVrpSolution,
  FleetVehicleTour,
  DynamicReoptResult,
  DynamicEventType,
  FleetObjectiveWeights,
} from '@/lib/types';
import { PRESET_FLEET_PROBLEMS } from '@/lib/algorithms/fleetVrp';
import { FLEET_OBJECTIVE_PRESETS } from '@/lib/algorithms/fleetCostModel';
import { formatCurrency, formatDistance, formatDuration, formatEmissions } from '@/lib/utils';
import {
  Truck,
  Atom,
  Cpu,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Clock,
  Zap,
  RotateCcw,
  Play,
  Activity,
  ArrowRight,
  ShieldCheck,
  Fuel,
  IndianRupee,
  Sliders,
  RefreshCw,
  Plus,
  HelpCircle,
} from 'lucide-react';

// Leaflet dynamically loaded without SSR
const FleetMap = dynamic(() => import('@/components/Map/FleetMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] flex items-center justify-center bg-muted/40 rounded-3xl border border-border">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-quantum-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-muted-foreground">Loading Multi-Vehicle Fleet Canvas...</span>
      </div>
    </div>
  ),
});

export default function FleetOptimizationPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>('bengaluru-ecommerce');
  const [stopCount, setStopCount] = useState<number>(20);
  const [vehicleCount, setVehicleCount] = useState<number>(4);
  const [objectiveKey, setObjectiveKey] = useState<'balanced' | 'cost' | 'speed' | 'eco'>('balanced');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [problem, setProblem] = useState<FleetVrpProblem>(PRESET_FLEET_PROBLEMS['bengaluru-ecommerce']);
  const [solutions, setSolutions] = useState<FleetVrpSolution[]>([]);
  const [selectedSolutionIdx, setSelectedSolutionIdx] = useState<number>(0);
  const [explanationReport, setExplanationReport] = useState<any>(null);

  // Dynamic Re-Optimization State
  const [reoptLoading, setReoptLoading] = useState<boolean>(false);
  const [reoptResult, setReoptResult] = useState<DynamicReoptResult | null>(null);

  // Benchmarking State
  const [benchmarkRunsCount, setBenchmarkRunsCount] = useState<number>(3);
  const [benchmarkStats, setBenchmarkStats] = useState<Record<string, any> | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);

  // Execute optimization
  const runFleetOptimization = useCallback(async () => {
    setIsLoading(true);
    setReoptResult(null);
    try {
      const res = await fetch('/api/fleet/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetId: selectedPreset,
          stopCount,
          vehicleCount,
          objectiveWeights: FLEET_OBJECTIVE_PRESETS[objectiveKey],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProblem(data.problem);
        setSolutions(data.solutions || []);
        setSelectedSolutionIdx(0);
        setExplanationReport(data.explanationReport);
      }
    } catch (e) {
      console.error('Failed to run fleet optimization:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPreset, stopCount, vehicleCount, objectiveKey]);

  useEffect(() => {
    runFleetOptimization();
  }, [runFleetOptimization]);

  // Handle Dynamic Re-optimization Events (Breakdown, Rush Orders, Traffic)
  const triggerDynamicDisruption = async (eventType: DynamicEventType) => {
    if (!problem || solutions.length === 0) return;
    setReoptLoading(true);

    try {
      const activeSol = solutions[selectedSolutionIdx] || solutions[0];
      const res = await fetch('/api/fleet/reoptimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem,
          priorSolution: activeSol,
          event: {
            id: `evt-${Date.now()}`,
            type: eventType,
            timestampMin: eventType === 'vehicle_breakdown' ? 45 : 30,
            targetVehicleId: problem.vehicles[1]?.id || problem.vehicles[0].id,
            delayMinutes: 35,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReoptResult(data.result);
      }
    } catch (e) {
      console.error('Failed dynamic re-optimization:', e);
    } finally {
      setReoptLoading(false);
    }
  };

  // Run repeated Monte Carlo benchmarks
  const runEmpiricalBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch('/api/fleet/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stopCount,
          vehicleCount,
          repeatRuns: benchmarkRunsCount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBenchmarkStats(data.stats);
      }
    } catch (e) {
      console.error('Benchmark failed:', e);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const currentSolution = reoptResult ? reoptResult.reoptimizedSolution : solutions[selectedSolutionIdx];
  const qigaSolution = solutions.find((s) => s.algorithmId === 'qiga-fleet');
  const cgaSolution = solutions.find((s) => s.algorithmId === 'cga-fleet');
  const cwSolution = solutions.find((s) => s.algorithmId === 'clarke-wright');
  const nnSolution = solutions.find((s) => s.algorithmId === 'nearest-neighbor');

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Mission Control Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-quantum-500/15 text-quantum-700 dark:text-quantum-300 border border-quantum-500/30 flex items-center gap-1.5">
                <Truck className="h-3 w-3" />
                <span>Quantum-Inspired Fleet Intelligence (Q-VRP)</span>
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground font-medium">Capacitated Multi-Vehicle Scheduling</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Fleet Route Optimization & Total Cost Management
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl">
              Solve complex multi-vehicle schedules with customer time windows, cold-chain refrigerated constraints, driver wages, and carbon emissions using QIGA vs classical industrial algorithms.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={runFleetOptimization}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Optimizing Fleet...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Run Fleet Optimization</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Fleet Problem & Objective Controller Card */}
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Scenario Presets (4 cols) */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Logistics Scenario
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground font-semibold text-xs sm:text-sm focus:ring-2 focus:ring-quantum-500/40"
              >
                <option value="bengaluru-ecommerce">Bengaluru Metro Express (20 Stops, 4 Multi-Vans)</option>
                <option value="custom-30">Custom Regional Cluster (30 Stops, 5 Vans)</option>
                <option value="custom-50">Enterprise Distribution (50 Stops, 6 Vans)</option>
                <option value="custom-100">High-Density Scalability Test (100 Stops, 8 Vans)</option>
              </select>
            </div>

            {/* Objective Priorities (5 cols) */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Optimization Objective Priority (Pareto Weights)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { key: 'balanced', label: 'Balanced ⚖️' },
                  { key: 'cost', label: 'Cost Priority 💰' },
                  { key: 'speed', label: 'Express Time ⚡' },
                  { key: 'eco', label: 'Green Fleet 🌿' },
                ].map((obj) => (
                  <button
                    key={obj.key}
                    type="button"
                    onClick={() => setObjectiveKey(obj.key as any)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all text-center ${
                      objectiveKey === obj.key
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {obj.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stop Count & Fleet Size Display (3 cols) */}
            <div className="md:col-span-3 flex items-center justify-around p-2.5 rounded-2xl bg-muted/40 border border-border/60 text-xs">
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Deliveries</span>
                <span className="text-base font-extrabold text-foreground">{problem.stops.length} stops</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Fleet</span>
                <span className="text-base font-extrabold text-quantum-600 dark:text-quantum-400">
                  {problem.vehicles.length} vans
                </span>
              </div>
            </div>
          </div>

          {/* Active Fleet Powertrain Vehicles Row */}
          <div className="pt-2 border-t border-border/60">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Assigned Vehicle Fleet & Powertrains:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              {problem.vehicles.map((v) => (
                <div
                  key={v.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    v.isAvailable
                      ? 'bg-card border-border hover:border-quantum-500/40'
                      : 'bg-rose-500/10 border-rose-500/30 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-foreground truncate">{v.name}</span>
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: v.colorHex || '#06b6d4' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Type: <strong className="uppercase text-foreground">{v.type}</strong></span>
                    <span>Cap: <strong className="text-foreground">{v.capacityKg} kg</strong></span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {v.capabilities.map((c) => (
                      <span
                        key={c}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          c === 'refrigerated'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {c === 'refrigerated' ? '❄️ Cold-Chain' : c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Multi-Vehicle Fleet Map Canvas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <span>🗺️</span>
              <span>Interactive Multi-Vehicle Route Canvas</span>
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground font-semibold">Displaying:</span>
              <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-xl">
                {solutions.map((sol, idx) => (
                  <button
                    key={sol.algorithmId}
                    type="button"
                    onClick={() => {
                      setSelectedSolutionIdx(idx);
                      setReoptResult(null);
                    }}
                    className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] transition-colors ${
                      selectedSolutionIdx === idx && !reoptResult
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sol.algorithmId === 'qiga-fleet' ? 'QIGA (Best)' : sol.algorithmName.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative w-full h-[520px] rounded-3xl overflow-hidden shadow-xl border border-border">
            <FleetMap problem={problem} solution={currentSolution} />
          </div>
        </div>

        {/* Section 1: Algorithmic Comparative Benchmark Cards (Pillars 1 & 2) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                <Cpu className="h-5 w-5 text-quantum-600 dark:text-quantum-400" />
                <span>Quantum-Inspired vs Classical Algorithms (Identical Delivery Data)</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Every algorithm is evaluated against identical stops, vehicle capacities, driver wages (₹180/hr), and fuel consumption rates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {solutions.map((sol, idx) => {
              const isSelected = selectedSolutionIdx === idx && !reoptResult;
              const isQiga = sol.algorithmId === 'qiga-fleet';

              return (
                <div
                  key={sol.algorithmId}
                  onClick={() => {
                    setSelectedSolutionIdx(idx);
                    setReoptResult(null);
                  }}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-quantum-500/10 border-quantum-500 ring-2 ring-quantum-500/40 shadow-lg'
                      : 'bg-card border-border hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isQiga
                            ? 'bg-quantum-500 text-white shadow-xs'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isQiga ? '🏆 Winner' : 'Benchmark'}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {sol.executionTimeMs} ms
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-foreground leading-snug">
                      {sol.algorithmName}
                    </h3>

                    {/* Primary Cost Metric */}
                    <div className="p-2.5 rounded-2xl bg-muted/40 border border-border/50">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                        Total Operating Cost (TCO)
                      </span>
                      <span className="text-xl font-black text-foreground block">
                        {formatCurrency(sol.totalOperatingCostInr)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Fuel + Driver Wages + Maintenance
                      </span>
                    </div>

                    {/* Operational KPIs */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="p-2 rounded-xl bg-card border border-border/50">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold block">Distance</span>
                        <strong className="text-foreground">{formatDistance(sol.totalDistanceKm)}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-card border border-border/50">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold block">Shift Duration</span>
                        <strong className="text-foreground">{formatDuration(sol.totalDurationMin)}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-card border border-border/50">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold block">Emissions</span>
                        <strong className="text-foreground">{formatEmissions(sol.totalEmissionsKg)}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-card border border-border/50">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold block">Violations</span>
                        <strong
                          className={
                            sol.isFeasible ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                          }
                        >
                          {sol.isFeasible ? '0 (Feasible)' : `${sol.violations.length} breach`}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isSelected ? 'Viewing on Map' : 'Select Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Real-Time Dynamic Re-Optimization Under Disruption (Pillar 4) */}
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">⚡</span>
                <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
                  Dynamic Re-Optimization Under Real-Time Disruptions
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Test the optimizer&apos;s ability to adapt when conditions change mid-shift (vehicle breakdown, urgent on-demand rush orders, or arterial gridlock).
              </p>
            </div>

            {/* Event Trigger Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => triggerDynamicDisruption('vehicle_breakdown')}
                disabled={reoptLoading}
                className="px-3.5 py-2 rounded-xl font-bold text-xs bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all flex items-center gap-1.5"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Simulate Van Breakdown</span>
              </button>

              <button
                type="button"
                onClick={() => triggerDynamicDisruption('rush_order_injection')}
                disabled={reoptLoading}
                className="px-3.5 py-2 rounded-xl font-bold text-xs bg-quantum-500/15 text-quantum-700 dark:text-quantum-300 border border-quantum-500/30 hover:bg-quantum-500/25 transition-all flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Inject Rush Orders</span>
              </button>

              <button
                type="button"
                onClick={() => triggerDynamicDisruption('traffic_gridlock')}
                disabled={reoptLoading}
                className="px-3.5 py-2 rounded-xl font-bold text-xs bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all flex items-center gap-1.5"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Corridor Gridlock (+35m)</span>
              </button>
            </div>
          </div>

          {/* Re-optimization Before & After Comparison Panel */}
          {reoptResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Dynamic Re-Optimization Succeeded in {reoptResult.computeTimeMs} ms</span>
                </span>
                <button
                  type="button"
                  onClick={() => setReoptResult(null)}
                  className="text-xs text-muted-foreground hover:underline font-semibold"
                >
                  Reset to Original Plan
                </button>
              </div>

              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                {reoptResult.explanation}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Cost Delta</span>
                  <span className={`text-base font-extrabold ${reoptResult.costDeltaInr >= 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {reoptResult.costDeltaInr >= 0 ? `+₹${reoptResult.costDeltaInr}` : `-₹${Math.abs(reoptResult.costDeltaInr)}`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Duration Delta</span>
                  <span className="text-base font-extrabold text-foreground">
                    {reoptResult.durationDeltaMin >= 0 ? `+${reoptResult.durationDeltaMin} min` : `${reoptResult.durationDeltaMin} min`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Affected Vans</span>
                  <span className="text-base font-extrabold text-foreground">
                    {reoptResult.affectedVehicleIds.length} vehicle(s)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Reassigned Stops</span>
                  <span className="text-base font-extrabold text-quantum-600 dark:text-quantum-400">
                    {reoptResult.reassignedStopIds.length} delivery stop(s)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Explainable AI (XAI) Selection Rationale (Pillar 5) */}
        {explanationReport && (
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Sparkles className="h-5 w-5 text-quantum-600 dark:text-quantum-400" />
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
                Explainable AI (XAI): Why This Plan Was Selected
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  1. Mathematical Selection Reason
                </span>
                <p className="text-foreground leading-relaxed">{explanationReport.primarySelectionReason}</p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  2. Cost Breakdown & Operating Components
                </span>
                <p className="text-foreground leading-relaxed">{explanationReport.costBreakdownExplanation}</p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  3. Multi-Objective Trade-Off Influence
                </span>
                <p className="text-foreground leading-relaxed">{explanationReport.multiObjectiveTradeoffExplanation}</p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  4. Constraint Satisfaction Proof
                </span>
                <p className="text-emerald-700 dark:text-emerald-300 font-semibold leading-relaxed">
                  {explanationReport.constraintSatisfactionProof}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Vehicle Tour Manifests & Delivery Itineraries (Pillar 6) */}
        {currentSolution && (
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                <Truck className="h-5 w-5 text-quantum-600 dark:text-quantum-400" />
                <span>Vehicle Tour Manifests & Payload Allocations</span>
              </h2>
              <span className="text-xs text-muted-foreground font-semibold">
                {currentSolution.tours.filter((t) => t.stops.length > 0).length} of {problem.vehicles.length} active vehicles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentSolution.tours.map((tour, idx) => {
                const vehicle = problem.vehicles.find((v) => v.id === tour.vehicleId);

                return (
                  <div
                    key={tour.vehicleId}
                    className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: vehicle?.colorHex || '#06b6d4' }}
                        />
                        <h4 className="font-extrabold text-sm text-foreground">{tour.vehicleName}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-muted text-muted-foreground">
                        {tour.vehicleType}
                      </span>
                    </div>

                    {/* Capacity bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Payload: {tour.totalPayloadKg} kg / {vehicle?.capacityKg} kg</span>
                        <strong className="text-foreground">{tour.capacityUtilizationPercent}%</strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, tour.capacityUtilizationPercent)}%`,
                            backgroundColor: vehicle?.colorHex || '#06b6d4',
                          }}
                        />
                      </div>
                    </div>

                    {/* Key metrics */}
                    <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/50 text-[11px]">
                      <span>Dist: <strong className="text-foreground">{formatDistance(tour.totalDistanceKm)}</strong></span>
                      <span>Time: <strong className="text-foreground">{formatDuration(tour.totalDurationMin)}</strong></span>
                      <span>Cost: <strong className="text-foreground">{formatCurrency(tour.operatingCostInr)}</strong></span>
                      <span>Stops: <strong className="text-foreground">{tour.stops.length}</strong></span>
                    </div>

                    {/* Stops List */}
                    {tour.stops.length > 0 && (
                      <div className="space-y-1.5 pt-1 max-h-36 overflow-y-auto pr-1">
                        {tour.stops.map((stop, sIdx) => (
                          <div
                            key={stop.id}
                            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-card border border-border/40 text-[11px]"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="h-4 w-4 rounded-full bg-muted font-extrabold text-[9px] flex items-center justify-center shrink-0">
                                {sIdx + 1}
                              </span>
                              <span className="truncate font-semibold text-foreground">{stop.name}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {stop.demandKg} kg • Window: [{stop.earliestArrivalMin}m - {stop.latestArrivalMin}m]
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 5: Transparent Research & Empirical Benchmarking Lab (Pillar 7) */}
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Atom className="h-5 w-5 text-quantum-600 dark:text-quantum-400 animate-spin-slow" />
                <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
                  Empirical Research & Statistical Benchmarking Lab
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Run repeated Monte Carlo trials across QIGA and classical genetic & heuristic algorithms to record mean execution runtime, standard deviation, and feasibility rates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={benchmarkRunsCount}
                onChange={(e) => setBenchmarkRunsCount(parseInt(e.target.value))}
                className="px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-bold text-foreground"
              >
                <option value={3}>3 Repeated Runs</option>
                <option value={5}>5 Repeated Runs</option>
                <option value={10}>10 Repeated Runs</option>
              </select>

              <button
                type="button"
                onClick={runEmpiricalBenchmark}
                disabled={isBenchmarking}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all disabled:opacity-50"
              >
                {isBenchmarking ? 'Running Benchmarks...' : 'Execute Benchmarks'}
              </button>
            </div>
          </div>

          {/* Benchmark Statistical Table */}
          {benchmarkStats && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-muted-foreground font-bold uppercase text-[10px] border-b border-border">
                  <tr>
                    <th className="p-3">Algorithm</th>
                    <th className="p-3">Mean Runtime (ms)</th>
                    <th className="p-3">StdDev σ (ms)</th>
                    <th className="p-3">Mean Fleet TCO (₹)</th>
                    <th className="p-3">Mean Distance (km)</th>
                    <th className="p-3">Mean CO₂ (kg)</th>
                    <th className="p-3">Feasibility Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b border-border">
                  {Object.entries(benchmarkStats).map(([algId, stat]) => (
                    <tr key={algId} className={algId === 'qiga-fleet' ? 'bg-quantum-500/10 font-bold' : ''}>
                      <td className="p-3 text-foreground font-extrabold">
                        {algId === 'qiga-fleet' ? 'QIGA Fleet (Quantum-Inspired)' : algId}
                      </td>
                      <td className="p-3 text-foreground">{stat.meanTimeMs} ms</td>
                      <td className="p-3 text-muted-foreground">±{stat.stdDevTimeMs} ms</td>
                      <td className="p-3 text-quantum-600 dark:text-quantum-400 font-extrabold">₹{stat.meanCostInr}</td>
                      <td className="p-3 text-foreground">{stat.meanDistanceKm} km</td>
                      <td className="p-3 text-foreground">{stat.meanEmissionsKg} kg</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          {stat.feasibilityRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
