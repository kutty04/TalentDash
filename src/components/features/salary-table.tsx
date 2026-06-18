import React from 'react';
import Link from 'next/link';
import { LevelBadge } from '../ui/badge';
import { formatCurrencyValue } from '@/lib/formatters';
import { Level, Currency, Source } from '@prisma/client';

interface SalaryRecord {
  id: string;
  company: {
    name: string;
    slug: string;
  };
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
  source: Source;
  is_verified: boolean;
  submitted_at: Date;
}

interface TableProps {
  data: SalaryRecord[];
  displayCurrency: Currency;
  currentSort?: string;
  currentOrder?: string;
  currentParams?: Record<string, string>;
}

const CONVERSION_RATES: Record<Currency, number> = {
  [Currency.USD]: 1.0,
  [Currency.INR]: 83.5,
  [Currency.GBP]: 0.79,
  [Currency.EUR]: 0.92,
};

export function SalaryTable({ data, displayCurrency, currentSort, currentOrder, currentParams }: TableProps) {
  const getDisplayValue = (amount: number, recordCurrency: Currency) => {
    if (displayCurrency === recordCurrency) {
      return formatCurrencyValue(amount, displayCurrency);
    }

    // Convert to USD first (base currency)
    const rateToUSD = CONVERSION_RATES[recordCurrency] || 1.0;
    const amountInUSD = amount / rateToUSD;

    // Convert from USD to displayCurrency
    const rateFromUSD = CONVERSION_RATES[displayCurrency] || 1.0;
    const val = Math.round(amountInUSD * rateFromUSD);

    return formatCurrencyValue(val, displayCurrency);
  };

  const getSortLink = (field: string) => {
    if (!currentParams) return '#';
    const params = new URLSearchParams(currentParams);

    if (field === 'total_compensation') {
      // Toggle logic for total compensation
      if (currentSort === 'total_compensation') {
        params.set('sort', currentOrder === 'desc' ? 'total_comp_asc' : 'total_comp_desc');
        params.delete('order');
      } else {
        params.set('sort', 'total_comp_desc');
        params.delete('order');
      }
    } else if (field === 'experience_years') {
      // Toggle logic for experience years
      if (currentSort === 'experience_years') {
        params.set('sort', 'experience_years');
        params.set('order', currentOrder === 'desc' ? 'asc' : 'desc');
      } else {
        params.set('sort', 'experience_years');
        params.set('order', 'desc');
      }
    }
    params.set('page', '1'); // Reset pagination to page 1 on sort change
    return `/salaries?${params.toString()}`;
  };

  const renderSortArrow = (field: string) => {
    if (currentSort !== field) return null;
    return currentOrder === 'desc' ? (
      <svg className="w-3.5 h-3.5 text-brand-coral shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5 text-brand-coral shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    );
  };

  const getVerifiedIcon = (record: SalaryRecord) => {
    if (record.is_verified) {
      return (
        <span className="inline-flex items-center justify-center ml-1.5 text-emerald-500 bg-emerald-50 border border-emerald-100 rounded-full p-0.5 shrink-0" title="Verified Data Contribution">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="overflow-hidden border border-slate-100 rounded-2xl bg-white shadow-premium transition-all duration-300 hover:shadow-premium-hover">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left border-collapse">
          <thead className="bg-slate-50/75">
            <tr>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">
                Level
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">
                {currentParams ? (
                  <Link href={getSortLink('experience_years')} className="hover:text-brand-coral flex items-center space-x-1.5 transition-colors">
                    <span>Experience</span>
                    {renderSortArrow('experience_years')}
                  </Link>
                ) : (
                  'Experience'
                )}
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">
                Base Salary
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">
                Bonus / Stock
              </th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">
                {currentParams ? (
                  <Link href={getSortLink('total_compensation')} className="hover:text-brand-coral flex items-center space-x-1.5 transition-colors">
                    <span>Total Comp</span>
                    {renderSortArrow('total_compensation')}
                  </Link>
                ) : (
                  'Total Comp'
                )}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50/40 hover:shadow-[inset_3px_0_0_0_#FF5A5F] transition-all duration-200">
                {/* Company */}
                <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-brand-black hover:text-brand-coral transition-colors">
                  <Link href={`/companies/${record.company.slug}`} className="max-w-[180px] truncate block">
                    {record.company.name}
                  </Link>
                </td>

                {/* Role */}
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-semibold">
                  <div className="flex items-center">
                    <span className="truncate max-w-[200px]">{record.role}</span>
                    {getVerifiedIcon(record)}
                  </div>
                </td>

                {/* Level */}
                <td className="px-6 py-4.5 whitespace-nowrap text-sm">
                  <LevelBadge level={record.level} />
                </td>

                {/* Location */}
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-muted font-medium">
                  {record.location}
                </td>

                {/* Experience */}
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-muted font-medium">
                  {record.experience_years} {record.experience_years === 1 ? 'yr' : 'yrs'}
                </td>

                {/* Base */}
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-bold">
                  {getDisplayValue(record.base_salary, record.currency)}
                </td>

                {/* Bonus / Stock */}
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-muted font-medium">
                  {record.bonus > 0 ? getDisplayValue(record.bonus, record.currency) : '—'}{' '}
                  <span className="text-slate-300 mx-1">/</span>{' '}
                  {record.stock > 0 ? getDisplayValue(record.stock, record.currency) : '—'}
                </td>

                {/* Total Compensation (Dominant number, data blue #0369A1, bold, larger, badge style) */}
                <td className="px-6 py-4.5 whitespace-nowrap">
                  <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-sky-50 text-[#0369A1] font-bold text-base border border-sky-100/70 tracking-tight text-center min-w-[110px]">
                    {getDisplayValue(record.total_compensation, record.currency)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
