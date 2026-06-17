import { prisma } from '../db';
import { Level } from '@prisma/client';

export interface CompanyStats {
  medianTotalCompensation: number;
  minTotalCompensation: number;
  maxTotalCompensation: number;
  totalRecords: number;
  levelDistribution: Record<Level, number>;
}

/**
 * Retrieves all company slugs currently stored in the database for build-time generation.
 */
export async function getAllSlugs(): Promise<string[]> {
  const companies = await prisma.company.findMany({
    select: { slug: true },
  });
  return companies.map((c) => c.slug);
}

/**
 * Finds a company and its salaries using the URL slug identifier.
 */
export async function findCompanyBySlug(slug: string) {
  return prisma.company.findUnique({
    where: { slug },
    include: {
      salaries: {
        include: {
          company: true,
        },
        orderBy: {
          total_compensation: 'desc',
        },
      },
    },
  });
}

/**
 * Exchange rates to normalize any supported currency into INR.
 * These mirror the rates already used by the display layer (salary-table.tsx)
 * so that aggregated statistics are internally consistent with displayed values.
 *
 * Derivation:
 *   USD base rate = 1.0 → 1 USD = 83.5 INR
 *   GBP rate vs USD = 0.79 → 1 GBP = (1/0.79) × 83.5 ≈ 105.70 INR
 *   EUR rate vs USD = 0.92 → 1 EUR = (1/0.92) × 83.5 ≈ 90.76 INR
 */
const COMP_TO_INR: Record<string, number> = {
  INR: 1.0,
  USD: 83.5,
  GBP: 105.70,
  EUR: 90.76,
};

/**
 * Calculates aggregated statistics (true statistical median, boundaries, level counts) for a company.
 * All monetary statistics (median, min, max) are normalized to INR before computation so that
 * mixed-currency companies (e.g., Google with USD/GBP/INR records) are ranked correctly.
 * The display layer remains responsible for per-record formatting and conversion.
 */
export function getCompanyStats(salaries: any[]): CompanyStats {
  const totalRecords = salaries.length;
  if (totalRecords === 0) {
    return {
      medianTotalCompensation: 0,
      minTotalCompensation: 0,
      maxTotalCompensation: 0,
      totalRecords: 0,
      levelDistribution: {} as Record<Level, number>,
    };
  }

  // 1. Normalize all total_compensation values to INR, then sort for statistical calculations.
  //    Without this step, raw integers across currencies are compared directly, producing
  //    incorrect ordering (e.g. GBP £85,000 < INR ₹1,600,000 numerically, but > in real value).
  const sortedCompensations = salaries
    .map((s) => Math.round(s.total_compensation * (COMP_TO_INR[s.currency] ?? 1.0)))
    .sort((a, b) => a - b);

  const minTotalCompensation = sortedCompensations[0];
  const maxTotalCompensation = sortedCompensations[sortedCompensations.length - 1];

  // 2. Compute True Statistical Median (on INR-normalized values)
  let medianTotalCompensation = 0;
  const midIndex = Math.floor(totalRecords / 2);
  if (totalRecords % 2 === 0) {
    // Even number of records: average the two middle values
    medianTotalCompensation = Math.round(
      (sortedCompensations[midIndex - 1] + sortedCompensations[midIndex]) / 2
    );
  } else {
    // Odd number of records: select the exact middle value
    medianTotalCompensation = sortedCompensations[midIndex];
  }

  // 3. Compute Level Distribution count (currency-agnostic, unchanged)
  const levelDistribution = {} as Record<Level, number>;
  salaries.forEach((s) => {
    const lvl = s.level as Level;
    levelDistribution[lvl] = (levelDistribution[lvl] || 0) + 1;
  });

  return {
    medianTotalCompensation,
    minTotalCompensation,
    maxTotalCompensation,
    totalRecords,
    levelDistribution,
  };
}
