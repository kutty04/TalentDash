import { Currency } from '@prisma/client';

/**
 * Formats a numeric value into the Indian numbering format system (Crore/Lakh) with a Rupee symbol prefix.
 * e.g., 4200000 -> ₹42,00,000
 */
export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a numeric value into US Dollar formatting.
 * e.g., 150000 -> $150,000
 */
export function formatUSDCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a numeric value into GBP formatting.
 * e.g., 85000 -> £85,000
 */
export function formatGBPCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a numeric value into EUR formatting.
 * e.g., 95000 -> €95,000
 */
export function formatEURCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats display value dynamically based on currency setting.
 * Uses consistent exchange rate conversion if currency re-formatting requested.
 */
export function formatCurrencyValue(amount: number, currency: Currency): string {
  if (currency === Currency.USD) {
    return formatUSDCurrency(amount);
  }
  if (currency === Currency.GBP) {
    return formatGBPCurrency(amount);
  }
  if (currency === Currency.EUR) {
    return formatEURCurrency(amount);
  }
  return formatIndianCurrency(amount);
}
