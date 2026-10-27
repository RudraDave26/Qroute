'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Navigation,
  MapPin,
  Sliders,
  Radio,
  Cpu,
  BarChart3,
  Bookmark,
  Info,
  Menu,
  X,
  Sun,
  Moon,
  Atom,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark theme preference
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Navigation },
    { href: '/features', label: 'Features', icon: Sparkles },
    { href: '/plan', label: 'Route Planner', icon: Sliders },
    { href: '/traffic', label: 'Live Traffic', icon: Radio },
    { href: '/lab', label: 'Optimization Lab', icon: Cpu, isHighlight: true },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/saved', label: 'Saved Routes', icon: Bookmark },
    { href: '/about', label: 'About & Research', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-[#0B1220] text-[#14B8A6] shadow-sm border border-slate-800 group-hover:scale-105 transition-transform duration-200">
            <Atom className="h-5 w-5 text-[#14B8A6]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[#0B1220] dark:text-white">
                QuantumRoute
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded bg-[#14B8A6]/15 text-[#14B8A6] border border-[#14B8A6]/30">
                AI
              </span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest -mt-1">
              By MVP MAKERS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-[#14B8A6] text-white shadow-xs'
                    : 'text-[#0B1220]/80 dark:text-white/80 hover:text-[#0B1220] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors border border-border/60"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-navy-800" />}
          </button>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
          >
            <MapPin className="h-4 w-4 text-quantum-300" />
            <span>Plan Route</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/80 hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.isHighlight && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded bg-quantum-500/20 text-quantum-600 dark:text-quantum-400">
                    QIGA
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
