'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLinkItem {
  href: string;
  label: string;
  icon: any;
  description?: string;
  isHighlight?: boolean;
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Primary navigation links always accessible on desktop/tablet header
  const primaryNavLinks: NavLinkItem[] = [
    { href: '/dashboard', label: 'Route Navigation', icon: Navigation },
    { href: '/fleet', label: 'Fleet Optimization', icon: Truck, isHighlight: true },
    { href: '/lab', label: 'Optimization Lab', icon: Cpu },
    { href: '/traffic', label: 'Live Traffic', icon: Radio },
  ];

  // Secondary navigation links housed inside the elegant "More" menu on compact desktop
  const secondaryNavLinks: NavLinkItem[] = [
    { href: '/plan', label: 'Powertrain Cost Lab', description: 'Vehicle efficiency & tariffs', icon: Sliders },
    { href: '/features', label: 'Features', description: 'Interactive platform capabilities', icon: Sparkles },
    { href: '/analytics', label: 'Analytics', description: 'Network KPIs & corridor heatmaps', icon: BarChart3 },
    { href: '/saved', label: 'Saved Routes', description: 'Stored itineraries & commutes', icon: Bookmark },
    { href: '/about', label: 'About & Research', description: 'Methodology, algorithms & team', icon: Info },
  ];

  // All navigation links combined for wide screens and mobile drawer
  const allNavLinks: NavLinkItem[] = [
    primaryNavLinks[0], // Route Navigation
    primaryNavLinks[1], // Fleet Optimization
    secondaryNavLinks[0], // Powertrain Cost Lab
    primaryNavLinks[2], // Optimization Lab
    primaryNavLinks[3], // Live Traffic
    secondaryNavLinks[1], // Features
    secondaryNavLinks[2], // Analytics
    secondaryNavLinks[3], // Saved Routes
    secondaryNavLinks[4], // About
  ];

  const isSecondaryActive = secondaryNavLinks.some((item) => pathname === item.href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-colors">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-navy-900 via-navy-800 to-quantum-800 text-white shadow-md shadow-quantum-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Atom className="h-4 w-4 text-quantum-300 animate-spin-slow" />
            <div className="absolute -inset-0.5 rounded-xl bg-quantum-400 opacity-20 blur-xs group-hover:opacity-40 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base tracking-tight bg-gradient-to-r from-navy-900 to-navy-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent whitespace-nowrap">
                QuantumRoute
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded bg-quantum-500/15 text-quantum-700 dark:text-quantum-300 border border-quantum-500/30 shrink-0">
                AI
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] font-medium text-muted-foreground uppercase tracking-wider -mt-0.5 whitespace-nowrap">
              By MVP MAKERS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation (2xl screens: all links, xl/lg screens: primary + More dropdown to strictly avoid awkward wrapping) */}
        <nav className="hidden lg:flex items-center gap-1 shrink-0">
          {/* For ultra-wide 2xl screens: show all links cleanly */}
          <div className="hidden 2xl:flex items-center gap-1">
            {allNavLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-foreground/80 hover:text-foreground hover:bg-muted',
                    item.isHighlight && !isActive && 'text-quantum-600 dark:text-quantum-400 hover:bg-quantum-500/10'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* For lg & xl screens: show core 4 links + "More" dropdown so navigation NEVER wraps awkwardly */}
          <div className="flex 2xl:hidden items-center gap-1">
            {primaryNavLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-foreground/80 hover:text-foreground hover:bg-muted',
                    item.isHighlight && !isActive && 'text-quantum-600 dark:text-quantum-400 hover:bg-quantum-500/10'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* "More" Dropdown Menu */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0',
                  isSecondaryActive || moreDropdownOpen
                    ? 'bg-primary/10 text-primary dark:text-quantum-400 font-semibold'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                )}
                aria-expanded={moreDropdownOpen}
                aria-haspopup="true"
              >
                <span>More</span>
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', moreDropdownOpen && 'rotate-180')} />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-xl p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="space-y-1">
                    {secondaryNavLinks.map((sec) => {
                      const SecIcon = sec.icon;
                      const isSecActive = pathname === sec.href;
                      return (
                        <Link
                          key={sec.href}
                          href={sec.href}
                          onClick={() => setMoreDropdownOpen(false)}
                          className={cn(
                            'flex items-start gap-2.5 p-2 rounded-xl text-left transition-all',
                            isSecActive
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-foreground'
                          )}
                        >
                          <SecIcon className={cn('h-4 w-4 mt-0.5 shrink-0', isSecActive ? 'text-primary-foreground' : 'text-quantum-600 dark:text-quantum-400')} />
                          <div className="min-w-0 flex-1">
                            <p className={cn('text-xs font-bold leading-tight', isSecActive ? 'text-primary-foreground' : 'text-foreground')}>
                              {sec.label}
                            </p>
                            <p className={cn('text-[10px] line-clamp-1 mt-0.5', isSecActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                              {sec.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted transition-colors border border-border/60 shrink-0"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-navy-800" />}
          </button>

          <Link
            href="/dashboard"
            className="hidden md:inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all shrink-0"
          >
            <MapPin className="h-3.5 w-3.5 text-quantum-300" />
            <span>Plan Route</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="Open mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-14 bg-black/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in-0 duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-14 left-0 right-0 max-h-[calc(100vh-3.5rem)] overflow-y-auto bg-card border-b border-border shadow-2xl z-50 p-4 space-y-1 lg:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1">
              Navigation Menu
            </div>
            {allNavLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary-foreground' : 'text-quantum-600 dark:text-quantum-400')} />
                  <span className="flex-1">{item.label}</span>
                  {item.isHighlight && (
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded shrink-0',
                      isActive ? 'bg-white/20 text-white' : 'bg-quantum-500/20 text-quantum-700 dark:text-quantum-300'
                    )}>
                      QIGA AI
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Mobile Quick Action Link */}
            <div className="pt-3 mt-2 border-t border-border">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-sm"
              >
                <MapPin className="h-4 w-4 text-quantum-300" />
                <span>Open Route Navigation Canvas</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
