'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrencyValue } from '@/lib/formatters';

interface SalaryRecord {
  id: string;
  company: {
    name: string;
  };
  role: string;
  level: string;
  location: string;
  currency: string;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
}

interface ComparisonData {
  record1: SalaryRecord;
  record2: SalaryRecord;
  delta: {
    base_delta: number;
    bonus_delta: number;
    stock_delta: number;
    tc_delta: number;
    experience_delta: number;
  };
}

interface Props {
  initialRecords: SalaryRecord[];
}

export function ComparisonView({ initialRecords }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dropdown states
  const [s1, setS1] = useState(searchParams.get('s1') || '');
  const [s2, setS2] = useState(searchParams.get('s2') || '');
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Trigger comparison data fetch when s1 or s2 changes
  useEffect(() => {
    if (!s1 || !s2) {
      setComparison(null);
      setError(null);
      return;
    }

    if (s1 === s2) {
      setError('Cannot compare a salary record with itself.');
      setComparison(null);
      return;
    }

    const fetchComparison = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/compare?s1=${s1}&s2=${s2}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Failed to fetch comparison.');
          setComparison(null);
        } else {
          setComparison(data);
        }
      } catch (err) {
        setError('Connection error: Failed to fetch comparison data.');
        setComparison(null);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [s1, s2]);

  // Sync selectors and push parameters state to URL
  const handleSelect = (slot: 's1' | 's2', val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slot === 's1') {
      setS1(val);
      if (val) params.set('s1', val);
      else params.delete('s1');
    } else {
      setS2(val);
      if (val) params.set('s2', val);
      else params.delete('s2');
    }
    router.push(`/compare?${params.toString()}`);
  };

  const getDeltaStyle = (val: number) => {
    if (val > 0) return 'text-emerald-700 font-bold';
    if (val < 0) return 'text-rose-600 font-bold';
    return 'text-gray-500 font-semibold';
  };

  const formatDelta = (val: number) => {
    if (val > 0) return `+${formatCurrencyValue(val, 'INR')}`;
    if (val < 0) return `-${formatCurrencyValue(Math.abs(val), 'INR')}`;
    return '—';
  };

  return (
    <div className="space-y-8">
      {/* Dropdown Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Select Salary Record A
          </label>
          <select
            value={s1}
            onChange={(e) => handleSelect('s1', e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Choose a listing...</option>
            {initialRecords.map((r) => (
              <option key={r.id} value={r.id}>
                {r.company.name} &middot; {r.role} &middot; {r.level.replace('_', '-')} ({r.location})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Select Salary Record B
          </label>
          <select
            value={s2}
            onChange={(e) => handleSelect('s2', e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Choose a listing...</option>
            {initialRecords.map((r) => (
              <option key={r.id} value={r.id}>
                {r.company.name} &middot; {r.role} &middot; {r.level.replace('_', '-')} ({r.location})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error alert warnings */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading spinners */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Side-by-Side Comparison Dashboards */}
      {!loading && comparison && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Record A
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Record B
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* Company */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500">Company</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 flex items-center">
                  {comparison.record1.company.name}
                  {comparison.delta.tc_delta > 0 && (
                    <span className="inline-flex ml-2.5 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      Higher TC
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {comparison.record2.company.name}
                  {comparison.delta.tc_delta < 0 && (
                    <span className="inline-flex ml-2.5 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      Higher TC
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">—</td>
              </tr>

              {/* Role */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500">Role</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comparison.record1.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comparison.record2.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">—</td>
              </tr>

              {/* Level */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500">Level</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {comparison.record1.level.replace('_', '-')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {comparison.record2.level.replace('_', '-')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">—</td>
              </tr>

              {/* Location */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500">Location</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comparison.record1.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comparison.record2.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">—</td>
              </tr>

              {/* Experience */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500">Experience</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comparison.record1.experience_years} years</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comparison.record2.experience_years} years</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getDeltaStyle(comparison.delta.experience_delta)}`}>
                  {comparison.delta.experience_delta > 0 ? `+${comparison.delta.experience_delta} yrs` : comparison.delta.experience_delta < 0 ? `${comparison.delta.experience_delta} yrs` : '—'}
                </td>
              </tr>

              {/* Base */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500">Base Salary</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {formatCurrencyValue(comparison.record1.base_salary, 'INR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {formatCurrencyValue(comparison.record2.base_salary, 'INR')}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getDeltaStyle(comparison.delta.base_delta)}`}>
                  {formatDelta(comparison.delta.base_delta)}
                </td>
              </tr>

              {/* Bonus */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500">Bonus</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {comparison.record1.bonus > 0 ? formatCurrencyValue(comparison.record1.bonus, 'INR') : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {comparison.record2.bonus > 0 ? formatCurrencyValue(comparison.record2.bonus, 'INR') : '—'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getDeltaStyle(comparison.delta.bonus_delta)}`}>
                  {formatDelta(comparison.delta.bonus_delta)}
                </td>
              </tr>

              {/* Stock */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500">Stock</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {comparison.record1.stock > 0 ? formatCurrencyValue(comparison.record1.stock, 'INR') : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {comparison.record2.stock > 0 ? formatCurrencyValue(comparison.record2.stock, 'INR') : '—'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getDeltaStyle(comparison.delta.stock_delta)}`}>
                  {formatDelta(comparison.delta.stock_delta)}
                </td>
              </tr>

              {/* Total Compensation */}
              <tr className="bg-indigo-50/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-700">Total Comp</td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-indigo-900 font-extrabold">
                  {formatCurrencyValue(comparison.record1.total_compensation, 'INR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg text-indigo-900 font-extrabold">
                  {formatCurrencyValue(comparison.record2.total_compensation, 'INR')}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-base ${getDeltaStyle(comparison.delta.tc_delta)}`}>
                  {formatDelta(comparison.delta.tc_delta)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
