import React from 'react';
import Link from 'next/link';
import { Atom, ExternalLink, Github, ShieldAlert, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-slate-50 dark:bg-navy-950 text-foreground/80 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-navy-900 text-white">
                <Atom className="h-4 w-4 text-quantum-300" />
              </div>
              <span className="font-bold text-lg text-foreground">QuantumRoute AI</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-semibold">
                MVP MAKERS
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              An intelligent multi-objective traffic navigation engine exploring Quantum-Inspired Genetic Algorithms (QIGA),
              metaheuristics, and EV energy modeling to optimize urban mobility, fuel expenditures, and carbon footprints.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="inline-flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-quantum-500" /> Classical Simulation of Quantum Superposition & Rotation Gates
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Interactive Dashboard
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-foreground transition-colors font-medium text-quantum-600 dark:text-quantum-400">
                  Features & Capabilities
                </Link>
              </li>
              <li>
                <Link href="/plan" className="hover:text-foreground transition-colors">
                  Multi-Objective Planner
                </Link>
              </li>
              <li>
                <Link href="/traffic" className="hover:text-foreground transition-colors">
                  Live Traffic Intelligence
                </Link>
              </li>
              <li>
                <Link href="/lab" className="hover:text-foreground transition-colors font-medium text-quantum-600 dark:text-quantum-400">
                  Optimization Lab (QIGA)
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-foreground transition-colors">
                  Fleet Analytics & Benchmarks
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Research & Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: System Capabilities & Modules */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Engine Modules</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Geospatial Vector Routing</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Live Traffic Congestion Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Atmospheric Air Quality Telemetry</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>EV Charging Infrastructure Radar</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Dynamic Powertrain Cost Modeling</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>QIGA Metaheuristic Solver</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Multi-Objective Pareto Ranking</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-navy-900 border border-border text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-quantum-500" />
          <p className="leading-relaxed">
            <strong>System Overview:</strong> QuantumRoute AI operates an intelligent multi-objective traffic optimization engine.
            The Quantum-Inspired Genetic Algorithm (QIGA) runs on high-performance computing infrastructure simulating
            qubit probability amplitudes and rotation gates to discover Pareto-optimal travel routes.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} QuantumRoute AI. Developed for academic and industrial research by <strong>MVP MAKERS</strong>.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:underline">
              System Architecture
            </Link>
            <span>•</span>
            <a
              href="https://quantum-traffic-optimizer.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="hover:underline inline-flex items-center gap-1"
            >
              Demo URL <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
