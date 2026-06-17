import { Level, Currency } from '@prisma/client';

export const USD_TO_INR = 83.5;

export const LEVEL_BADGE_COLORS: Record<Level, { bg: string; text: string }> = {
  [Level.SDE_I]: { bg: 'bg-slate-100', text: 'text-slate-700' },
  [Level.SDE_II]: { bg: 'bg-sky-50', text: 'text-sky-700' },
  [Level.SDE_III]: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  [Level.STAFF]: { bg: 'bg-purple-50', text: 'text-purple-700' },
  [Level.PRINCIPAL]: { bg: 'bg-slate-900', text: 'text-white' },
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
