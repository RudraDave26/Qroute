import React from 'react';
import { DataStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ShieldCheck, Database, History, FlaskConical, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: DataStatus;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, label, showIcon = true, className }: StatusBadgeProps) {
  const config = {
    LIVE: {
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/60',
      dot: 'bg-emerald-500 animate-pulse',
      icon: ShieldCheck,
      desc: 'Verified real-time live feed from API provider',
    },
    CACHED: {
      color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-700/60',
      dot: 'bg-sky-500',
      icon: Database,
      desc: 'Temporarily cached recent response to preserve API quotas',
    },
    HISTORICAL: {
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700/60',
      dot: 'bg-purple-500',
      icon: History,
      desc: 'Derived from historical baseline traffic patterns',
    },
    DEMO: {
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
      dot: 'bg-amber-500',
      icon: FlaskConical,
      desc: 'Simulated research demo mode (API key not configured or demo route)',
    },
    UNAVAILABLE: {
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700/60',
      dot: 'bg-rose-500',
      icon: AlertTriangle,
      desc: 'External data source offline or regional coverage unavailable',
    },
  }[status] || {
    color: 'bg-slate-500/10 text-slate-600 border-slate-300',
    dot: 'bg-slate-400',
    icon: Database,
    desc: 'Status unknown',
  };

  const IconComponent = config.icon;

  return (
    <div
      title={config.desc}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border shadow-xs transition-all select-none',
        config.color,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {showIcon && <IconComponent className="h-3 w-3" />}
      <span>{label || status}</span>
    </div>
  );
}
