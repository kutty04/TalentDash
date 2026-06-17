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
 * Calculates aggregated statistics (true statistical median, boundaries, level counts) for a company.
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

  // 1. Sort compensation figures to compute boundaries and median
  const sortedCompensations = salaries
    .map((s) => s.total_compensation)
    .sort((a, b) => a - b);

  const minTotalCompensation = sortedCompensations[0];
  const maxTotalCompensation = sortedCompensations[sortedCompensations.length - 1];

  // 2. Compute True Statistical Median
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

  // 3. Compute Level Distribution count
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
