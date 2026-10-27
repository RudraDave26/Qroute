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
                Type any city landmark or click your current location. We use OpenStreetMap to pinpoint your exact coordinates.
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

      {/* 3. Plain English Comparison Table */}
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
                  <th className="p-4 text-muted-foreground">Standard Maps (Google Maps / OSM)</th>
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
