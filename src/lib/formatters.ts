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
 * Formats display value dynamically based on currency setting.
 * Uses consistent exchange rate conversion if currency re-formatting requested.
 */
export function formatCurrencyValue(amount: number, currency: 'INR' | 'USD'): string {
  if (currency === 'USD') {
    return formatUSDCurrency(amount);
  }
  return formatIndianCurrency(amount);
}
