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
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        Level Distribution Bar
      </h3>

      {/* Horizontal Stacked Bar */}
      <div className="flex h-6 w-full rounded-full overflow-hidden bg-gray-100">
        {items.map((item) => {
          if (item.percentage === 0) return null;
          // Apply custom colors or fall back to slate if not matching
          let barBg = 'bg-slate-400';
          if (item.level === Level.SDE_II) barBg = 'bg-blue-400';
          if (item.level === Level.SDE_III) barBg = 'bg-indigo-400';
          if (item.level === Level.STAFF) barBg = 'bg-purple-400';
          if (item.level === Level.PRINCIPAL) barBg = 'bg-slate-800';

          return (
            <div
              key={item.level}
              style={{ width: `${item.percentage}%` }}
              className={`${barBg} h-full transition-all duration-300 relative group`}
              title={`${item.level.replace('_', '-')}: ${item.count} (${item.percentage}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
        {items.map((item) => {
          const displayName = item.level.replace('_', '-');
          let bulletBg = 'bg-slate-400';
          if (item.level === Level.SDE_II) bulletBg = 'bg-blue-400';
          if (item.level === Level.SDE_III) bulletBg = 'bg-indigo-400';
          if (item.level === Level.STAFF) bulletBg = 'bg-purple-400';
          if (item.level === Level.PRINCIPAL) bulletBg = 'bg-slate-800';

          return (
            <div key={item.level} className="flex items-center space-x-2 text-sm">
              <span className={`w-3 h-3 rounded-full ${bulletBg}`} />
              <span className="font-semibold text-gray-950">{displayName}</span>
              <span className="text-gray-500">
                {item.count} ({item.percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
