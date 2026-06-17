import { NextRequest, NextResponse } from 'next/server';
import { findCompanyBySlug, getCompanyStats } from '@/lib/services/company-service';

export const runtime = 'nodejs';

/**
 * GET /api/companies/[slug]
 * Returns company metadata, full salary list sorted by total_compensation descending,
 * median total compensation, and level distribution object.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const company = await findCompanyBySlug(slug);

    if (!company) {
      return NextResponse.json(
        { error: true, message: 'Company not found' },
        { status: 404 }
      );
    }

    const stats = getCompanyStats(company.salaries);

    const response = NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        industry: company.industry,
        headquarters: company.headquarters,
        founded_year: company.founded_year,
        headcount_range: company.headcount_range,
      },
      median_total_compensation: stats.medianTotalCompensation,
      level_distribution: stats.levelDistribution,
      salaries: company.salaries, // Pre-sorted by total_compensation descending in company-service
    }, { status: 200 });

    // Set cache headers: 1 hour cache, stale revalidation for 24 hours
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
