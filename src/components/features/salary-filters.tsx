'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Level, Currency } from '@prisma/client';
import { COMMON_ROLES, COMMON_LOCATIONS } from '@/lib/constants';

interface FiltersProps {
  initialFilters: {
    company?: string;
    role?: string;
    level?: Level | Level[];
    location?: string;
    currency?: Currency;
  };
}

export function SalaryFilters({ initialFilters }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const getInitialLevels = (l: Level | Level[] | undefined): Level[] => {
    if (!l) return [];
    if (Array.isArray(l)) return l;
    return [l];
  };

  // Local state for interactive elements
  const [company, setCompany] = useState(initialFilters.company || '');
  const [role, setRole] = useState(initialFilters.role || '');
  const [selectedLevels, setSelectedLevels] = useState<Level[]>(getInitialLevels(initialFilters.level));
  const [location, setLocation] = useState(initialFilters.location || '');
  const [currency, setCurrency] = useState<Currency>(initialFilters.currency || Currency.INR);

  // Sync state if initialFilters change from external routing
  useEffect(() => {
    setCompany(initialFilters.company || '');
    setRole(initialFilters.role || '');
    setSelectedLevels(getInitialLevels(initialFilters.level));
    setLocation(initialFilters.location || '');
    setCurrency(initialFilters.currency || Currency.INR);
  }, [initialFilters]);

  // Apply filters by pushing parameters state to Router
  const applyFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset to page 1 on filter changes

    Object.entries(updates).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/salaries?${params.toString()}`);
    });
  };

  // Debounced input helper for company name search
  useEffect(() => {
    if (company === (initialFilters.company || '')) return;

    const timer = setTimeout(() => {
      applyFilters({ company: company.trim() });
    }, 300); // Debounce set to 300ms per specification

    return () => clearTimeout(timer);
  }, [company]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setRole(val);
    applyFilters({ role: val });
  };

  const handleLevelCheckboxChange = (lvl: Level, checked: boolean) => {
    let updated: Level[];
    if (checked) {
      updated = [...selectedLevels, lvl];
    } else {
      updated = selectedLevels.filter((x) => x !== lvl);
    }
    setSelectedLevels(updated);
    applyFilters({ level: updated.length > 0 ? updated.join(',') : undefined });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLocation(val);
    applyFilters({ location: val });
  };

  const handleCurrencyToggle = (curr: Currency) => {
    setCurrency(curr);
    applyFilters({ currency: curr });
  };

  const handleClearAll = () => {
    setCompany('');
    setRole('');
    setSelectedLevels([]);
    setLocation('');
    setCurrency(Currency.INR);
    
    startTransition(() => {
      router.push('/salaries');
    });
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4 relative">
      {/* Loading Transition Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-20">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Company Filter */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Company</label>
          <input
            type="text"
            placeholder="Search e.g. Google..."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Role Filter */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Role</label>
          <select
            value={role}
            onChange={handleRoleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            {COMMON_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter (Multi-select checkboxes) */}
        <div className="md:col-span-2 lg:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Levels</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2 border border-gray-300 rounded-md px-3 py-2 bg-white min-h-[38px] items-center">
            {Object.values(Level).map((l) => {
              const isChecked = selectedLevels.includes(l);
              return (
                <label key={l} className="inline-flex items-center space-x-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleLevelCheckboxChange(l, e.target.checked)}
                    className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span>{l.replace('_', '-')}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Location Filter */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</label>
          <select
            value={location}
            onChange={handleLocationChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Locations</option>
            {COMMON_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-4 gap-3">
        {/* Currency Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Currency:</span>
          <div className="inline-flex rounded-md shadow-xs bg-gray-100 p-0.5" role="group">
            <button
              type="button"
              onClick={() => handleCurrencyToggle(Currency.INR)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currency === Currency.INR ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              INR (₹)
            </button>
            <button
              type="button"
              onClick={() => handleCurrencyToggle(Currency.USD)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currency === Currency.USD ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* Clear Filters Link */}
        <button
          onClick={handleClearAll}
          className="text-sm font-medium text-gray-500 hover:text-indigo-600 self-start sm:self-auto transition-colors"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
