'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Atom,
  Navigation,
  Cpu,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Fuel,
  Compass,
  Sparkles,
  MapPin,
  Car,
  Bike,
  ShieldCheck,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export default function LandingPage() {
  const quickDemoTrips = [
    {
      title: 'Bengaluru Tech Corridor',
      from: 'Koramangala 4th Block',
      to: 'Whitefield ITPL',
      vehicle: 'Electric (EV)',
      benefit: 'Saves 12 min jam & ₹32',
      href: '/dashboard?from=koramangala&to=whitefield',
    },
    {
      title: 'Delhi NCR Commute',
      from: 'Connaught Place',
      to: 'DLF Cyber City, Gurugram',
      vehicle: 'Petrol Car',
      benefit: 'Expressway bypass route',
      href: '/dashboard?from=cp&to=cybercity',
    },
    {
      title: 'Mumbai Business Hub',
      from: 'Nariman Point',
      to: 'Bandra Kurla Complex (BKC)',
      vehicle: 'CNG Car',
      benefit: 'Lowest emissions corridor',
      href: '/dashboard?from=nariman&to=bkc',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-slate-50 via-background to-background dark:from-navy-950 dark:via-background dark:to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Friendly Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-quantum-500/10 text-quantum-700 dark:text-quantum-300 border border-quantum-500/20">
              <Sparkles className="h-3.5 w-3.5 text-quantum-500" />
              <span>Simple, Intelligent Traffic Navigation • Built by MVP MAKERS</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Smarter Routes.{' '}
              <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 dark:from-cyan-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Lower Costs.
              </span>{' '}
              Zero Stress.
            </h1>

            {/* Subtitle in plain language */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Navigation that balances <strong>travel time</strong>, <strong>fuel expenditures</strong>, and <strong>carbon emissions</strong>.
              Whether you drive a petrol car, CNG, or an Electric EV, QuantumRoute AI shows you the smartest way to reach your destination.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                <Navigation className="h-5 w-5 text-quantum-300" />
                <span>Open Navigation Map</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/lab"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-card hover:bg-muted text-foreground border border-border transition-all"
              >
                <Cpu className="h-4 w-4 text-quantum-500" />
                <span>See How AI Optimization Works</span>
              </Link>
            </div>

            {/* Simple Trust Indicators */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free to use
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Real Petrol & EV Tariffs
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Live Traffic Flow
              </span>
            </div>
          </div>

          {/* 1-Click Try It Out Preview Card */}
          <div className="mt-12 max-w-4xl mx-auto rounded-3xl border border-border bg-card shadow-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-quantum-600 dark:text-quantum-400">
                  Instant Demo
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  Try One of These Popular Commute Routes with 1 Click:
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">Click any box to open on map</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickDemoTrips.map((trip, idx) => (
                <Link
                  key={idx}
                  href="/dashboard"
                  className="p-4 rounded-2xl border border-border/80 bg-slate-50 dark:bg-navy-900/60 hover:border-quantum-500 hover:shadow-md transition-all group text-left space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground group-hover:text-quantum-600 transition-colors">
                      {trip.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-quantum-500/10 text-quantum-700 dark:text-quantum-300 font-semibold text-[10px]">
                      {trip.vehicle}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p className="line-clamp-1">From: <strong>{trip.from}</strong></p>
                    <p className="line-clamp-1">To: <strong>{trip.to}</strong></p>
                  </div>
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>{trip.benefit}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works in 3 Easy Steps */}
      <section className="py-16 md:py-20 bg-card border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-quantum-600 dark:text-quantum-400">
              Simple & Clear
            </span>
            <h2 className="text-3xl font-extrabold text-foreground">
              How to Use QuantumRoute AI in 3 Easy Steps
            </h2>
            <p className="text-sm text-muted-foreground">
              No complex settings required. You are 3 clicks away from an optimized journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-background border border-border shadow-xs space-y-3 text-center sm:text-left">
              <div className="h-12 w-12 rounded-2xl bg-quantum-500/10 text-quantum-600 flex items-center justify-center font-extrabold text-lg mx-auto sm:mx-0">
                1
              </div>
              <h3 className="text-base font-bold text-foreground">Choose Starting Point & Destination</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Type any city landmark or click your current location to pinpoint your exact coordinates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-background border border-border shadow-xs space-y-3 text-center sm:text-left">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-extrabold text-lg mx-auto sm:mx-0">
                2
              </div>
              <h3 className="text-base font-bold text-foreground">Select Your Vehicle Type</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pick Petrol, Diesel, CNG, or Electric EV. We automatically calculate the exact fuel or electricity consumption and cost in rupees.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-background border border-border shadow-xs space-y-3 text-center sm:text-left">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-extrabold text-lg mx-auto sm:mx-0">
                3
              </div>
              <h3 className="text-base font-bold text-foreground">Get the Smartest Route on the Map</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                See the best route highlighted in cyan, compare travel time, fuel savings, and avoid congested traffic traps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. System Features & Architecture Showcase (Matches Photos 01 to 05) */}
      <section className="py-16 md:py-24 bg-card border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-quantum-600 dark:text-quantum-400">
              System Specifications & Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Core Platform Capabilities
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Engineered for high accuracy, transparent real-time telemetry, and multi-objective quantum-inspired optimization.
            </p>
          </div>

          <div className="divide-y divide-border/60 space-y-8">
            {/* 01 — Smart route planner */}
            <div className="pt-8 first:pt-0 flex flex-col md:flex-row items-start gap-6 lg:gap-10">
              <div className="w-full md:w-48 h-36 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-border/80 p-3 shrink-0 flex flex-col justify-between shadow-xs overflow-hidden relative group">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Origin
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation className="h-3.5 w-3.5 text-rose-500" /> Dest
                  </span>
                </div>
                {/* Visual miniature route */}
                <div className="relative h-16 w-full flex items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-rose-500 rounded-full relative">
                    <div className="absolute left-1/2 -top-1.5 h-4 w-4 rounded-full bg-amber-400 border-2 border-card ring-2 ring-amber-400/20" title="Stop 1" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                  <span>37 States • 635 Districts</span>
                  <span className="text-quantum-600 font-bold">1-Click</span>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    01 — Smart route planner
                  </h3>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-quantum-600 dark:text-quantum-400 hover:underline"
                  >
                    <span>Open Planner</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span>Search any Indian city or address.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span>Origin and destination autocomplete.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span>Swap locations and add multiple stops.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span>One clear <strong>Find Best Route</strong> button.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 02 — Route comparison */}
            <div className="pt-8 flex flex-col md:flex-row items-start gap-6 lg:gap-10">
              <div className="w-full md:w-48 h-36 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-border/80 p-3 shrink-0 flex flex-col justify-between shadow-xs overflow-hidden">
                <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
                  <span>Alternatives</span>
                  <span className="text-emerald-500 font-semibold">3 Routes</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="p-1 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold flex justify-between">
                    <span>Fastest</span>
                    <span>24 min</span>
                  </div>
                  <div className="p-1 rounded bg-slate-200 dark:bg-navy-800 text-muted-foreground flex justify-between">
                    <span>Lowest Cost</span>
                    <span>₹85</span>
                  </div>
                  <div className="p-1 rounded bg-slate-200 dark:bg-navy-800 text-muted-foreground flex justify-between">
                    <span>Eco-Friendly</span>
                    <span>1.2 kg CO₂</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    02 — Route comparison
                  </h3>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-quantum-600 dark:text-quantum-400 hover:underline"
                  >
                    <span>View Comparisons</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-xs font-semibold text-foreground">
                  Show three alternatives where available:
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span><strong>Fastest route</strong> (Expressway corridors & grade-separated bypasses)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span><strong>Lowest fuel cost</strong> (Toll-free, steady cruise velocity)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span><strong>Eco-friendly route</strong> (Lowest emissions & regenerative braking recovery)</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground pt-1">
                  Each card should show ETA, distance, estimated cost and emissions, with the recommended route highlighted.
                </p>
              </div>
            </div>

            {/* 03 — Traffic intelligence */}
            <div className="pt-8 flex flex-col md:flex-row items-start gap-6 lg:gap-10">
              <div className="w-full md:w-48 h-36 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-border/80 p-3 shrink-0 flex flex-col justify-between shadow-xs overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Telemetry</span>
                  <StatusBadge status="LIVE" showIcon={false} className="py-0 px-1 text-[8px]" />
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-600 font-semibold">⚠ Congestion</span>
                    <span>+8 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-rose-600 font-semibold">⛔ Choke Point</span>
                    <span>Bypassed</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Flow Freshness</span>
                    <span className="font-semibold text-emerald-600">Active</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    03 — Traffic intelligence
                  </h3>
                  <Link
                    href="/traffic"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-quantum-600 dark:text-quantum-400 hover:underline"
                  >
                    <span>Traffic Telemetry</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span>Congestion shown on the map.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span>Road incidents and closures, when available.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span>Traffic-data source and last-updated time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span>Clear status if live data is unavailable.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 04 — Optimization lab */}
            <div className="pt-8 flex flex-col md:flex-row items-start gap-6 lg:gap-10">
              <div className="w-full md:w-48 h-36 rounded-2xl bg-navy-950 text-white p-3 shrink-0 flex flex-col justify-between shadow-xs border border-navy-800">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-cyan-400 font-mono font-bold">QIGA vs Baselines</span>
                  <span className="text-emerald-400 font-bold">Real Iter.</span>
                </div>
                {/* Visual miniature chart */}
                <div className="h-14 w-full flex items-end justify-between gap-1 pt-2">
                  <div className="w-1/4 bg-slate-700 h-[85%] rounded-t text-[8px] text-center text-slate-300">Dijk.</div>
                  <div className="w-1/4 bg-slate-600 h-[75%] rounded-t text-[8px] text-center text-slate-300">A*</div>
                  <div className="w-1/4 bg-blue-500 h-[65%] rounded-t text-[8px] text-center text-white">GA</div>
                  <div className="w-1/4 bg-gradient-to-t from-cyan-600 to-quantum-400 h-[45%] rounded-t text-[8px] text-center text-white font-bold">QIGA</div>
                </div>
                <div className="text-[9px] text-slate-400 text-center">Score: 0.1469 (Pareto Best)</div>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    04 — Optimization lab
                  </h3>
                  <Link
                    href="/lab"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-quantum-600 dark:text-quantum-400 hover:underline"
                  >
                    <span>Run Optimization Lab</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-xs text-foreground font-semibold">
                  Compare Dijkstra, A*, Genetic Algorithm and Quantum-Inspired Genetic Algorithm (QIGA).
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Display route cost, execution time and solution quality using the same test cases. Don&apos;t show fabricated performance results.
                </p>
              </div>
            </div>

            {/* 05 — Vehicle and fuel calculator */}
            <div className="pt-8 flex flex-col md:flex-row items-start gap-6 lg:gap-10">
              <div className="w-full md:w-48 h-36 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-border/80 p-3 shrink-0 flex flex-col justify-between shadow-xs overflow-hidden">
                <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
                  <span>Powertrains</span>
                  <span className="text-quantum-600 font-bold">5 Options</span>
                </div>
                <div className="grid grid-cols-5 gap-1 text-center py-2">
                  <span title="Petrol" className="p-1 rounded bg-muted text-[10px]">🚗</span>
                  <span title="Diesel" className="p-1 rounded bg-muted text-[10px]">🚙</span>
                  <span title="CNG" className="p-1 rounded bg-muted text-[10px]">🚐</span>
                  <span title="EV" className="p-1 rounded bg-emerald-500/20 text-[10px]">⚡</span>
                  <span title="Motorcycle" className="p-1 rounded bg-muted text-[10px]">🏍</span>
                </div>
                <div className="text-[10px] text-center text-muted-foreground">
                  ₹ / Litre • ₹ / kWh Real Tariffs
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    05 — Vehicle and fuel calculator
                  </h3>
                  <Link
                    href="/plan"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-quantum-600 dark:text-quantum-400 hover:underline"
                  >
                    <span>Configure Vehicle</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Let users select petrol, diesel, CNG, EV or motorcycle, then estimate trip expenses using fuel efficiency and clearly labelled fuel/electricity prices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Plain English Comparison Table */}
      <section className="py-16 md:py-20 bg-slate-50 dark:bg-navy-950/60 border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              What Makes QuantumRoute AI Different?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              See why multi-objective optimization gives you a better journey than standard navigation tools.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-foreground font-bold">
                  <th className="p-4">What you care about</th>
                  <th className="p-4 text-muted-foreground">Standard GPS Navigation Apps</th>
                  <th className="p-4 text-quantum-600 dark:text-quantum-400 font-extrabold">QuantumRoute AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="p-4 font-bold text-foreground">Electric Vehicles (EV)</td>
                  <td className="p-4 text-muted-foreground">Shows standard route; no idle power calculation</td>
                  <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    Calculates exact kWh battery draw, idle AC power, and shows fast chargers
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground">Money & Fuel Cost</td>
                  <td className="p-4 text-muted-foreground">Shows distance only; does not calculate trip cost</td>
                  <td className="p-4 font-semibold text-foreground">
                    Shows estimated trip cost in ₹ using real daily fuel tariffs
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground">Avoiding Traffic Traps</td>
                  <td className="p-4 text-muted-foreground">Routes everyone onto the same expressway</td>
                  <td className="p-4 font-semibold text-foreground">
                    Quantum-inspired engine explores parallel arterial bypass corridors
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground">Transparency</td>
                  <td className="p-4 text-muted-foreground">Black-box suggestions; no explanation</td>
                  <td className="p-4 font-semibold text-foreground">
                    Explains clearly why each route was picked and what it saves you
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. Ready to Go Banner */}
      <section className="py-16 bg-background text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-extrabold text-foreground">Ready to Plan Your Next Journey?</h2>
          <p className="text-sm text-muted-foreground">
            Test real routes, compare vehicles, and explore live traffic flow right now.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
          >
            <Navigation className="h-4 w-4 text-quantum-300" />
            <span>Launch Navigation Dashboard</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
