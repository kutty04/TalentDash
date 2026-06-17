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
      <nav className="text-xs font-bold text-brand-muted mb-4 flex items-center space-x-2.5">
        <Link href="/salaries" className="hover:text-brand-coral transition-colors">Salaries</Link>
        <span className="text-slate-300">&middot;</span>
        <span className="text-brand-black">{company.name}</span>
      </nav>

      {/* Header Info Grid */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-premium-hover">
        <div className="space-y-3">
          <div className="flex items-center flex-wrap gap-3">
            <h1 className="text-3xl font-extrabold text-brand-black tracking-tight">{company.name}</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-brand-coral border border-rose-100/50">
              {company.industry}
            </span>
          </div>
          <div className="text-sm text-brand-muted flex flex-wrap gap-x-5 gap-y-1 font-medium">
            <span><strong>Headquarters:</strong> {company.headquarters}</span>
            {company.founded_year && <span><strong>Founded:</strong> {company.founded_year}</span>}
            {company.headcount_range && <span><strong>Employees:</strong> {company.headcount_range}</span>}
          </div>
        </div>

        {/* Action comparison slots */}
        <Link
          href={`/compare?c1=${slug}`}
          className="inline-flex items-center justify-center px-5 py-2.5 border border-brand-coral text-sm font-bold rounded-full bg-white text-brand-coral hover:bg-rose-50/50 hover:shadow-[0_2px_8px_rgba(255,90,95,0.15)] transition-all duration-200 self-start md:self-auto cursor-pointer"
        >
          Compare Company
        </Link>
      </div>

      {/* Aggregate metrics dashboards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium text-center flex flex-col justify-center min-h-[140px] relative overflow-hidden transition-all duration-300 hover:shadow-premium-hover">
          <div className="absolute top-0 inset-x-0 h-1 bg-brand-coral"></div>
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2.5 block">
            Median Total Comp
          </span>
          <span className="text-3xl font-extrabold text-brand-coral block tracking-tight">
            {formatCurrencyValue(stats.medianTotalCompensation, Currency.INR)}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium text-center flex flex-col justify-center min-h-[140px] relative overflow-hidden transition-all duration-300 hover:shadow-premium-hover">
          <div className="absolute top-0 inset-x-0 h-1 bg-sky-500"></div>
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2.5 block">
            Compensation Range
          </span>
          <span className="text-xl font-extrabold text-brand-black block tracking-tight">
            {formatCurrencyValue(stats.minTotalCompensation, Currency.INR)} &ndash; {formatCurrencyValue(stats.maxTotalCompensation, Currency.INR)}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium text-center flex flex-col justify-center min-h-[140px] relative overflow-hidden transition-all duration-300 hover:shadow-premium-hover">
          <div className="absolute top-0 inset-x-0 h-1 bg-slate-800"></div>
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2.5 block">
            Total Submissions
          </span>
          <span className="text-3xl font-extrabold text-brand-black block tracking-tight">
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
