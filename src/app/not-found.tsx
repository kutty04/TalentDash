import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-brand-bg flex flex-col justify-center items-center px-6 py-12 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="flex flex-col items-center">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-rose-50 text-brand-coral border border-rose-100/50 mb-4">
            404 Error
          </span>
          <h1 className="text-4xl font-extrabold text-brand-black tracking-tight sm:text-5xl">
            Page Not Found
          </h1>
          <p className="mt-3 text-base text-brand-muted max-w-xs sm:max-w-sm mx-auto font-medium">
            The career intelligence data page you requested could not be located or has been archived.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/salaries"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-full shadow-xs text-white bg-brand-coral hover:bg-brand-coral/90 transition-colors focus:outline-hidden cursor-pointer"
          >
            Back to Salaries Search
          </Link>
        </div>
      </div>
    </main>
  );
}
