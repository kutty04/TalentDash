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
  displayCurrency: 'INR' | 'USD';
  currentSort?: string;
  currentOrder?: string;
  currentParams?: Record<string, string>;
}

export function SalaryTable({ data, displayCurrency, currentSort, currentOrder, currentParams }: TableProps) {
  const getDisplayValue = (amount: number, recordCurrency: Currency) => {
    // Live Conversion: If display currency differs from database record currency
    let val = amount;
    const rate = 83.5; // Consistent exchange rate config

    if (displayCurrency === 'USD' && recordCurrency === 'INR') {
      val = Math.round(amount / rate);
    } else if (displayCurrency === 'INR' && recordCurrency === 'USD') {
      val = Math.round(amount * rate);
    }

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

  const getVerifiedIcon = (record: SalaryRecord) => {
    if (record.is_verified) {
      return (
        <span className="inline-flex ml-1.5 text-emerald-600" title="Verified Data Contribution">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6.267 3.455a.75.75 0 00-.708.523L4.547 7.05H1.75a.75.75 0 000 1.5h3.045l1.09 3.272a.75.75 0 001.416 0L8.527 8.55h4.152l.93 2.79a.75.75 0 001.417 0l1.09-3.272H18.25a.75.75 0 000-1.5h-2.316l-.832-2.498a.75.75 0 00-1.42 0l-.93 2.79H8.25l-.89-2.67a.75.75 0 00-.708-.523zM10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-xs">
      <table className="min-w-full divide-y divide-gray-200 text-left">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Level
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {currentParams ? (
                <Link href={getSortLink('experience_years')} className="hover:text-indigo-600 flex items-center space-x-1">
                  <span>Experience</span>
                  {currentSort === 'experience_years' && (
                    <span>{currentOrder === 'desc' ? '↓' : '↑'}</span>
                  )}
                </Link>
              ) : (
                'Experience'
              )}
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Base Salary
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Bonus / Stock
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {currentParams ? (
                <Link href={getSortLink('total_compensation')} className="hover:text-indigo-600 flex items-center space-x-1">
                  <span>Total Comp</span>
                  {currentSort === 'total_compensation' && (
                    <span>{currentOrder === 'desc' ? '↓' : '↑'}</span>
                  )}
                </Link>
              ) : (
                'Total Comp'
              )}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
              {/* Company */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                <Link href={`/companies/${record.company.slug}`} className="max-w-[200px] truncate block">
                  {record.company.name}
                </Link>
              </td>

              {/* Role */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium flex items-center">
                {record.role}
                {getVerifiedIcon(record)}
              </td>

              {/* Level */}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <LevelBadge level={record.level} />
              </td>

              {/* Location */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.location}
              </td>

              {/* Experience */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.experience_years} {record.experience_years === 1 ? 'year' : 'years'}
              </td>

              {/* Base */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {getDisplayValue(record.base_salary, record.currency)}
              </td>

              {/* Bonus / Stock */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.bonus > 0 ? getDisplayValue(record.bonus, record.currency) : '—'} /{' '}
                {record.stock > 0 ? getDisplayValue(record.stock, record.currency) : '—'}
              </td>

              {/* Total Compensation (Dominant number, data blue #0369A1, bold, larger) */}
              <td className="px-6 py-4 whitespace-nowrap text-lg text-[#0369A1] font-bold">
                {getDisplayValue(record.total_compensation, record.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
