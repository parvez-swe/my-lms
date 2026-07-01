export type CurrencyCode = "BDT" | "USD" | "EUR" | "GBP";

export const SUPPORTED_CURRENCIES: {
  code: CurrencyCode;
  symbol: string;
  name: string;
}[] = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

export const DEFAULT_CURRENCY: CurrencyCode =
  (process.env.NEXT_PUBLIC_DEFAULT_CURRENCY as CurrencyCode) || "BDT";

export function getCurrencySymbol(code?: string): string {
  const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  return found?.symbol || "৳";
}

export function formatPrice(
  amount: number | undefined | null,
  currency: string = DEFAULT_CURRENCY,
  fallbackLabel?: string
): string {
  if (fallbackLabel && (amount === undefined || amount === null)) {
    return fallbackLabel;
  }
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return "Free";
  }
  if (amount === 0) return "Free";

  const symbol = getCurrencySymbol(currency);
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  if (currency === "BDT") return `${symbol}${formatted}`;
  return `${symbol}${formatted}`;
}

/** Parse legacy price strings like "$99", "৳4900", "4900" into amount + currency. */
export function parsePriceString(price: string): {
  amount: number;
  currency: CurrencyCode;
} {
  const trimmed = (price || "").trim();
  if (!trimmed || /^free$/i.test(trimmed)) {
    return { amount: 0, currency: DEFAULT_CURRENCY };
  }

  if (trimmed.includes("৳") || trimmed.toUpperCase().includes("BDT")) {
    const num = parseFloat(trimmed.replace(/[^\d.]/g, ""));
    return { amount: Number.isNaN(num) ? 0 : num, currency: "BDT" };
  }
  if (trimmed.includes("$") || trimmed.toUpperCase().includes("USD")) {
    const num = parseFloat(trimmed.replace(/[^\d.]/g, ""));
    return { amount: Number.isNaN(num) ? 0 : num, currency: "USD" };
  }
  if (trimmed.includes("€")) {
    const num = parseFloat(trimmed.replace(/[^\d.]/g, ""));
    return { amount: Number.isNaN(num) ? 0 : num, currency: "EUR" };
  }
  if (trimmed.includes("£")) {
    const num = parseFloat(trimmed.replace(/[^\d.]/g, ""));
    return { amount: Number.isNaN(num) ? 0 : num, currency: "GBP" };
  }

  const num = parseFloat(trimmed.replace(/[^\d.]/g, ""));
  return {
    amount: Number.isNaN(num) ? 0 : num,
    currency: DEFAULT_CURRENCY,
  };
}

export function resolveCoursePrice(course: {
  price?: string;
  priceAmount?: number;
  currency?: string;
  pricingType?: string;
}): { amount: number; currency: CurrencyCode; label: string } {
  if (course.pricingType === "free") {
    return { amount: 0, currency: DEFAULT_CURRENCY, label: "Free" };
  }

  if (course.priceAmount !== undefined && course.priceAmount !== null) {
    const currency = (course.currency as CurrencyCode) || DEFAULT_CURRENCY;
    return {
      amount: course.priceAmount,
      currency,
      label: formatPrice(course.priceAmount, currency),
    };
  }

  const parsed = parsePriceString(course.price || "");
  return {
    ...parsed,
    label: formatPrice(parsed.amount, parsed.currency, course.price),
  };
}
