'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VehicleSelector } from '@/components/VehicleSelector';
import { ObjectiveSelector } from '@/components/ObjectiveSelector';
import { StatusBadge } from '@/components/StatusBadge';
import { DEFAULT_VEHICLE_PROFILES, calculateConsumptionAndCost } from '@/lib/algorithms/vehicleModels';
import { OBJECTIVE_PRESETS } from '@/lib/algorithms/costModel';
import { VehicleProfile, VehicleType, OptimizationObjective, ObjectiveWeights } from '@/lib/types';
import { formatCurrency, formatDistance, formatDuration, formatEmissions } from '@/lib/utils';
import {
  Sliders,
  Zap,
  Fuel,
  IndianRupee,
  Navigation,
  Clock,
  ShieldAlert,
  Info,
  Car,
  ChevronRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export default function AdvancedRoutePlannerPage() {
  const router = useRouter();

  // Vehicle profile state
  const [vehicleType, setVehicleType] = useState<VehicleType>('ev');
  const [profile, setProfile] = useState<VehicleProfile>(DEFAULT_VEHICLE_PROFILES.ev);

  // Objective state
  const [objective, setObjective] = useState<OptimizationObjective>('balanced');
  const [customWeights, setCustomWeights] = useState<ObjectiveWeights>(OBJECTIVE_PRESETS.balanced);

  // Operational preferences
  const [departureTime, setDepartureTime] = useState<string>('08:30');
  const [maxBudgetInr, setMaxBudgetInr] = useState<number>(300);
  const [avoidTolls, setAvoidTolls] = useState<boolean>(false);
  const [avoidHighways, setAvoidHighways] = useState<boolean>(false);
  const [estimatedTripDistanceKm, setEstimatedTripDistanceKm] = useState<number>(25);

  // Compute live preview metrics for the selected vehicle configuration
  const previewCalculation = calculateConsumptionAndCost(estimatedTripDistanceKm, 8, profile);

  const handleVehicleChange = (type: VehicleType, newProfile: VehicleProfile) => {
    setVehicleType(type);
    setProfile(newProfile);
  };

  const handleObjectiveChange = (obj: OptimizationObjective, weights: ObjectiveWeights) => {
    setObjective(obj);
    setCustomWeights(weights);
  };

  const handleLaunchDashboard = () => {
    router.push(`/dashboard?vehicle=${vehicleType}&objective=${objective}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-quantum-500/10 text-quantum-700 dark:text-quantum-300 border border-quantum-500/20 mb-2">
            <Sliders className="h-3 w-3" />
            <span>Multi-Constraint Optimization Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Advanced Route Planner & Powertrain Profiler
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Configure vehicle consumption physics, energy pricing, multi-objective trade-offs, and environmental constraints.
          </p>
        </div>

        <button
          onClick={handleLaunchDashboard}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all self-start md:self-auto"
        >
          <Navigation className="h-4 w-4 text-quantum-300" />
          <span>Apply to Live Navigation</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Config Controls */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Optimization Objective */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-quantum-500/10 text-quantum-600 flex items-center justify-center text-xs">
                1
              </span>
              Target Optimization Objective
            </h2>
            <p className="text-xs text-muted-foreground">
              Select which dimension QuantumRoute AI should prioritize when ranking Pareto-optimal corridors.
            </p>
            <ObjectiveSelector
              selectedObjective={objective}
              onSelectObjective={handleObjectiveChange}
              customWeights={customWeights}
              onWeightsChange={(w) => setCustomWeights(w)}
              showWeightsTuner={true}
            />
          </div>

          {/* Section 2: Vehicle Powertrain Profiling */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs">
                2
              </span>
              Powertrain & Energy Profile
            </h2>
            <VehicleSelector
              selectedType={vehicleType}
              onSelect={handleVehicleChange}
            />

            {/* Custom vehicle parameters tuner */}
            <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground flex items-center gap-1">
                  Rated Efficiency ({profile.efficiencyUnit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.efficiency}
                  onChange={(e) => setProfile({ ...profile, efficiency: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border"
                />
                <span className="text-[10px] text-muted-foreground">
                  {vehicleType === 'ev' ? 'Typical EV: 6.5 - 8.0 km/kWh' : 'Typical ICE: 12 - 20 km/L'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground flex items-center gap-1">
                  Energy Tariff (INR / unit)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={profile.fuelPrice}
                  onChange={(e) => setProfile({ ...profile, fuelPrice: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border"
                />
                <span className="text-[10px] text-muted-foreground">
                  {vehicleType === 'ev' ? 'EV Tariff: ₹6.5 - ₹10/kWh' : 'Fuel Rate: ₹80 - ₹105/L'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground flex items-center gap-1">
                  Emissions Factor (g CO₂/km)
                </label>
                <input
                  type="number"
                  step="1"
                  value={profile.emissionFactor}
                  onChange={(e) => setProfile({ ...profile, emissionFactor: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border"
                />
                <span className="text-[10px] text-muted-foreground">
                  {vehicleType === 'ev' ? 'Upstream grid factor (0 g tailpipe)' : 'Tailpipe combustion factor'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Route Constraints & Schedule */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs">
                3
              </span>
              Operational Constraints & Preferences
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Scheduled Departure Time
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border"
                />
                <span className="text-[10px] text-muted-foreground">
                  Peak traffic models apply between 08:00-11:00 and 17:00-20:30.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" /> Maximum Trip Budget (INR)
                </label>
                <input
                  type="number"
                  value={maxBudgetInr}
                  onChange={(e) => setMaxBudgetInr(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border"
                />
                <span className="text-[10px] text-muted-foreground">
                  Caps total fuel burn and cumulative expressway toll charges.
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={avoidTolls}
                  onChange={(e) => setAvoidTolls(e.target.checked)}
                  className="rounded border-border text-quantum-500 focus:ring-quantum-500"
                />
                <span>Avoid toll expressways (Provider supported)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={avoidHighways}
                  onChange={(e) => setAvoidHighways(e.target.checked)}
                  className="rounded border-border text-quantum-500 focus:ring-quantum-500"
                />
                <span>Avoid high-speed motorways (Engine supported)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Physics Model Preview Card & Provider Attribution */}
        <div className="space-y-6">
          {/* Live Physics Energy Preview */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-quantum-400 font-bold">
                Energy & Cost Preview
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-quantum-500/20 text-quantum-300 font-semibold border border-quantum-500/30">
                {profile.name}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Simulated Distance:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={estimatedTripDistanceKm}
                    onChange={(e) => setEstimatedTripDistanceKm(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-quantum-400"
                  />
                  <span className="font-bold text-white">{estimatedTripDistanceKm} km</span>
                </div>
              </div>

              <div className="h-px bg-slate-800 my-2" />

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">Units Consumed:</span>
                  <span className="font-bold text-quantum-300">
                    {previewCalculation.energyUsedUnits} {profile.efficiencyUnit.replace('km/', '')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-300">Estimated Cost:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {formatCurrency(previewCalculation.totalCostInr)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-300">CO₂ Carbon Footprint:</span>
                  <span className="font-semibold text-slate-200">
                    {formatEmissions(previewCalculation.emissionsKg)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-300">Traffic Congestion Surcharge:</span>
                  <span className="text-amber-400 font-semibold">
                    +{previewCalculation.congestionPenaltyPct}% idle loss
                  </span>
                </div>
              </div>
            </div>

            {/* EV Notice */}
            {vehicleType === 'ev' && (
              <div className="p-3 rounded-xl bg-quantum-500/10 border border-quantum-500/20 text-[11px] text-quantum-200 space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <Zap className="h-3 w-3 text-quantum-400" /> EV Specific Calculation
                </div>
                <p className="text-slate-300 leading-snug">
                  Zero tailpipe emissions. Upstream electric grid carbon factor modeled at 52 g/km.
                  Regenerative braking energy recaptured during deceleration.
                </p>
              </div>
            )}
          </div>

          {/* Real-Time System Telemetry & Capabilities */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-quantum-500" /> Live Engine Telemetry
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-900 border border-border/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Geospatial Road Network</span>
                  <StatusBadge status="LIVE" showIcon={false} className="py-0 px-1 text-[9px]" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  High-resolution road topology, multi-lane classifications, and interactive path vectors.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-900 border border-border/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Atmospheric Air Quality Telemetry</span>
                  <StatusBadge status="LIVE" showIcon={false} className="py-0 px-1 text-[9px]" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Real-time US & European AQI, PM2.5, PM10, and NO₂ for eco-routing and passenger health analysis.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-900 border border-border/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Dynamic Energy & Fuel Indexing</span>
                  <StatusBadge status="LIVE" showIcon={false} className="py-0 px-1 text-[9px]" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Official daily petrol, diesel, and CNG tariffs for multi-powertrain trip pricing.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-900 border border-border/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">EV Fast Charging Network</span>
                  <StatusBadge status="LIVE" showIcon={false} className="py-0 px-1 text-[9px]" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Fast DC charging hubs (50-120 kW), plug types (CCS2, Type-2), and operator availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
