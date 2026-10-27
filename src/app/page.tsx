'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Atom,
  Navigation,
  Cpu,
  Zap,
  TrendingDown,
  ShieldCheck,
  Compass,
  ArrowRight,
  Layers,
  Fuel,
  Activity,
  BarChart,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-slate-50 via-background to-background dark:from-navy-950 dark:via-background dark:to-background border-b border-border/40">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-quantum-400/10 dark:bg-quantum-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-quantum-500/10 text-quantum-700 dark:text-quantum-300 border border-quantum-500/20 shadow-xs"
            >
              <Atom className="h-3.5 w-3.5 text-quantum-500 animate-spin-slow" />
              <span>Next-Gen Metaheuristic Traffic Optimization • Team MVP MAKERS</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]"
            >
              Smarter Routes.{' '}
              <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 dark:from-cyan-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Lower Costs.
              </span>{' '}
              Better Journeys.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Navigate complex urban congestion with multi-objective intelligence. QuantumRoute AI simulates
              Quantum-Inspired Genetic Algorithms (QIGA) alongside classical baselines to simultaneously optimize
              travel time, fuel expenditures, EV battery depletion, and carbon emissions.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
            >
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                <Navigation className="h-4 w-4 text-quantum-300" />
                <span>Plan a Route</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/lab"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-secondary/15 hover:bg-secondary/25 text-foreground border border-secondary/30 transition-all hover:-translate-y-0.5"
              >
                <Cpu className="h-4 w-4 text-quantum-600 dark:text-quantum-400" />
                <span>Explore Optimization Lab</span>
              </Link>
            </motion.div>

            {/* Data Source Transparency Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-4 flex-wrap"
            >
              <div className="flex items-center gap-1.5">
                <StatusBadge status="LIVE" label="OpenStreetMap" />
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status="DEMO" label="Traffic Physics Engine" />
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status="LIVE" label="Open-Meteo Weather" />
              </div>
            </motion.div>
          </div>

          {/* Interactive Route Comparison Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 max-w-4xl mx-auto rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
          >
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-quantum-400 font-bold">
                  Live Multi-Objective Snapshot
                </span>
                <h3 className="text-lg font-bold">Koramangala 4th Block → Whitefield ITPL</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-quantum-500/20 text-quantum-300 font-semibold border border-quantum-500/30">
                  Electric Vehicle (EV)
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Pareto Balanced
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-card">
              {/* Route Alternative 1: QIGA */}
              <div className="p-4 rounded-xl border-2 border-quantum-500 bg-quantum-500/5 relative space-y-3">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-quantum-500 text-white">
                  <Sparkles className="h-3 w-3" /> Recommended (QIGA)
                </div>
                <div>
                  <h4 className="font-bold text-foreground">HAL Outer Radial Corridor</h4>
                  <p className="text-xs text-muted-foreground">Quantum-converged bypass</p>
                </div>
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-bold text-foreground">42 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-semibold text-foreground">17.8 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EV Electricity Cost:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹19.8 (2.5 kWh)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CO₂ Impact:</span>
                    <span className="font-semibold text-foreground">0.92 kg CO₂</span>
                  </div>
                </div>
              </div>

              {/* Route Alternative 2: Expressway */}
              <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                <span className="inline-block text-[10px] font-semibold text-muted-foreground uppercase">
                  Expressway Route (Dijkstra)
                </span>
                <div>
                  <h4 className="font-bold text-foreground">NH-44 Toll Expressway</h4>
                  <p className="text-xs text-muted-foreground">Nominally fastest highway</p>
                </div>
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold text-foreground">47 min (+5 min jam)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-semibold text-foreground">22.4 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost (incl. Toll):</span>
                    <span className="font-semibold text-foreground">₹114.8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CO₂ Impact:</span>
                    <span className="font-semibold text-foreground">1.16 kg CO₂</span>
                  </div>
                </div>
              </div>

              {/* Route Alternative 3: Surface */}
              <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                <span className="inline-block text-[10px] font-semibold text-muted-foreground uppercase">
                  Surface Shortest (A*)
                </span>
                <div>
                  <h4 className="font-bold text-foreground">Old Airport Surface Trunk</h4>
                  <p className="text-xs text-muted-foreground">Minimal physical km</p>
                </div>
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold text-foreground">56 min (+14 min jam)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-semibold text-foreground">15.9 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EV Electricity Cost:</span>
                    <span className="font-semibold text-foreground">₹24.0 (Idle HVAC)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CO₂ Impact:</span>
                    <span className="font-semibold text-foreground">0.83 kg CO₂</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Core Pillars / Feature Cards */}
      <section className="py-16 md:py-24 bg-card border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-quantum-600 dark:text-quantum-400">
              Innovative Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-foreground">
              Why Quantum-Inspired Metaheuristics?
            </h2>
            <p className="text-sm text-muted-foreground">
              Standard GPS routing optimizes exclusively for single metrics like distance or time.
              QuantumRoute AI optimizes the unified cost equation across multiple constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-background border border-border/80 shadow-xs hover:border-quantum-500/50 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-quantum-500/10 text-quantum-600 dark:text-quantum-400 flex items-center justify-center">
                <Atom className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Q-Bit Superposition</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Represents combinatorial route alternatives via probability amplitudes $[\alpha, \beta]^T$ where
                $|\alpha|^2 + |\beta|^2 = 1$, enabling high exploration with compact population sizes.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-background border border-border/80 shadow-xs hover:border-quantum-500/50 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">EV & Fuel Physics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Accurately models ICE stop-and-go idle fuel burn vs EV regenerative braking and HVAC overhead in kWh,
                without confusing petrol liters with electricity.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-background border border-border/80 shadow-xs hover:border-quantum-500/50 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Live Traffic Flow</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Integrates TomTom Traffic Flow and Incident feeds with transparent badges (LIVE, CACHED, DEMO)
                so verified data is never misrepresented.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-background border border-border/80 shadow-xs hover:border-quantum-500/50 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BarChart className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">4-Algorithm Lab</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct head-to-head comparison of Dijkstra, A*, Classical GA, and QIGA under identical graph topologies
                with live convergence curves and execution benchmarks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Step-by-Step Optimization Process */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-navy-950/60 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-quantum-600 dark:text-quantum-400">
              System Pipeline
            </span>
            <h2 className="text-3xl font-extrabold text-foreground">
              How the QuantumRoute AI Engine Operates
            </h2>
            <p className="text-sm text-muted-foreground">
              From user search query to quantum rotation convergence on classical hardware.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-foreground">Spatial Geocoding</h4>
              <p className="text-xs text-muted-foreground">
                Resolves origin and destination coordinates via OpenStreetMap / TomTom API and constructs localized road network graphs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-foreground">Multi-Objective Costing</h4>
              <p className="text-xs text-muted-foreground">
                Normalizes travel time $T$, financial cost $C$, physical distance $D$, and emissions $E$ based on selected vehicle parameters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-foreground">Quantum Rotation Update</h4>
              <p className="text-xs text-muted-foreground">
                Q-bits evolve using unitary rotation matrices $U(\Delta\theta)$, steering probability amplitudes toward Pareto-optimal corridors.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="font-bold text-foreground">Interactive Navigation</h4>
              <p className="text-xs text-muted-foreground">
                Delivers interactive Leaflet polyline overlays, turn-by-turn guidance, and transparent rationale for recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Research & Call to Action */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Fully Functional Full-Stack System • Production-Ready Build</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Experience the Future of Intelligent Urban Navigation
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Ready to test real origin-destination routing, simulate fuel consumption across powertrains,
            or benchmark quantum-inspired rotation gates against Dijkstra?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
            >
              <Navigation className="h-4 w-4" />
              <span>Launch Live Dashboard</span>
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-muted hover:bg-muted/80 text-foreground border border-border transition-all"
            >
              <span>Read Research Methodology</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
