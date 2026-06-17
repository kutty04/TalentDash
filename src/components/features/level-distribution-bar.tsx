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

  // Sort levels by standard ordering to keep chart consistent (SDE_I -> PRINCIPAL)
  const order: Record<Level, number> = {
    [Level.SDE_I]: 1,
    [Level.SDE_II]: 2,
    [Level.SDE_III]: 3,
    [Level.STAFF]: 4,
    [Level.PRINCIPAL]: 5,
  };
  items.sort((a, b) => (order[a.level] || 0) - (order[b.level] || 0));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium transition-all duration-300 hover:shadow-premium-hover space-y-5">
      <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider">
        Level Distribution Bar
      </h3>

      {/* Horizontal Stacked Bar */}
      <div className="flex h-7 w-full rounded-full overflow-hidden bg-slate-100 p-0.5 border border-slate-200/20">
        {items.map((item) => {
          if (item.percentage === 0) return null;
          // Apply custom premium color palettes
          let barBg = 'bg-slate-400';
          if (item.level === Level.SDE_II) barBg = 'bg-sky-400';
          if (item.level === Level.SDE_III) barBg = 'bg-indigo-500';
          if (item.level === Level.STAFF) barBg = 'bg-purple-500';
          if (item.level === Level.PRINCIPAL) barBg = 'bg-slate-900';

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
          let bulletBg = 'bg-slate-400';
          if (item.level === Level.SDE_II) bulletBg = 'bg-sky-400';
          if (item.level === Level.SDE_III) bulletBg = 'bg-indigo-500';
          if (item.level === Level.STAFF) bulletBg = 'bg-purple-500';
          if (item.level === Level.PRINCIPAL) bulletBg = 'bg-slate-900';

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
