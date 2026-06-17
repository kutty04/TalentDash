import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findCompanyBySlug, getCompanyStats, getAllSlugs } from '@/lib/services/company-service';
import { formatCurrencyValue } from '@/lib/formatters';
import { LevelDistributionBar } from '@/components/features/level-distribution-bar';
import { SalaryTable } from '@/components/features/salary-table';
import { Currency } from '@prisma/client';
import { Metadata } from 'next';

export const dynamicParams = true;
export const revalidate = 3600; // Trigger Incremental Static Regeneration hourly

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Pre-generates company detail pages during deployment build runner stages.
 */
export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('Failed to prebuild company detail slugs:', error);
    return [];
  }
}

/**
 * Inject SEO parameters dynamically for indexing optimization.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await findCompanyBySlug(slug);

  if (!company) {
    return {
      title: 'Company Not Found | TalentDash',
    };
  }

  const title = `${company.name} Software Engineer Salaries | TalentDash`;
  const description = `Discover salaries, bonuses, and stocks for software engineers at ${company.name}. Compare median compensation packages across engineering seniority levels.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://talentdash.com/companies/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://talentdash.com/companies/${slug}`,
      type: 'website',
    },
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch company records from service layer
  const company = await findCompanyBySlug(slug);
  if (!company) {
    notFound();
  }

  // 2. Compute statistics aggregates
  const stats = getCompanyStats(company.salaries);

  // 3. Inject Organization JSON-LD script for SEO structure
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: `https://talentdash.com/companies/${slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: company.headquarters,
    },
    foundingDate: company.founded_year ? String(company.founded_year) : undefined,
    numberOfEmployees: company.headcount_range ? {
      '@type': 'QuantitativeValue',
      value: company.headcount_range,
    } : undefined,
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* SEO Script Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="text-sm font-medium text-gray-500 mb-4 flex items-center space-x-2">
        <Link href="/salaries" className="hover:text-indigo-600">Salaries</Link>
        <span>&middot;</span>
        <span className="text-gray-900">{company.name}</span>
      </nav>

      {/* Header Info Grid */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{company.name}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {company.industry}
            </span>
          </div>
          <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>Headquarters:</strong> {company.headquarters}</span>
            {company.founded_year && <span><strong>Founded:</strong> {company.founded_year}</span>}
            {company.headcount_range && <span><strong>Employees:</strong> {company.headcount_range}</span>}
          </div>
        </div>

        {/* Action comparison slots */}
        <Link
          href={`/compare?c1=${slug}`}
          className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-semibold rounded-md shadow-xs bg-white text-gray-700 hover:bg-gray-50 transition-colors self-start md:self-auto"
        >
          Compare Company
        </Link>
      </div>

      {/* Aggregate metrics dashboards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs text-center flex flex-col justify-center min-h-[140px]">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
            Median Total Comp
          </span>
          <span className="text-3xl font-bold text-indigo-600 block">
            {formatCurrencyValue(stats.medianTotalCompensation, Currency.INR)}
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs text-center flex flex-col justify-center min-h-[140px]">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
            Compensation Range
          </span>
          <span className="text-xl font-bold text-gray-900 block">
            {formatCurrencyValue(stats.minTotalCompensation, Currency.INR)} &ndash; {formatCurrencyValue(stats.maxTotalCompensation, Currency.INR)}
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs text-center flex flex-col justify-center min-h-[140px]">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
            Total Submissions
          </span>
          <span className="text-3xl font-bold text-gray-900 block">
            {stats.totalRecords}
          </span>
        </div>
      </div>

      {/* Distribution visual representation */}
      {stats.totalRecords > 0 && (
        <LevelDistributionBar distribution={stats.levelDistribution} totalRecords={stats.totalRecords} />
      )}

      {/* Company Salary List */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-gray-900">Compensation Details</h2>
        <SalaryTable data={company.salaries as any} displayCurrency={Currency.INR} />
      </div>
    </main>
  );
}
