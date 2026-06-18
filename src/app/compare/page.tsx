import React, { Suspense } from 'react';
import { prisma } from '@/lib/db';
import { ComparisonView } from '@/components/features/comparison-view';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Compare Software Engineer Salaries | TalentDash',
  description: 'Compare side-by-side total compensation metrics, base salaries, bonuses, and stocks for software engineers across tech firms.',
  alternates: {
    canonical: 'https://talentdash.com/compare',
  },
  openGraph: {
    title: 'Compare Software Engineer Salaries | TalentDash',
    description: 'Compare side-by-side total compensation metrics, base salaries, bonuses, and stocks for software engineers across tech firms.',
    url: 'https://talentdash.com/compare',
    type: 'website',
  },
};

interface PageProps {
  searchParams: Promise<{
    c1?: string;
    s1?: string;
    s2?: string;
  }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const c1 = params.c1;
  const s1 = params.s1;

  // Query all salary listings to populate comparison dropdown selectors
  let records: any[] = [];
  try {
    records = await prisma.salary.findMany({
      include: { company: true },
      orderBy: { company: { name: 'asc' } },
    });
  } catch (error) {
    console.error('Failed to load comparison source options:', error);
  }

  // Pre-fill logic: pick a representative record (highest total comp) for the company
  let defaultS1 = '';
  if (c1 && !s1) {
    const companyRecords = records.filter(
      (r) => r.company.slug.toLowerCase() === c1.toLowerCase()
    );
    if (companyRecords.length > 0) {
      // Sort by total_compensation descending to get a representative high-paying/principal or median record
      companyRecords.sort((a, b) => b.total_compensation - a.total_compensation);
      defaultS1 = companyRecords[0].id;
    }
  }

  // Inject JSON-LD structured WebPage/Application metadata to boost SEO crawling index metrics
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Software Engineer Salary Comparison Tool',
    description: 'Compare side-by-side total compensation metrics, base salaries, bonuses, and stocks for software engineers across tech firms.',
    url: 'https://talentdash.com/compare',
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
          Salary Comparison Tool
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Select two compensation listings to run side-by-side base salary, bonus, and stock evaluations.
        </p>
      </div>

      {/* Comparison View wrapper */}
      <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}>
        <ComparisonView initialRecords={records as any} defaultS1={defaultS1} />
      </Suspense>
    </main>
  );
}
