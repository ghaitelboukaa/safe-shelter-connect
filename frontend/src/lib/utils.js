import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely using clsx + tailwind-merge.
 * Eliminates class conflicts (e.g., "p-4 p-6" → "p-6").
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format a percentage to a color class */
export function pctColor(pct) {
  if (pct > 80) return "bg-red-500";
  if (pct > 50) return "bg-amber-400";
  return "bg-emerald-500";
}

/** Status badge variant */
export function statusVariant(status) {
  const map = {
    Pending: "badge-pending",
    Confirmed: "badge-confirmed",
    Rejected: "badge-rejected",
    Cancelled: "badge-cancelled",
  };
  return map[status] || "badge";
}
