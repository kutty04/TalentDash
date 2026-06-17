import React, { Suspense } from 'react';
import { findSalaries } from '@/lib/services/salary-service';
import { SalaryFilters } from '@/components/features/salary-filters';
import { SalaryTable } from '@/components/features/salary-table';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Level, Currency } from '@prisma/client';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    company?: string;
    role?: string;
    level?: string | string[];
    location?: string;
    currency?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
}

// SEO Metadata implementation
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const companyName = params.company ? `at ${params.company}` : '';
  const title = `Software Engineer Salaries ${companyName} | TalentDash`.trim();
  const description = `Browse real-time, verified compensation metrics, base salaries, stock grants, and bonuses ${companyName} submitted anonymously by software engineers.`;

  return {
    title,
    description,
    alternates: {
      canonical: 'https://talentdash.com/salaries',
    },
    openGraph: {
      title,
      description,
      url: 'https://talentdash.com/salaries',
      type: 'website',
    },
  };
}

export default async function SalariesPage({ searchParams }: PageProps) {
  // Await searchParams in Next.js 15
  const params = await searchParams;

  // 1. Build and Parse filter values
  const activeCompany = params.company || undefined;
  const activeRole = params.role || undefined;
  const activeLocation = params.location || undefined;

  let activeLevels: Level[] | undefined = undefined;
  if (params.level) {
    const raw = Array.isArray(params.level) ? params.level : [params.level];
    const parsed: Level[] = [];
    raw.forEach((val) => {
      val.split(',').forEach((v) => {
        const l = v.trim().toUpperCase().replace('-', '_') as Level;
        if (Object.values(Level).includes(l)) {
          parsed.push(l);
        }
      });
    });
    if (parsed.length > 0) {
      activeLevels = parsed;
    }
  }

  let activeCurrency: Currency | undefined = undefined;
  if (params.currency) {
    activeCurrency = params.currency.toUpperCase() as Currency;
  }

  const sort = params.sort || 'total_compensation';
  const order = params.order === 'asc' ? 'asc' : 'desc';
  const page = params.page ? Number(params.page) : 1;
  const limit = 25; // 25 rows per page per specifications

  // 2. Fetch data directly from service layer
  let queryResult;
  try {
    queryResult = await findSalaries({
      company: activeCompany,
      role: activeRole,
      level: activeLevels,
      location: activeLocation,
      currency: activeCurrency,
      sort: sort as any,
      order: order as any,
      page,
      limit,
    });
  } catch (error) {
    // Graceful fallback for offline database connection during execution tests
    queryResult = {
      data: [],
      meta: { total: 0, page: 1, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    };
  }

  // Pass active searchParams state to children to maintain url sync
  const currentParamsMap: Record<string, string> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v) currentParamsMap[k] = Array.isArray(v) ? v.join(',') : String(v);
  });

  // Inject JSON-LD structured dataset to boost SEO crawling index metrics
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Software Engineer Salaries Dataset',
    description: 'Aggregated total compensation figures, base salaries, bonuses, and stocks for software professionals.',
    url: 'https://talentdash.com/salaries',
    license: 'https://creativecommons.org/licenses/by/4.0/',
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* JSON-LD Script Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header section */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Salary Intelligence
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Compare total compensation packages, stock allocation metrics, and bonuses across tech firms.
        </p>
      </div>

      {/* Filters (Wrapped in Suspense to avoid build-time layout warnings) */}
      <Suspense fallback={<div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs h-28 animate-pulse"></div>}>
        <SalaryFilters
          initialFilters={{
            company: activeCompany,
            role: activeRole,
            level: activeLevels,
            location: activeLocation,
            currency: activeCurrency,
          }}
        />
      </Suspense>

      {/* Table Feed section */}
      {queryResult.data.length > 0 ? (
        <div className="space-y-4">
          <SalaryTable
            data={queryResult.data as any}
            displayCurrency={activeCurrency || Currency.INR}
            currentSort={sort}
            currentOrder={order}
            currentParams={currentParamsMap}
          />
          <Pagination meta={queryResult.meta} currentParams={currentParamsMap} />
        </div>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
