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
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium transition-all duration-300 hover:shadow-premium-hover space-y-5 relative">
      {/* Loading Transition Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-20">
          <div className="w-6 h-6 border-2 border-brand-coral border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Company Filter */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Company</label>
          <input
            type="text"
            placeholder="Search e.g. Google..."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm placeholder-slate-400 focus:border-brand-coral focus:outline-hidden focus:ring-2 focus:ring-brand-coral/10 hover:border-slate-300 transition-all duration-200"
          />
        </div>

        {/* Role Filter */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Role</label>
          <select
            value={role}
            onChange={handleRoleChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-gray-905 focus:border-brand-coral focus:outline-hidden focus:ring-2 focus:ring-brand-coral/10 hover:border-slate-300 transition-all duration-200 cursor-pointer"
          >
            <option value="">All Roles</option>
            {COMMON_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter (Multi-select custom chips) */}
        <div className="md:col-span-2 lg:col-span-2">
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Levels</label>
          <div className="flex flex-wrap gap-2 min-h-[38px] items-center">
            {Object.values(Level).map((l) => {
              const isChecked = selectedLevels.includes(l);
              return (
                <button
                  type="button"
                  key={l}
                  onClick={() => handleLevelCheckboxChange(l, !isChecked)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer select-none ${
                    isChecked
                      ? 'bg-brand-coral border-brand-coral text-white shadow-[0_2px_6px_rgba(255,90,95,0.25)]'
                      : 'bg-white border-slate-200 text-brand-dark hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {l.replace('_', '-')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location Filter */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Location</label>
          <select
            value={location}
            onChange={handleLocationChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-gray-905 focus:border-brand-coral focus:outline-hidden focus:ring-2 focus:ring-brand-coral/10 hover:border-slate-300 transition-all duration-200 cursor-pointer"
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 gap-3">
        {/* Currency Switcher */}
        <div className="flex items-center space-x-2.5">
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Currency:</span>
          <div className="inline-flex rounded-full bg-slate-100 p-0.5 border border-slate-200/30" role="group">
            <button
              type="button"
              onClick={() => handleCurrencyToggle(Currency.INR)}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                currency === Currency.INR ? 'bg-white text-brand-black shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'text-brand-muted hover:text-brand-black'
              }`}
            >
              INR (₹)
            </button>
            <button
              type="button"
              onClick={() => handleCurrencyToggle(Currency.USD)}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                currency === Currency.USD ? 'bg-white text-brand-black shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'text-brand-muted hover:text-brand-black'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => handleCurrencyToggle(Currency.GBP)}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                currency === Currency.GBP ? 'bg-white text-brand-black shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'text-brand-muted hover:text-brand-black'
              }`}
            >
              GBP (£)
            </button>
            <button
              type="button"
              onClick={() => handleCurrencyToggle(Currency.EUR)}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                currency === Currency.EUR ? 'bg-white text-brand-black shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'text-brand-muted hover:text-brand-black'
              }`}
            >
              EUR (€)
            </button>
          </div>
        </div>

        {/* Clear Filters Link */}
        <button
          onClick={handleClearAll}
          className="text-sm font-semibold text-brand-muted hover:text-brand-coral self-start sm:self-auto transition-colors cursor-pointer"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
