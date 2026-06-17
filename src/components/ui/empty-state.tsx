import React from 'react';
import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-dashed border-gray-300 rounded-lg shadow-xs mt-6 text-center">
      <svg
        className="w-12 h-12 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">No Salary Records Found</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-5">
        We could not find any compensation data matching your selected filters. Try broadening your query or clearing active constraints.
      </p>
      <a
        href="/salaries"
        className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-full shadow-xs text-white bg-brand-coral hover:bg-brand-coral/90 transition-colors focus:outline-hidden cursor-pointer"
      >
        Clear All Filters
      </a>
    </div>
  );
}
