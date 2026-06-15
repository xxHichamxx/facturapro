import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "MAD"): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, format: "short" | "long" = "short"): string {
  const d = new Date(date);
  if (format === "long") {
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const UNITS = [
  "", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
  "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf",
];

const TENS = [
  "", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix",
];

function numberToFrenchWords(n: number): string {
  if (n === 0) return "zéro";
  if (n < 0) return "moins " + numberToFrenchWords(-n);
  if (n < 20) return UNITS[n];
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    if (ten === 7 || ten === 9) {
      // 70-79 and 90-99
      const base = TENS[ten - 1];
      const sub = 10 + unit;
      return base + "-" + UNITS[sub];
    }
    if (ten === 8) {
      // 80-89
      if (unit === 0) return "quatre-vingts";
      return "quatre-vingt-" + UNITS[unit];
    }
    if (unit === 1 && (ten === 2 || ten === 3 || ten === 4 || ten === 5 || ten === 6)) {
      return TENS[ten] + " et un";
    }
    if (unit === 0) return TENS[ten];
    return TENS[ten] + "-" + UNITS[unit];
  }
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    if (hundreds === 1) {
      if (rest === 0) return "cent";
      return "cent " + numberToFrenchWords(rest);
    }
    const prefix = UNITS[hundreds] + " cent" + (rest === 0 ? "s" : "");
    if (rest === 0) return prefix;
    return prefix + " " + numberToFrenchWords(rest);
  }
  if (n < 1000000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    const prefix = (thousands === 1 ? "mille" : numberToFrenchWords(thousands) + " mille");
    if (rest === 0) return prefix;
    return prefix + " " + numberToFrenchWords(rest);
  }
  if (n < 1000000000) {
    const millions = Math.floor(n / 1000000);
    const rest = n % 1000000;
    const prefix = (millions === 1 ? "un million" : numberToFrenchWords(millions) + " millions");
    if (rest === 0) return prefix;
    return prefix + " " + numberToFrenchWords(rest);
  }
  return n.toString();
}

export function amountToFrenchWords(amount: number, currency: string = "MAD"): string {
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  const currencyNames: Record<string, { singular: string; plural: string; cent: string }> = {
    MAD: { singular: "dirham", plural: "dirhams", cent: "centime" },
    EUR: { singular: "euro", plural: "euros", cent: "centime" },
    USD: { singular: "dollar", plural: "dollars", cent: "cent" },
  };

  const cn = currencyNames[currency] ?? currencyNames.MAD;
  const main = integerPart > 1 ? cn.plural : cn.singular;
  const cents = decimalPart > 1 ? cn.cent + "s" : cn.cent;

  let result = numberToFrenchWords(integerPart) + " " + main;

  if (decimalPart > 0) {
    result += " et " + numberToFrenchWords(decimalPart) + " " + cents;
  }

  return result;
}
