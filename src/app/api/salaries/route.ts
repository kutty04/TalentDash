import { NextRequest, NextResponse } from 'next/server';
import { findSalaries, FindSalariesFilters } from '@/lib/services/salary-service';
import { Level, Currency } from '@prisma/client';

export const runtime = 'nodejs';

/**
 * GET /api/salaries
 * Queries salaries list using flexible filtering (company, level, role, currency, location),
 * sorting capabilities, and pagination.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract query parameters
    const company = searchParams.get('company') || undefined;
    const role = searchParams.get('role') || undefined;
    const location = searchParams.get('location') || undefined;
    
    // Parse level enum(s)
    let levels: Level[] | Level | undefined = undefined;
    const rawLevels = searchParams.getAll('level');
    if (rawLevels.length > 0) {
      const parsed: Level[] = [];
      rawLevels.forEach((val) => {
        val.split(',').forEach((v) => {
          const l = v.trim().toUpperCase().replace('-', '_');
          if (Object.values(Level).includes(l as Level)) {
            parsed.push(l as Level);
          }
        });
      });
      if (parsed.length > 0) {
        levels = parsed;
      }
    }

    // Parse currency enum
    let currency: Currency | undefined = undefined;
    const rawCurrency = searchParams.get('currency');
    if (rawCurrency) {
      currency = rawCurrency.trim().toUpperCase() as Currency;
    }

    // Sorting parameters
    const rawSort = searchParams.get('sort') || 'total_comp_desc';
    const rawOrder = searchParams.get('order') || 'desc';
    let sort: 'total_compensation' | 'submitted_at' | 'experience_years' = 'total_compensation';
    let order: 'asc' | 'desc' = 'desc';

    if (rawSort === 'total_comp_asc') {
      sort = 'total_compensation';
      order = 'asc';
    } else if (rawSort === 'total_comp_desc') {
      sort = 'total_compensation';
      order = 'desc';
    } else if (rawSort === 'date_desc') {
      sort = 'submitted_at';
      order = 'desc';
    } else if (rawSort === 'experience_years') {
      sort = 'experience_years';
      order = rawOrder === 'asc' ? 'asc' : 'desc';
    }

    // Pagination parameters
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    // 1. Query Data from the Service Layer
    const result = await findSalaries({
      company,
      role,
      level: levels,
      location,
      currency,
      sort,
      order,
      page,
      limit,
    });

    // 2. Build Response containing data and metadata
    const response = NextResponse.json(result, { status: 200 });

    // 3. Add Cache Headers (Cache for 5 mins, allow stale revalidation up to 1 hour)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: 'An unexpected server error occurred while retrieving salaries.',
      },
      { status: 500 }
    );
  }
}
