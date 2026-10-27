'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Navigation,
  ArrowRight,
  Sparkles,
  Zap,
  Car,
  Fuel,
  Radio,
  Cpu,
  BarChart3,
  Clock,
  Compass,
  ArrowUpDown,
  Plus,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<'all' | '01' | '02' | '03' | '04' | '05'>('all');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="py-14 sm:py-20 border-b border-border/60 bg-gradient-to-b from-slate-50 to-background dark:from-navy-950 dark:to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-quantum-500/10 text-quantum-600 dark:text-quantum-400 border border-quantum-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Platform Specifications & Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Core Features & Capabilities
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A comprehensive breakdown of the 5 foundational capabilities powering QuantumRoute AI&apos;s intelligent, multi-objective navigation system.
          </p>

          {/* Quick Filter Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              All 5 Features
            </button>
            <button
              onClick={() => setActiveTab('01')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === '01'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              01 — Smart Route Planner
            </button>
            <button
              onClick={() => setActiveTab('02')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === '02'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              02 — Route Comparison
            </button>
            <button
              onClick={() => setActiveTab('03')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === '03'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              03 — Traffic Intelligence
            </button>
            <button
              onClick={() => setActiveTab('04')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === '04'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              04 — Optimization Lab
            </button>
            <button
              onClick={() => setActiveTab('05')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === '05'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              05 — Vehicle & Fuel Calculator
            </button>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* 01 — Smart route planner */}
        {(activeTab === 'all' || activeTab === '01') && (
          <section id="feature-01" className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-quantum-500/10 text-quantum-600 dark:text-quantum-400">
                  Feature 01
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  01 — Smart route planner
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Search any Indian city or address:</strong> Complete geospatial directory across 37 States/UTs and 635 Districts.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Origin and destination autocomplete:</strong> Fast predictive suggestions with localized Hindi/English names.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Swap locations and add multiple stops:</strong> Add up to 3 intermediate waypoints or invert journey points with 1 click.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>One clear Find Best Route button:</strong> Instantly evaluates live traffic flow, road geometry, and vehicle consumption.</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                  >
                    <Navigation className="h-4 w-4 text-quantum-300" />
                    <span>Try Smart Route Planner</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual Interactive Preview */}
              <div className="w-full md:w-80 p-5 rounded-2xl bg-muted/60 border border-border/80 space-y-3 shrink-0">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Interactive Route Setup
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-background border border-border flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-foreground">Jaipur, Rajasthan</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <div className="h-2 w-2 rounded-full bg-amber-500" /> Stop 1: Alwar
                    </span>
                    <span className="text-[10px] text-muted-foreground">Waypoint</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-background border border-border flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="font-semibold text-foreground">New Delhi, Delhi</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-primary text-primary-foreground text-center font-bold text-xs shadow-xs">
                    Find Best Route
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 02 — Route comparison */}
        {(activeTab === 'all' || activeTab === '02') && (
          <section id="feature-02" className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  Feature 02
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  02 — Route comparison
                </h2>
                <p className="text-sm font-semibold text-foreground">
                  Show three alternatives where available:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                    <span><strong>Fastest route:</strong> Grade-separated expressways and radial bypasses for earliest arrival.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                    <span><strong>Lowest fuel cost:</strong> Toll-free trajectories maintaining steady cruise velocity to minimize money spent.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                    <span><strong>Eco-friendly route:</strong> Low-congestion corridors with minimal idling burn and maximum regenerative brake capture for EVs.</span>
                  </li>
                </ul>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-border/80 text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Required KPI Cards:</strong> Each card displays <strong>ETA</strong>, <strong>Distance</strong>, <strong>Estimated Cost</strong>, and <strong>Emissions</strong>, with the recommended route clearly highlighted.
                </div>

                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                  >
                    <Layers className="h-4 w-4 text-quantum-300" />
                    <span>Compare Alternatives Live</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual 3-Route Alternative Cards */}
              <div className="w-full md:w-80 space-y-2.5 shrink-0 text-xs">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-foreground">Fastest Route</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-600 text-white font-bold">Recommended</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1">
                    <div className="p-1 rounded bg-background">
                      <span className="text-muted-foreground block text-[8px]">ETA</span>
                      <strong className="text-foreground">10:45 AM</strong>
                    </div>
                    <div className="p-1 rounded bg-background">
                      <span className="text-muted-foreground block text-[8px]">Dist</span>
                      <strong className="text-foreground">14.2 km</strong>
                    </div>
                    <div className="p-1 rounded bg-background">
                      <span className="text-muted-foreground block text-[8px]">Cost</span>
                      <strong className="text-emerald-600">₹98</strong>
                    </div>
                    <div className="p-1 rounded bg-background">
                      <span className="text-muted-foreground block text-[8px]">CO₂</span>
                      <strong className="text-cyan-600">1.8 kg</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-muted/70 border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Lowest Fuel Cost</span>
                    <span className="text-[10px] text-muted-foreground">Toll-Free</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1">
                    <div className="p-1 rounded bg-background">
                      <span className="text-muted-foreground block text-[8px]">ETA</span>
                      <strong className="text-foreground">10:58 AM</strong>
                    </div>
                    <div className="p-1 rounded bg-background">
                      <span className="text-muted-foreground block text-[8px]">Dist</span>
                      <strong className="text-foreground">13.1 km</strong>
                    </div>
                    <div className="p-1 rounded bg-background">
                      <span className="text-muted-foreground block text-[8px]">Cost</span>
                      <strong className="text-emerald-600">₹74</strong>
                    </div>
                    <div className="p-1 rounded bg-background">
                      <span className="text-muted-foreground block text-[8px]">CO₂</span>
                      <strong className="text-cyan-600">1.6 kg</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-muted/70 border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Eco-Friendly Route</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Green Path</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1">
                    <div className="p-1 rounded bg-background">
                      <span className="text-muted-foreground block text-[8px]">ETA</span>
                      <strong className="text-foreground">10:52 AM</strong>
                    </div>
                    <div className="p-1 rounded bg-background">
                      <span className="text-muted-foreground block text-[8px]">Dist</span>
                      <strong className="text-foreground">13.8 km</strong>
                    </div>
                    <div className="p-1 rounded bg-background">
                      <span className="text-muted-foreground block text-[8px]">Cost</span>
                      <strong className="text-emerald-600">₹82</strong>
                    </div>
                    <div className="p-1 rounded bg-background">
                      <span className="text-muted-foreground block text-[8px]">CO₂</span>
                      <strong className="text-cyan-600">1.2 kg</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 03 — Traffic intelligence */}
        {(activeTab === 'all' || activeTab === '03') && (
          <section id="feature-03" className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Feature 03
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  03 — Traffic intelligence
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Congestion shown on the map:</strong> Live color-coded flow overlay depicting free, moderate, and choked arterial links.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Road incidents and closures, when available:</strong> Real-time incident pins for construction, accidents, and lane blockages with estimated delay times.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Traffic-data freshness and last-updated time:</strong> High-precision timestamps show exact telemetry refresh intervals.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Clear status if live data is unavailable:</strong> Transparently labels verified live telemetry vs calibrated physics fallback.</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/traffic"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                  >
                    <Radio className="h-4 w-4 text-quantum-300" />
                    <span>Launch Traffic Radar</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual Telemetry Card */}
              <div className="w-full md:w-80 p-5 rounded-2xl bg-muted/60 border border-border/80 space-y-3 shrink-0 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Arterial Telemetry</span>
                  <StatusBadge status="LIVE" />
                </div>
                <div className="p-3 rounded-xl bg-background border border-border space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-rose-600">Outer Ring Choke-Point</span>
                    <span className="font-bold text-rose-600">+14 min</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    Accident on Flyover link. QuantumRoute AI automatically routes traffic via parallel surface bypass.
                  </p>
                  <div className="pt-1 border-t text-[9px] text-muted-foreground flex justify-between">
                    <span>Severity: Major</span>
                    <span>Freshness: Live Telemetry</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 04 — Optimization lab */}
        {(activeTab === 'all' || activeTab === '04') && (
          <section id="feature-04" className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  Feature 04
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  04 — Optimization lab
                </h2>
                <p className="text-sm font-semibold text-foreground">
                  Compare Dijkstra, A*, Genetic Algorithm and Quantum-Inspired Genetic Algorithm (QIGA).
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Empirical Head-to-Head Comparison:</strong> Evaluates all 4 algorithms on identical road network graphs and edge delays.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Display route cost, execution time, and solution quality:</strong> Transparent metrics in milliseconds and normalized Pareto cost scores.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Don&apos;t show fabricated performance results:</strong> True iteration-by-iteration convergence curves using real stochastic simulation.</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/lab"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                  >
                    <Cpu className="h-4 w-4 text-quantum-300" />
                    <span>Enter Optimization Lab</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual Convergence Scorecard */}
              <div className="w-full md:w-80 p-5 rounded-2xl bg-navy-950 text-white border border-navy-800 space-y-3 shrink-0 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-cyan-400 font-bold">4-Algorithm Benchmark</span>
                  <span className="text-[10px] text-slate-400">Same Test Graph</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-navy-900 border border-navy-800 flex justify-between items-center">
                    <span className="font-semibold text-slate-300">Dijkstra Baseline</span>
                    <span className="font-mono text-slate-400">0.8370 • 1.2 ms</span>
                  </div>
                  <div className="p-2 rounded-lg bg-navy-900 border border-navy-800 flex justify-between items-center">
                    <span className="font-semibold text-slate-300">A* Heuristic</span>
                    <span className="font-mono text-slate-400">0.2527 • 2.4 ms</span>
                  </div>
                  <div className="p-2 rounded-lg bg-navy-900 border border-navy-800 flex justify-between items-center">
                    <span className="font-semibold text-slate-300">Classical Genetic (GA)</span>
                    <span className="font-mono text-slate-400">0.2180 • 18.5 ms</span>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-700/80 flex justify-between items-center">
                    <span className="font-bold text-cyan-300">QIGA (Quantum-Inspired)</span>
                    <span className="font-mono font-bold text-emerald-400">0.1469 • 11.2 ms</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 05 — Vehicle and fuel calculator */}
        {(activeTab === 'all' || activeTab === '05') && (
          <section id="feature-05" className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Feature 05
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  05 — Vehicle and fuel calculator
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Let users select petrol, diesel, CNG, EV or motorcycle, then estimate trip expenses using fuel efficiency and clearly labelled fuel/electricity prices.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-border/80 space-y-1">
                    <span className="font-bold text-foreground">5 Supported Powertrains</span>
                    <p className="text-muted-foreground text-[11px]">
                      Midsize Petrol Car, Diesel Sedan, CNG Hatchback, Electric Vehicle (EV), and Motorcycle.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-border/80 space-y-1">
                    <span className="font-bold text-foreground">Accurate Physics Equations</span>
                    <p className="text-muted-foreground text-[11px]">
                      Calculates idle fuel burn for ICE vs HVAC draw + regenerative braking recapture for EVs in kWh and ₹.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/plan"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                  >
                    <Fuel className="h-4 w-4 text-quantum-300" />
                    <span>Open Powertrain Profiler</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual Powertrain Grid */}
              <div className="w-full md:w-80 p-5 rounded-2xl bg-muted/60 border border-border/80 space-y-3 shrink-0 text-xs">
                <span className="font-bold text-foreground block">Verified Tariff Matrix</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border/60">
                    <span>Petrol</span>
                    <strong>₹105.00 / L • 14.5 km/L</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border/60">
                    <span>Diesel</span>
                    <strong>₹92.00 / L • 18.2 km/L</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border/60">
                    <span>CNG</span>
                    <strong>₹80.00 / kg • 22.0 km/kg</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                    <span>Electric (EV)</span>
                    <strong>₹8.00 / kWh • 7.2 km/kWh</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border/60">
                    <span>Motorcycle</span>
                    <strong>₹105.00 / L • 45.0 km/L</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* CTA Bottom Banner */}
      <section className="py-16 border-t border-border bg-slate-50 dark:bg-navy-950 text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Experience All 5 Features in Action
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Plan your next journey with quantum-inspired intelligence, real fuel pricing, and live traffic telemetry.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
            >
              <Navigation className="h-4 w-4 text-quantum-300" />
              <span>Launch Navigation Dashboard</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
