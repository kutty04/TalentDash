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

  const renderDeltaBadge = (val: number) => {
    if (val > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
          +{formatCurrencyValue(val, 'INR')}
        </span>
      );
    }
    if (val < 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
          -{formatCurrencyValue(Math.abs(val), 'INR')}
        </span>
      );
    }
    return <span className="text-brand-muted text-sm font-semibold">—</span>;
  };

  const renderExperienceDeltaBadge = (val: number) => {
    if (val > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
          +{val} yrs
        </span>
      );
    }
    if (val < 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
          {val} yrs
        </span>
      );
    }
    return <span className="text-brand-muted text-sm font-semibold">—</span>;
  };

  return (
    <div className="space-y-8">
      {/* Dropdown Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
            Select Salary Record A
          </label>
          <select
            value={s1}
            onChange={(e) => handleSelect('s1', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-black focus:border-brand-coral focus:outline-hidden focus:ring-2 focus:ring-brand-coral/10 hover:border-slate-300 transition-all duration-200 cursor-pointer"
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
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
            Select Salary Record B
          </label>
          <select
            value={s2}
            onChange={(e) => handleSelect('s2', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-black focus:border-brand-coral focus:outline-hidden focus:ring-2 focus:ring-brand-coral/10 hover:border-slate-300 transition-all duration-200 cursor-pointer"
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
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3.5 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Loading spinners */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Side-by-Side Comparison Dashboards */}
      {!loading && comparison && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden transition-all duration-300 hover:shadow-premium-hover">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-slate-50/75">
              <tr>
                <th scope="col" className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">
                  Metric
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">
                  Record A
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">
                  Record B
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {/* Company */}
              <tr className="hover:bg-slate-50/20 transition-colors">
                <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-brand-muted">Company</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-brand-black">
                  <div className="flex items-center">
                    <span>{comparison.record1.company.name}</span>
                    {comparison.delta.tc_delta > 0 && (
                      <span className="inline-flex ml-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100/70 uppercase tracking-wider">
                        Higher TC
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-brand-black">
                  <div className="flex items-center">
                    <span>{comparison.record2.company.name}</span>
                    {comparison.delta.tc_delta < 0 && (
                      <span className="inline-flex ml-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100/70 uppercase tracking-wider">
                        Higher TC
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-slate-400 font-semibold">—</td>
              </tr>

              {/* Role */}
              <tr className="hover:bg-slate-50/20 transition-colors">
                <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-brand-muted">Role</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-semibold">{comparison.record1.role}</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-semibold">{comparison.record2.role}</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-slate-400 font-semibold">—</td>
              </tr>

              {/* Level */}
              <tr className="hover:bg-slate-50/20 transition-colors">
                <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-brand-muted">Level</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-bold">
                  {comparison.record1.level.replace('_', '-')}
                </td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-bold">
                  {comparison.record2.level.replace('_', '-')}
                </td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-slate-400 font-semibold">—</td>
              </tr>

              {/* Location */}
              <tr className="hover:bg-slate-50/20 transition-colors">
                <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-brand-muted">Location</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-muted font-medium">{comparison.record1.location}</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-muted font-medium">{comparison.record2.location}</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-slate-400 font-semibold">—</td>
              </tr>

              {/* Experience */}
              <tr className="hover:bg-slate-50/20 transition-colors">
                <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-brand-muted">Experience</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-semibold">{comparison.record1.experience_years} years</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-semibold">{comparison.record2.experience_years} years</td>
                <td className="px-6 py-4.5 whitespace-nowrap">
                  {renderExperienceDeltaBadge(comparison.delta.experience_delta)}
                </td>
              </tr>

              {/* Base */}
              <tr className="hover:bg-slate-50/20 transition-colors">
                <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-brand-muted">Base Salary</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-bold">
                  {formatCurrencyValue(comparison.record1.base_salary, 'INR')}
                </td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-bold">
                  {formatCurrencyValue(comparison.record2.base_salary, 'INR')}
                </td>
                <td className="px-6 py-4.5 whitespace-nowrap">
                  {renderDeltaBadge(comparison.delta.base_delta)}
                </td>
              </tr>

              {/* Bonus */}
              <tr className="hover:bg-slate-50/20 transition-colors">
                <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-brand-muted">Bonus</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-semibold">
                  {comparison.record1.bonus > 0 ? formatCurrencyValue(comparison.record1.bonus, 'INR') : '—'}
                </td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-semibold">
                  {comparison.record2.bonus > 0 ? formatCurrencyValue(comparison.record2.bonus, 'INR') : '—'}
                </td>
                <td className="px-6 py-4.5 whitespace-nowrap">
                  {renderDeltaBadge(comparison.delta.bonus_delta)}
                </td>
              </tr>

              {/* Stock */}
              <tr className="hover:bg-slate-50/20 transition-colors">
                <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-brand-muted">Stock</td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-semibold">
                  {comparison.record1.stock > 0 ? formatCurrencyValue(comparison.record1.stock, 'INR') : '—'}
                </td>
                <td className="px-6 py-4.5 whitespace-nowrap text-sm text-brand-black font-semibold">
                  {comparison.record2.stock > 0 ? formatCurrencyValue(comparison.record2.stock, 'INR') : '—'}
                </td>
                <td className="px-6 py-4.5 whitespace-nowrap">
                  {renderDeltaBadge(comparison.delta.stock_delta)}
                </td>
              </tr>

              {/* Total Compensation */}
              <tr className="bg-sky-50/50 hover:bg-sky-50 transition-colors">
                <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-[#0369A1]">Total Comp</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-sky-50 text-[#0369A1] font-extrabold text-sm border border-sky-100/70 tracking-tight text-center min-w-[110px]">
                    {formatCurrencyValue(comparison.record1.total_compensation, 'INR')}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-sky-50 text-[#0369A1] font-extrabold text-sm border border-sky-100/70 tracking-tight text-center min-w-[110px]">
                    {formatCurrencyValue(comparison.record2.total_compensation, 'INR')}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  {renderDeltaBadge(comparison.delta.tc_delta)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
