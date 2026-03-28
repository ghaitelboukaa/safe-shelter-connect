import { cn, pctColor } from "../../lib/utils";

/**
 * Animated progress bar.
 * @param {number} value  – 0–100
 * @param {string} className
 */
export function ProgressBar({ value = 0, className }) {
  const fill = pctColor(value);

  return (
    <div className={cn("progress-bar", className)}>
      <div
        className={cn("progress-fill", fill)}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}
