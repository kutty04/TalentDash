import React from 'react';
import { Level } from '@prisma/client';
import { LEVEL_BADGE_COLORS } from '@/lib/constants';

interface DistributionProps {
  distribution: Record<Level, number>;
  totalRecords: number;
}

export function LevelDistributionBar({ distribution, totalRecords }: DistributionProps) {
  if (totalRecords === 0) return null;

  // Formulate items with calculations
  const items = Object.entries(distribution).map(([key, count]) => {
    const level = key as Level;
    const percentage = Math.round((count / totalRecords) * 100);
    return {
      level,
      count,
      percentage,
      colors: LEVEL_BADGE_COLORS[level] || { bg: 'bg-gray-100', text: 'text-gray-700' },
    };
  });

  // Sort levels by standard ordering to keep chart consistent
  const order: Record<Level, number> = {
    [Level.L3]: 1,
    [Level.L4]: 2,
    [Level.L5]: 3,
    [Level.L6]: 4,
    [Level.SDE_I]: 5,
    [Level.SDE_II]: 6,
    [Level.SDE_III]: 7,
    [Level.STAFF]: 8,
    [Level.PRINCIPAL]: 9,
    [Level.IC4]: 10,
    [Level.IC5]: 11,
  };

  const LEVEL_BAR_COLORS: Record<Level, string> = {
    [Level.L3]: 'bg-zinc-300',
    [Level.L4]: 'bg-blue-400',
    [Level.L5]: 'bg-violet-400',
    [Level.L6]: 'bg-fuchsia-400',
    [Level.SDE_I]: 'bg-slate-400',
    [Level.SDE_II]: 'bg-sky-400',
    [Level.SDE_III]: 'bg-indigo-500',
    [Level.STAFF]: 'bg-purple-500',
    [Level.PRINCIPAL]: 'bg-slate-900',
    [Level.IC4]: 'bg-amber-400',
    [Level.IC5]: 'bg-emerald-500',
  };

  items.sort((a, b) => (order[a.level] || 99) - (order[b.level] || 99));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium transition-all duration-300 hover:shadow-premium-hover space-y-5">
      <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider">
        Level Distribution Bar
      </h3>

      {/* Horizontal Stacked Bar */}
      <div className="flex h-7 w-full rounded-full overflow-hidden bg-slate-100 p-0.5 border border-slate-200/20">
        {items.map((item) => {
          if (item.percentage === 0) return null;
          const barBg = LEVEL_BAR_COLORS[item.level] || 'bg-slate-400';

          return (
            <div
              key={item.level}
              style={{ width: `${item.percentage}%` }}
              className={`${barBg} h-full transition-all duration-500 hover:opacity-90 first:rounded-l-full last:rounded-r-full relative group cursor-help`}
              title={`${item.level.replace('_', '-')}: ${item.count} (${item.percentage}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
        {items.map((item) => {
          const displayName = item.level.replace('_', '-');
          const bulletBg = LEVEL_BAR_COLORS[item.level] || 'bg-slate-400';

          return (
            <div key={item.level} className="flex items-center space-x-2 text-sm font-medium">
              <span className={`w-3 h-3 rounded-full shrink-0 ${bulletBg}`} />
              <span className="text-brand-black">{displayName}</span>
              <span className="text-brand-muted text-xs font-semibold bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                {item.count} ({item.percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
