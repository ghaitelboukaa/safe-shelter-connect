import { cn, statusVariant } from "../../lib/utils";

export function Badge({ status, className }) {
  return (
    <span className={cn(statusVariant(status), className)}>
      {status}
    </span>
  );
}
