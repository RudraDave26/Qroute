import React from 'react';
import Link from 'next/link';
import { Atom, Navigation, Home, Cpu, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Atom Icon */}
        <div className="mx-auto relative flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-quantum-800 text-white shadow-xl shadow-quantum-500/20">
          <Atom className="h-10 w-10 text-quantum-300 animate-spin-slow" />
          <div className="absolute -inset-1 rounded-3xl bg-quantum-400 opacity-20 blur-sm" />
        </div>

        {/* Status Code & Headline */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-quantum-500/10 text-quantum-600 dark:text-quantum-400 border border-quantum-500/20">
            Error 404 • Destination Unknown
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Corridor Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The path or resource you requested is not mapped in our navigation network. Re-route to one of the verified corridors below.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Navigation className="h-4 w-4 text-quantum-300" />
            <span>Open Navigation Map</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-card hover:bg-muted text-foreground border border-border transition-all"
          >
            <Home className="h-4 w-4 text-muted-foreground" />
            <span>Return Home</span>
          </Link>
        </div>

        {/* Quick Nav Suggestions */}
        <div className="pt-6 border-t border-border/60 text-xs text-muted-foreground">
          <p className="mb-2 font-medium">Or explore core research sections:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href="/plan" className="hover:text-quantum-600 dark:hover:text-quantum-400 underline">
              Route Planner
            </Link>
            <span>•</span>
            <Link href="/lab" className="hover:text-quantum-600 dark:hover:text-quantum-400 underline">
              Optimization Lab
            </Link>
            <span>•</span>
            <Link href="/traffic" className="hover:text-quantum-600 dark:hover:text-quantum-400 underline">
              Live Traffic
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-quantum-600 dark:hover:text-quantum-400 underline">
              Research Dossier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
