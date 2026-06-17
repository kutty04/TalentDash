import { prisma } from '../db';
import { normalizeCompanyName, ValidatedSalaryInput } from './validation';
import { Level, Currency, Source } from '@prisma/client';

export interface FindSalariesFilters {
  company?: string;
  role?: string;
  level?: Level | Level[];
  location?: string;
  currency?: Currency;
  sort?: 'total_compensation' | 'submitted_at' | 'experience_years';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type DuplicateCheckResult = {
  isDuplicate: boolean;
  message?: string;
};

/**
 * Checks for duplicate salary submissions.
 * Standard criteria: Same company, role, level, location, submitted in the last 48 hours,
 * and base_salary within a 10% delta of the reference value.
 */
export async function checkDuplicateSubmission(
  companyId: string,
  input: ValidatedSalaryInput
): Promise<DuplicateCheckResult> {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // Retrieve records matching basic keys within 48h
  const existingSalaries = await prisma.salary.findMany({
    where: {
      company_id: companyId,
      role: { equals: input.role, mode: 'insensitive' },
      level: input.level,
      location: { equals: input.location, mode: 'insensitive' },
      submitted_at: { gte: fortyEightHoursAgo },
    },
  });

  for (const existing of existingSalaries) {
    const delta = Math.abs(input.base_salary - existing.base_salary);
    const tolerance = existing.base_salary * 0.1; // 10% threshold

    if (delta <= tolerance) {
      return {
        isDuplicate: true,
        message: `Duplicate entry detected: An identical salary listing with base salary close to ₹/USD ${existing.base_salary} was submitted within the last 48 hours.`,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Creates a new Salary entry and links/creates the normalized Company.
 */
export async function createSalary(input: ValidatedSalaryInput) {
  const { normalizedName, slug } = normalizeCompanyName(input.company);

  // 1. Get or create the company
  const company = await prisma.company.upsert({
    where: { normalized_name: normalizedName },
    update: {},
    create: {
      name: input.company,
      slug,
      normalized_name: normalizedName,
      industry: 'Technology', // Default generic fallback, updated when verified
      headquarters: input.location, // Default fallback
    },
  });

  // 2. Perform duplicate checks
  const dupCheck = await checkDuplicateSubmission(company.id, input);
  if (dupCheck.isDuplicate) {
    throw new Error(dupCheck.message || 'Duplicate submission detected.');
  }

  // 3. Compute Total Compensation (base + bonus + stock)
  const totalCompensation = input.base_salary + input.bonus + input.stock;

  // 4. Create the salary entry
  const salary = await prisma.salary.create({
    data: {
      company_id: company.id,
      role: input.role,
      level: input.level,
      location: input.location,
      currency: input.currency,
      experience_years: input.experience_years,
      base_salary: input.base_salary,
      bonus: input.bonus,
      stock: input.stock,
      total_compensation: totalCompensation,
      source: input.source,
      confidence_score: input.confidence_score ?? 1.0,
      is_verified: input.source === Source.VERIFIED_EMAIL || input.source === Source.OFFER_LETTER || (input.is_verified ?? false),
    },
    include: {
      company: true,
    },
  });

  return salary;
}

/**
 * Queries and lists salaries using flexible filters, pagination, and sorting.
 */
export async function findSalaries(filters: FindSalariesFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 25)); // Enforce max limit cap of 100, default is 25
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  // Apply filters
  if (filters.company) {
    const { normalizedName } = normalizeCompanyName(filters.company);
    whereClause.company = {
      normalized_name: { contains: normalizedName, mode: 'insensitive' },
    };
  }

  if (filters.role) {
    whereClause.role = { contains: filters.role, mode: 'insensitive' };
  }

  if (filters.level) {
    if (Array.isArray(filters.level)) {
      whereClause.level = { in: filters.level };
    } else {
      whereClause.level = filters.level;
    }
  }

  if (filters.location) {
    whereClause.location = { contains: filters.location, mode: 'insensitive' };
  }

  if (filters.currency) {
    whereClause.currency = filters.currency;
  }

  // Determine sorting order
  const allowedSortFields = ['total_compensation', 'submitted_at', 'experience_years'];
  const sortBy = allowedSortFields.includes(filters.sort || '')
    ? (filters.sort as string)
    : 'total_compensation';
  const order = filters.order === 'asc' ? 'asc' : 'desc';

  // Run transactional query (count + data) to avoid pagination drift
  const [salaries, totalCount] = await prisma.$transaction([
    prisma.salary.findMany({
      where: whereClause,
      include: {
        company: true,
      },
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take: limit,
    }),
    prisma.salary.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: salaries,
    meta: {
      total: totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
