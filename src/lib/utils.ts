import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue\[]) {
return twMerge(clsx(inputs));
}

// ✅ Indian currency formatter (handles negatives)
export function formatIndianCurrency(amount: number): string {
const isNegative = amount < 0;
const absValue = Math.abs(amount);

const formatted = new Intl.NumberFormat("en-IN", {
style: "currency",
currency: "INR",
minimumFractionDigits: 0,
maximumFractionDigits: 0,
}).format(absValue);

return isNegative ? `-${formatted}` : formatted;
}

// ✅ Compact Indian number formatter for charts (handles negatives)
export function formatCompactNumber(value: number): string {
const isNegative = value < 0;
const absValue = Math.abs(value);

let formatted = "";
if (absValue >= 10000000) {
formatted = `₹${(absValue / 10000000).toFixed(1)}Cr`;
} else if (absValue >= 100000) {
formatted = `₹${(absValue / 100000).toFixed(1)}L`;
} else if (absValue >= 1000) {
formatted = `₹${(absValue / 1000).toFixed(1)}K`;
} else {
formatted = `₹${absValue}`;
}

return isNegative ? `-${formatted}` : formatted;
}
