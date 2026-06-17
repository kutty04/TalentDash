import React from 'react';
import { Level } from '@prisma/client';
import { LEVEL_BADGE_COLORS } from '@/lib/constants';

interface BadgeProps {
  level: Level;
}

export function LevelBadge({ level }: BadgeProps) {
  const styles = LEVEL_BADGE_COLORS[level] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  const displayName = level.replace('_', '-');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${styles.bg} ${styles.text}`}
    >
      {displayName}
    </span>
  );
}
