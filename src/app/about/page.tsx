'use client';

import React from 'react';
import Link from 'next/link';
import {
  Atom,
  Users,
  Layers,
  Cpu,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  GitBranch,
  Terminal,
} from 'lucide-react';

export default function AboutResearchPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title & Metadata */}
      <div className="space-y-4 border-b border-border/80 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-quantum-500/10 text-quantum-700 dark:text-quantum-300 border border-quantum-500/20">
          <Atom className="h-3.5 w-3.5 text-quantum-500" />
          <span>Research Dossier & System Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          QuantumRoute AI: Quantum-Inspired Intelligent Traffic Route Optimization Using Metaheuristic Algorithms
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-quantum-500" /> Research & Development Team: <strong>MVP MAKERS</strong>
          </span>
          <span>•</span>
          <span>Domain: Geospatial Optimization & Metaheuristics</span>
          <span>•</span>
          <a
            href="https://quantum-traffic-optimizer.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-quantum-600 dark:text-quantum-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Live Project URL</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* 1. Problem Statement & Motivation */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-navy-900 text-white flex items-center justify-center text-xs">
            1
          </span>
          Problem Statement & Practical Motivation
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Contemporary urban road navigation systems heavily rely on single-objective Dijkstra or A* variants that prioritize
          either absolute shortest distance or instantaneous travel time. This induces systemic herd-behavior where thousands
          of motorists are routed into identical arterial corridors, worsening gridlock and spiking emissions.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Furthermore, existing GPS navigation platforms treat internal combustion vehicles (petrol/diesel) and electric vehicles (EVs)
          identically, ignoring critical differences: ICE vehicles suffer severe idle fuel burn during congestion delays, whereas
          EVs experience battery drain from cabin climate control (HVAC) while regaining energy through regenerative braking.
        </p>
      </section>

      {/* 2. Proposed System & Mathematical Formulation */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-navy-900 text-white flex items-center justify-center text-xs">
            2
          </span>
          Proposed Multi-Objective Cost Model
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          QuantumRoute AI formulates traffic path selection as a multi-objective optimization problem over a normalized cost function $J(r)$:
        </p>

        {/* Mathematical Formulation Card */}
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 text-quantum-200 font-mono text-sm sm:text-base text-center overflow-x-auto">
            J(r) = w_t \cdot T(r) + w_c \cdot C(r) + w_d \cdot D(r) + w_e \cdot E(r)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              <strong className="text-foreground">T(r)</strong>: Normalized travel-time cost under live or model-based congestion.
            </div>
            <div>
              <strong className="text-foreground">C(r)</strong>: Normalized monetary cost (fuel liters or EV kWh + highway tolls).
            </div>
            <div>
              <strong className="text-foreground">D(r)</strong>: Normalized physical travel distance (km).
            </div>
            <div>
              <strong className="text-foreground">E(r)</strong>: Normalized carbon emissions cost (kg CO₂).
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic border-t border-border/60 pt-2">
            Subject to non-negative weights $w_t + w_c + w_d + w_e = 1.0$ and road feasibility constraints.
          </p>
        </div>
      </section>

      {/* 3. Quantum-Inspired Genetic Algorithm (QIGA) Theory */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-navy-900 text-white flex items-center justify-center text-xs">
            3
          </span>
          Quantum-Inspired Genetic Algorithm (QIGA) Methodology
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Inspired by quantum superposition and quantum probability amplitudes, QIGA represents chromosomes as vectors of Q-bits:
        </p>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-border space-y-4 text-xs text-foreground">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-quantum-600 dark:text-quantum-400">1. Q-Bit State Superposition</h4>
            <p className="text-muted-foreground">
              A Q-bit state $|\psi\rangle$ is defined as $|\psi\rangle = \alpha |0\rangle + \beta |1\rangle$, satisfying the unitary normalization:
              $|\alpha|^2 + |\beta|^2 = 1.0$. This allows an individual Q-chromosome to represent multiple potential paths simultaneously.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-sm text-quantum-600 dark:text-quantum-400">2. Measurement / Quantum Collapse</h4>
            <p className="text-muted-foreground">
              A random variable $r \sim U(0,1)$ is compared against $|\beta_i|^2$. If $r &lt; |\beta_i|^2$, bit $x_i = 1$, else $0$. The bitstring is decoded into sequential layer choices.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-sm text-quantum-600 dark:text-quantum-400">3. Unitary Rotation Gate Evolution</h4>
            <p className="text-muted-foreground">
              Qubit amplitudes are updated toward Pareto-superior candidates using a 2×2 rotation gate $U(\Delta\theta_i)$:
            </p>
            <pre className="p-3 rounded-lg bg-background font-mono text-[11px] overflow-x-auto">
{`[ α' ]   [ cos(Δθ)  -sin(Δθ) ] [ α ]
[ β' ] = [ sin(Δθ)   cos(Δθ) ] [ β ]`}
            </pre>
            <p className="text-muted-foreground text-[11px]">
              The rotation magnitude $\Delta\theta_i = s(\alpha, \beta) \cdot \theta_0$ is looked up via Han & Kim (2002) sign lookup rules with dynamic annealing step sizes.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Comparison Table: Existing vs Proposed */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-navy-900 text-white flex items-center justify-center text-xs">
            4
          </span>
          Comparative Architecture Analysis
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-foreground font-bold">
                <th className="p-3.5">Capability Dimension</th>
                <th className="p-3.5">Conventional Navigation (Google Maps / OSM)</th>
                <th className="p-3.5 text-quantum-600 dark:text-quantum-400">QuantumRoute AI (MVP MAKERS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="p-3.5 font-bold">Optimization Metric</td>
                <td className="p-3.5 text-muted-foreground">Single metric (Fastest time or Shortest distance)</td>
                <td className="p-3.5 font-semibold text-foreground">Multi-objective $J(r) = w_t T + w_c C + w_d D + w_e E$</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">EV Powertrain Modeling</td>
                <td className="p-3.5 text-muted-foreground">Generic battery estimates or non-differentiated</td>
                <td className="p-3.5 font-semibold text-foreground">Accurate kWh consumption, idle HVAC overhead & regen</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">Algorithmic Core</td>
                <td className="p-3.5 text-muted-foreground">Static Dijkstra / Contraction Hierarchies</td>
                <td className="p-3.5 font-semibold text-foreground">Quantum-Inspired Genetic Algorithm (QIGA) + 4 baselines</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold">Transparency & Status</td>
                <td className="p-3.5 text-muted-foreground">Black-box proprietary recommendation</td>
                <td className="p-3.5 font-semibold text-foreground">Clear status badges (LIVE, CACHED, DEMO) & explicit trade-off rationale</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Scientific Limitations & Responsible Disclosures */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-navy-900 text-white flex items-center justify-center text-xs">
            5
          </span>
          Limitations & Responsible Disclosures
        </h2>

        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 space-y-2 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="h-4 w-4" /> Honest Scientific Limitations
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Classical Simulation:</strong> QIGA is quantum-inspired and executes on classical CPU architectures using floating-point matrix arithmetic.
              It does not run on genuine cryogenic quantum annealers (e.g. D-Wave) or quantum gate computers (e.g. IBM Q).
            </li>
            <li>
              <strong>Fuel & EV Efficiency:</strong> Fuel calculations rely on standard consumption equations and nominal efficiencies. Actual consumption varies with vehicle payload, tire pressure, elevation gradients, and driving behavior.
            </li>
            <li>
              <strong>API Rate Limits:</strong> When API keys (TomTom, Nominatim) are unconfigured or exceed quotas, the system gracefully falls back to synthetic physics baselines clearly badged as <code>DEMO</code>.
            </li>
          </ul>
        </div>
      </section>

      {/* 6. Integrated APIs & Live Infrastructure */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-navy-900 text-white flex items-center justify-center text-xs">
            6
          </span>
          Integrated APIs & Live Geospatial Services
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground">1. OpenStreetMap (OSM)</h4>
              <a
                href="https://www.openstreetmap.org/"
                target="_blank"
                rel="noreferrer"
                className="text-quantum-600 dark:text-quantum-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Docs</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Global open geographic database supplying base map tiles, road network topology, and Nominatim place search.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground">2. Open-Meteo Air Quality API</h4>
              <a
                href="https://open-meteo.com/en/docs/air-quality-api"
                target="_blank"
                rel="noreferrer"
                className="text-quantum-600 dark:text-quantum-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Docs</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Real-time atmospheric modeling providing European AQI, US AQI, PM2.5, PM10, and Nitrogen Dioxide for eco-routing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground">3. India Petroleum API</h4>
              <a
                href="https://india-petroleum-api.vercel.app/docs"
                target="_blank"
                rel="noreferrer"
                className="text-quantum-600 dark:text-quantum-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Docs</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Daily metro petrol and diesel rates directly fetched from PPAC, Ministry of Petroleum and Natural Gas, Government of India.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground">4. Open Charge Map API</h4>
              <a
                href="https://openchargemap.org/site/develop/api"
                target="_blank"
                rel="noreferrer"
                className="text-quantum-600 dark:text-quantum-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Docs</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Global registry of Electric Vehicle (EV) public and fast DC charging points, power ratings in kW, and connector types.
            </p>
          </div>
        </div>
      </section>

      {/* 7. References & Literature */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-navy-900 text-white flex items-center justify-center text-xs">
            7
          </span>
          Academic & Technical References
        </h2>

        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="p-3 rounded-xl bg-card border border-border">
            <span className="font-bold text-foreground">Han, K.-H., & Kim, J.-H. (2002).</span> &quot;Quantum-inspired evolutionary algorithm for a class of combinatorial optimization.&quot; <em>IEEE Transactions on Evolutionary Computation</em>, 6(6), 580–593.
          </li>
          <li className="p-3 rounded-xl bg-card border border-border">
            <span className="font-bold text-foreground">Dijkstra, E. W. (1959).</span> &quot;A note on two problems in connexion with graphs.&quot; <em>Numerische Mathematik</em>, 1(1), 269–271.
          </li>
          <li className="p-3 rounded-xl bg-card border border-border">
            <span className="font-bold text-foreground">Hart, P. E., Nilsson, N. J., & Raphael, B. (1968).</span> &quot;A formal basis for the heuristic determination of minimum cost paths.&quot; <em>IEEE Transactions on Systems Science and Cybernetics</em>, 4(2), 100–107.
          </li>
          <li className="p-3 rounded-xl bg-card border border-border">
            <span className="font-bold text-foreground">OpenStreetMap Contributors.</span> OpenStreetMap geospatial database. Available at: <a href="https://www.openstreetmap.org" className="underline hover:text-foreground" target="_blank" rel="noreferrer">https://www.openstreetmap.org</a>
          </li>
        </ul>
      </section>
    </div>
  );
}
