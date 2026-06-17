import { Level, Currency } from '@prisma/client';

export const USD_TO_INR = 83.5;

export const LEVEL_BADGE_COLORS: Record<Level, { bg: string; text: string }> = {
  [Level.L3]: { bg: 'bg-zinc-100', text: 'text-zinc-700' },
  [Level.L4]: { bg: 'bg-blue-50', text: 'text-blue-700' },
  [Level.L5]: { bg: 'bg-violet-50', text: 'text-violet-700' },
  [Level.L6]: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700' },
  [Level.SDE_I]: { bg: 'bg-slate-100', text: 'text-slate-700' },
  [Level.SDE_II]: { bg: 'bg-sky-50', text: 'text-sky-700' },
  [Level.SDE_III]: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  [Level.STAFF]: { bg: 'bg-purple-50', text: 'text-purple-700' },
  [Level.PRINCIPAL]: { bg: 'bg-slate-900', text: 'text-white' },
  [Level.IC4]: { bg: 'bg-amber-50', text: 'text-amber-700' },
  [Level.IC5]: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

export const COMMON_ROLES = [
  'Software Engineer',
  'Software Engineer II',
  'Senior Software Engineer',
  'SDE I',
  'SDE II',
  'SDE III',
  'Staff Software Engineer',
  'Principal Engineer',
  'Systems Engineer',
  'IT Analyst',
];

export const COMMON_LOCATIONS = [
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Mumbai',
  'Chennai',
  'Delhi',
  'Mountain View',
  'Redmond',
  'Seattle',
  'London',
];
