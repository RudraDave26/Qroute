'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Car,
  Bike,
  ChevronRight,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Info,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface PowertrainCardData {
  type: VehicleType;
  title: string;
  category: string;
  badge: string;
  icon: any;
  color: string;
  accentBg: string;
  baseEfficiency: number;
  efficiencyUnit: string;
  fuelRate: number;
  rateUnit: string;
  emissionFactor: number;
}

const ALL_POWERTRAINS: PowertrainCardData[] = [
  {
    type: 'ev',
    title: 'Electric Vehicle (EV)',
    category: 'Zero Tailpipe Emissions',
    badge: 'Lowest Running Cost 🏆',
    icon: Zap,
    color: 'text-emerald-500',
    accentBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    baseEfficiency: 7.2,
    efficiencyUnit: 'km/kWh',
    fuelRate: 8.0,
    rateUnit: '₹/kWh',
    emissionFactor: 52,
  },
  {
    type: 'cng',
    title: 'CNG Vehicle',
    category: 'Compressed Natural Gas',
    badge: 'Economical Gas Option',
    icon: Fuel,
    color: 'text-sky-500',
    accentBg: 'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300',
    baseEfficiency: 22.0,
    efficiencyUnit: 'km/kg',
    fuelRate: 80.0,
    rateUnit: '₹/kg',
    emissionFactor: 120,
  },
  {
    type: 'diesel',
    title: 'Diesel Sedan / SUV',
    category: 'High Torque & Mileage',
    badge: 'Highway Cruiser',
    icon: Car,
    color: 'text-amber-500',
    accentBg: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
    baseEfficiency: 18.2,
    efficiencyUnit: 'km/L',
    fuelRate: 92.0,
    rateUnit: '₹/L',
    emissionFactor: 172,
  },
  {
    type: 'petrol',
    title: 'Midsize Petrol Car',
    category: 'Internal Combustion Engine',
    badge: 'Baseline ICE',
    icon: Car,
    color: 'text-rose-500',
    accentBg: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300',
    baseEfficiency: 14.5,
    efficiencyUnit: 'km/L',
    fuelRate: 105.0,
    rateUnit: '₹/L',
    emissionFactor: 160,
  },
  {
    type: 'motorcycle',
    title: '150cc Motorcycle',
    category: 'Two-Wheeler Commuter',
    badge: 'Agile & Efficient',
    icon: Bike,
    color: 'text-indigo-500',
    accentBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300',
    baseEfficiency: 45.0,
    efficiencyUnit: 'km/L',
    fuelRate: 105.0,
    rateUnit: '₹/L',
    emissionFactor: 68,
  },
];

export default function AdvancedRoutePlannerPage() {
  const router = useRouter();

  // Active Vehicle profile state
  const [vehicleType, setVehicleType] = useState<VehicleType>('ev');
  const [profile, setProfile] = useState<VehicleProfile>(DEFAULT_VEHICLE_PROFILES.ev);

  // Objective state
  const [objective, setObjective] = useState<OptimizationObjective>('balanced');
  const [customWeights, setCustomWeights] = useState<ObjectiveWeights>(OBJECTIVE_PRESETS.balanced);

  // Operational preferences & test simulation parameters
  const [departureTime, setDepartureTime] = useState<string>('08:30');
  const [maxBudgetInr, setMaxBudgetInr] = useState<number>(300);
  const [avoidTolls, setAvoidTolls] = useState<boolean>(false);
  const [avoidHighways, setAvoidHighways] = useState<boolean>(false);

  // Vehicle fuel cost calculation parameters
  const [simDistanceKm, setSimDistanceKm] = useState<number>(25);
  const [trafficDelayMin, setTrafficDelayMin] = useState<number>(10);
  const [commuteDaysPerMonth, setCommuteDaysPerMonth] = useState<number>(22);
  const [isCustomRatesOpen, setIsCustomRatesOpen] = useState<boolean>(false);

  // Editable fuel tariffs state
  const [fuelPrices, setFuelPrices] = useState<Record<VehicleType, number>>({
    ev: 8.0,
    cng: 80.0,
    diesel: 92.0,
    petrol: 105.0,
    motorcycle: 105.0,
    custom: 100.0,
  });

  // Editable vehicle efficiencies state
  const [efficiencies, setEfficiencies] = useState<Record<VehicleType, number>>({
    ev: 7.2,
    cng: 22.0,
    diesel: 18.2,
    petrol: 14.5,
    motorcycle: 45.0,
    custom: 15.0,
  });

  // Calculate costs across all 5 vehicle powertrains dynamically
  const powertrainComparisons = useMemo(() => {
    return ALL_POWERTRAINS.map((item) => {
      const activePrice = fuelPrices[item.type] ?? item.fuelRate;
      const activeEff = efficiencies[item.type] ?? item.baseEfficiency;

      const tempProfile: VehicleProfile = {
        ...DEFAULT_VEHICLE_PROFILES[item.type],
        fuelPrice: activePrice,
        efficiency: activeEff,
      };

      const calc = calculateConsumptionAndCost(simDistanceKm, trafficDelayMin, tempProfile);
      const costPerKm = simDistanceKm > 0 ? calc.totalCostInr / simDistanceKm : 0;
      const roundTripCost = calc.totalCostInr * 2;
      const monthlyExpenditure = roundTripCost * commuteDaysPerMonth;
      const annualExpenditure = monthlyExpenditure * 12;

      return {
        ...item,
        profile: tempProfile,
        calc,
        costPerKm,
        monthlyExpenditure,
        annualExpenditure,
      };
    });
  }, [simDistanceKm, trafficDelayMin, commuteDaysPerMonth, fuelPrices, efficiencies]);

  // Baseline petrol cost for savings computation
  const petrolComparison = powertrainComparisons.find((p) => p.type === 'petrol');
  const baselineCost = petrolComparison?.calc.totalCostInr ?? 200;
  const baselineMonthly = petrolComparison?.monthlyExpenditure ?? 8800;

  // Single active profile preview
  const activeCalculation = calculateConsumptionAndCost(simDistanceKm, trafficDelayMin, profile);

  const handleSelectPowertrain = (type: VehicleType) => {
    setVehicleType(type);
    const updated = {
      ...DEFAULT_VEHICLE_PROFILES[type],
      fuelPrice: fuelPrices[type] ?? DEFAULT_VEHICLE_PROFILES[type].fuelPrice,
      efficiency: efficiencies[type] ?? DEFAULT_VEHICLE_PROFILES[type].efficiency,
    };
    setProfile(updated);
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
            Advanced Route Planner & Vehicle Cost Profiler
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Simulate fuel and energy expenditures across Electric (EV), CNG, Diesel, and Petrol powertrains under real-time urban congestion.
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
        {/* Left 2 Columns: Fuel Cost Feature & Route Controls */}
        <div className="lg:col-span-2 space-y-8">
          {/* FEATURE SECTION: Type of Vehicle Fuel Cost Analyzer */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 mb-1">
                  <Fuel className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Feature: Vehicle Powertrain Fuel Cost Comparison</span>
                </div>
                <h2 className="text-xl font-extrabold text-foreground">
                  Compare Trip & Commute Fuel Costs by Vehicle Type
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomRatesOpen(!isCustomRatesOpen)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-foreground border border-border transition-colors self-start sm:self-auto"
              >
                {isCustomRatesOpen ? 'Hide Rate Adjuster' : 'Customize Fuel Tariffs'}
              </button>
            </div>

            {/* Distance & Traffic Delay Simulation Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Distance Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Navigation className="h-3.5 w-3.5 text-quantum-500" />
                      Trip Distance: <strong>{simDistanceKm} km</strong>
                    </span>
                    <span className="text-[11px] text-muted-foreground">Range: 5–150 km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="1"
                    value={simDistanceKm}
                    onChange={(e) => setSimDistanceKm(parseFloat(e.target.value) || 5)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-quantum-600"
                  />
                  {/* Quick Distance Presets */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                    {[10, 25, 45, 75].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSimDistanceKm(d)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors ${
                          simDistanceKm === d
                            ? 'bg-quantum-500 text-white border-quantum-500'
                            : 'bg-card text-muted-foreground hover:bg-muted border-border'
                        }`}
                      >
                        {d} km
                      </button>
                    ))}
                  </div>
                </div>

                {/* Traffic Congestion Delay Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      Traffic Jam Delay: <strong>{trafficDelayMin} min</strong>
                    </span>
                    <span className="text-[11px] text-muted-foreground">Idling penalty</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={trafficDelayMin}
                    onChange={(e) => setTrafficDelayMin(parseFloat(e.target.value) || 0)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <span>0 min (Free flow)</span>
                    <span>30 min (Peak rush)</span>
                    <span>60 min (Gridlock)</span>
                  </div>
                </div>
              </div>

              {/* Traffic idling physics tip */}
              <div className="p-3 rounded-xl bg-card border border-border/70 flex items-start gap-2.5 text-xs">
                <Info className="h-4 w-4 text-quantum-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong>Engine Physics in Congestion:</strong> Petrol & diesel engines consume ~1.1 L/hour while idling in stop-and-go jams.
                  In contrast, Electric Vehicles consume only 1.2 kW for air conditioning (HVAC) and recover energy through regenerative braking.
                </p>
              </div>
            </div>

            {/* Optional Custom Fuel Tariffs Tuner */}
            {isCustomRatesOpen && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-amber-500" /> Live Fuel Tariffs & Mileage Customizer
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setFuelPrices({ ev: 8.0, cng: 80.0, diesel: 92.0, petrol: 105.0, motorcycle: 105.0, custom: 100.0 });
                      setEfficiencies({ ev: 7.2, cng: 22.0, diesel: 18.2, petrol: 14.5, motorcycle: 45.0, custom: 15.0 });
                    }}
                    className="text-[10px] font-semibold text-quantum-600 dark:text-quantum-400 hover:underline"
                  >
                    Reset to City Defaults
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-semibold text-foreground block text-[11px]">Petrol (₹/L)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={fuelPrices.petrol}
                      onChange={(e) => setFuelPrices({ ...fuelPrices, petrol: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 rounded bg-background border border-border text-xs font-bold"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Mileage: {efficiencies.petrol} km/L
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-semibold text-foreground block text-[11px]">Diesel (₹/L)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={fuelPrices.diesel}
                      onChange={(e) => setFuelPrices({ ...fuelPrices, diesel: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 rounded bg-background border border-border text-xs font-bold"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Mileage: {efficiencies.diesel} km/L
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-semibold text-foreground block text-[11px]">CNG (₹/kg)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={fuelPrices.cng}
                      onChange={(e) => setFuelPrices({ ...fuelPrices, cng: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 rounded bg-background border border-border text-xs font-bold"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Mileage: {efficiencies.cng} km/kg
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-semibold text-foreground block text-[11px]">EV Tariff (₹/kWh)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={fuelPrices.ev}
                      onChange={(e) => setFuelPrices({ ...fuelPrices, ev: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 rounded bg-background border border-border text-xs font-bold"
                    />
                    <span className="text-[10px] text-muted-foreground block">
                      Efficiency: {efficiencies.ev} km/kWh
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Powertrain Fuel Cost Comparison Cards (5 Vehicles) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Select a Powertrain to Profile:</span>
                <span>Calculated for {simDistanceKm} km with +{trafficDelayMin}m jam</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {powertrainComparisons.map((item) => {
                  const isSelected = vehicleType === item.type;
                  const Icon = item.icon;
                  const savingsOnTrip = baselineCost - item.calc.totalCostInr;
                  const savingsPct = baselineCost > 0 ? Math.round((savingsOnTrip / baselineCost) * 100) : 0;

                  return (
                    <div
                      key={item.type}
                      onClick={() => handleSelectPowertrain(item.type)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                        isSelected
                          ? 'border-quantum-500 bg-quantum-500/5 ring-2 ring-quantum-500/20 shadow-md'
                          : 'border-border bg-card hover:border-slate-300 dark:hover:border-navy-700 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Header with Icon and Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${item.accentBg}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-foreground">{item.title}</h4>
                              <p className="text-[10px] text-muted-foreground">{item.category}</p>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="h-5 w-5 rounded-full bg-quantum-500 text-white flex items-center justify-center shrink-0">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>

                        {/* Top Badge */}
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${item.accentBg}`}>
                          {item.badge}
                        </span>

                        {/* Cost Display */}
                        <div className="pt-2 border-t border-border/50">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                            Trip Fuel Cost
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-2xl font-extrabold text-foreground">
                              {formatCurrency(item.calc.totalCostInr)}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              (₹{item.costPerKm.toFixed(2)}/km)
                            </span>
                          </div>
                        </div>

                        {/* Units & Emissions */}
                        <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Fuel Consumed</span>
                            <span className="font-bold text-foreground">
                              {item.calc.energyUsedUnits} {item.efficiencyUnit.replace('km/', '')}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">CO₂ Emissions</span>
                            <span className="font-bold text-foreground">
                              {formatEmissions(item.calc.emissionsKg)}
                            </span>
                          </div>
                        </div>

                        {/* Savings Badge vs Petrol */}
                        {item.type !== 'petrol' && savingsOnTrip > 0 && (
                          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-between">
                            <span>Saves vs Petrol:</span>
                            <span>{formatCurrency(savingsOnTrip)} (-{savingsPct}%)</span>
                          </div>
                        )}
                      </div>

                      {/* Action selector */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPowertrain(item.type);
                        }}
                        className={`mt-3 w-full py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-quantum-600 text-white'
                            : 'bg-muted hover:bg-slate-200 dark:hover:bg-navy-800 text-foreground'
                        }`}
                      >
                        {isSelected ? '✓ Active Selection' : 'Select Vehicle'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Commute Cost & Annual Savings Forecaster */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-navy-900 dark:via-navy-950 dark:to-navy-900 border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      Monthly & Annual Commute Cost Projections
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Based on {commuteDaysPerMonth} working days/month (round-trip of {simDistanceKm * 2} km/day)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground text-[11px]">Workdays:</span>
                  <select
                    value={commuteDaysPerMonth}
                    onChange={(e) => setCommuteDaysPerMonth(parseInt(e.target.value) || 22)}
                    className="px-2 py-1 rounded-lg bg-card border border-border text-xs font-bold text-foreground"
                  >
                    <option value={15}>15 days (Hybrid)</option>
                    <option value={20}>20 days</option>
                    <option value={22}>22 days (Standard)</option>
                    <option value={26}>26 days (Full-time)</option>
                  </select>
                </div>
              </div>

              {/* Progress bars showing comparative monthly cost */}
              <div className="space-y-2.5 pt-1">
                {powertrainComparisons.map((item) => {
                  const maxMonthly = baselineMonthly * 1.05;
                  const barWidth = Math.min(100, Math.max(12, Math.round((item.monthlyExpenditure / (maxMonthly || 1)) * 100)));
                  const annualSavings = (baselineMonthly - item.monthlyExpenditure) * 12;

                  return (
                    <div key={item.type} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <span>{item.title}</span>
                          {vehicleType === item.type && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-quantum-500 text-white font-bold">
                              Selected
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-foreground">
                            {formatCurrency(item.monthlyExpenditure)} / mo
                          </span>
                          <span className="text-[11px] text-muted-foreground hidden sm:inline">
                            ({formatCurrency(item.annualExpenditure)} / yr)
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-navy-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.type === 'ev'
                              ? 'bg-emerald-500'
                              : item.type === 'cng'
                              ? 'bg-sky-500'
                              : item.type === 'diesel'
                              ? 'bg-amber-500'
                              : item.type === 'motorcycle'
                              ? 'bg-indigo-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>

                      {item.type !== 'petrol' && annualSavings > 0 && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold text-right">
                          Save {formatCurrency(annualSavings)} every year compared to Petrol!
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 1: Target Optimization Objective */}
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
                <span>Avoid toll expressways</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={avoidHighways}
                  onChange={(e) => setAvoidHighways(e.target.checked)}
                  className="rounded border-border text-quantum-500 focus:ring-quantum-500"
                />
                <span>Avoid high-speed motorways</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Active Profile Telemetry & Live Preview */}
        <div className="space-y-6">
          {/* Active Powertrain Physics Preview Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-quantum-400 font-bold">
                Active Vehicle Preview
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-quantum-500/20 text-quantum-300 font-semibold border border-quantum-500/30">
                {profile.name}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Simulated Distance:</span>
                <span className="font-bold text-white">{simDistanceKm} km</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Traffic Congestion Delay:</span>
                <span className="font-bold text-amber-400">+{trafficDelayMin} min jam</span>
              </div>

              <div className="h-px bg-slate-800 my-2" />

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">Fuel / Units Consumed:</span>
                  <span className="font-bold text-quantum-300">
                    {activeCalculation.energyUsedUnits} {profile.efficiencyUnit.replace('km/', '')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-300">Total Trip Energy Cost:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {formatCurrency(activeCalculation.totalCostInr)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-300">Effective Cost Rate:</span>
                  <span className="font-semibold text-slate-200">
                    ₹{(activeCalculation.totalCostInr / (simDistanceKm || 1)).toFixed(2)} / km
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-300">CO₂ Carbon Footprint:</span>
                  <span className="font-semibold text-slate-200">
                    {formatEmissions(activeCalculation.emissionsKg)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-300">Congestion Idling Penalty:</span>
                  <span className="text-amber-400 font-semibold">
                    +{activeCalculation.congestionPenaltyPct}% idle loss
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

            {/* Launch navigation CTA */}
            <button
              type="button"
              onClick={handleLaunchDashboard}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs bg-quantum-500 hover:bg-quantum-400 text-white shadow-md transition-all"
            >
              <span>Use This Vehicle in Navigation</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Real-Time System Telemetry & Capabilities */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-quantum-500" /> Live Engine Telemetry
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-900 border border-border/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Dynamic Powertrain Engine</span>
                  <StatusBadge status="LIVE" showIcon={false} className="py-0 px-1 text-[9px]" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  EV, CNG, Diesel, Petrol, and Motorcycle physics with traffic delay idle consumption curves.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-900 border border-border/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Energy Tariff Benchmark</span>
                  <StatusBadge status="LIVE" showIcon={false} className="py-0 px-1 text-[9px]" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Official metropolitan petrol, diesel, CNG rates, and state electric utility charging tariffs.
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
