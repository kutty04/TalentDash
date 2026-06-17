import React from 'react';
import Link from 'next/link';

interface PaginationProps {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  currentParams: Record<string, string>;
}

export function Pagination({ meta, currentParams }: PaginationProps) {
  const { page, totalPages, total, limit, hasPrevPage, hasNextPage } = meta;

  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams(currentParams);
    params.set('page', String(targetPage));
    return `/salaries?${params.toString()}`;
  };

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow-sm">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{total > 0 ? startRecord : 0}</span> to{' '}
          <span className="font-medium">{endRecord}</span> of{' '}
          <span className="font-medium">{total}</span> records
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow-sm">
      <div className="flex flex-1 justify-between sm:hidden">
        {hasPrevPage ? (
          <Link
            href={buildPageUrl(page - 1)}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </Link>
        ) : (
          <span className="relative inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed">
            Previous
          </span>
        )}
        {hasNextPage ? (
          <Link
            href={buildPageUrl(page + 1)}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </Link>
        ) : (
          <span className="relative ml-3 inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed">
            Next
          </span>
        )}
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startRecord}</span> to{' '}
            <span className="font-medium">{endRecord}</span> of{' '}
            <span className="font-medium">{total}</span> records
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
            {hasPrevPage ? (
              <Link
                href={buildPageUrl(page - 1)}
                className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Previous</span>
                &larr;
              </Link>
            ) : (
              <span className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-300 ring-1 ring-inset ring-gray-200 bg-gray-50 cursor-not-allowed">
                &larr;
              </span>
            )}

            {Array.from({ length: totalPages }).map((_, index) => {
              const p = index + 1;
              const isCurrent = p === page;

              return (
                <Link
                  key={p}
                  href={buildPageUrl(p)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                    isCurrent
                      ? 'z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                  }`}
                >
                  {p}
                </Link>
              );
            })}

            {hasNextPage ? (
              <Link
                href={buildPageUrl(page + 1)}
                className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Next</span>
                &rarr;
              </Link>
            ) : (
              <span className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-300 ring-1 ring-inset ring-gray-200 bg-gray-50 cursor-not-allowed">
                &rarr;
              </span>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
