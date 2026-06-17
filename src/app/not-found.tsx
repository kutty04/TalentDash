import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6 py-12 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="flex flex-col items-center">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-rose-100 text-rose-700 mb-4">
            404 Error
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Page Not Found
          </h1>
          <p className="mt-3 text-base text-gray-500 max-w-xs sm:max-w-sm mx-auto">
            The career intelligence data page you requested could not be located or has been archived.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/salaries"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-semibold rounded-md shadow-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:outline-hidden"
          >
            Back to Salaries Search
          </Link>
        </div>
      </div>
    </main>
  );
}
