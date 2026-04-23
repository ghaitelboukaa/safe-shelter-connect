import { cn } from "../../lib/utils";

// ── Skeleton Line ────────────────────────────────────────────────────────────
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("skeleton rounded-lg", className)}
      {...props}
    />
  );
}

// ── Skeleton Card (KPI-style) ────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// ── Skeleton Table Row ────────────────────────────────────────────────────────
export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = "md", className }) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-slate-200 border-t-primary-800",
        sizes[size],
        className
      )}
    />
  );
}
