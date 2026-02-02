/**
 * Currency formatting utilities
 * All amounts in the API are stored in cents (integer)
 * Display values should be in dollars (decimal)
 */

const LOCALE = "en-US"
const CURRENCY = "USD"

/**
 * Format cents to display currency string
 * @param cents - Amount in cents (e.g., 2599)
 * @returns Formatted currency string (e.g., "$25.99")
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
  }).format(dollars)
}

/**
 * Format cents to decimal number without currency symbol
 * @param cents - Amount in cents (e.g., 2599)
 * @returns Decimal number (e.g., 25.99)
 */
export function centsToDollars(cents: number): number {
  return cents / 100
}

/**
 * Convert dollars to cents for API submission
 * @param dollars - Amount in dollars (e.g., 25.99)
 * @returns Amount in cents (e.g., 2599)
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/**
 * Format a number as currency without cents
 * @param cents - Amount in cents (e.g., 259900)
 * @returns Formatted currency string without cents (e.g., "$2,599")
 */
export function formatCurrencyNoCents(cents: number): string {
  const dollars = cents / 100
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars)
}

/**
 * Parse a currency string input to cents
 * @param input - Currency string (e.g., "$25.99" or "25.99")
 * @returns Amount in cents (e.g., 2599)
 */
export function parseCurrencyInput(input: string): number {
  // Remove currency symbol and any non-numeric characters except decimal point
  const cleaned = input.replace(/[^0-9.-]/g, "")
  const dollars = parseFloat(cleaned)
  if (isNaN(dollars)) {
    return 0
  }
  return dollarsToCents(dollars)
}
