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

export default async function ComparePage() {
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
        <ComparisonView initialRecords={records as any} />
      </Suspense>
    </main>
  );
}
