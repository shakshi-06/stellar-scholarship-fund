import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium font-mono",
  {
    variants: {
      variant: {
        default:   "bg-[var(--text)]/10 text-[var(--text)] border border-[var(--border-2)]",
        secondary: "bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]",
        yellow:    "bg-[var(--yellow-bg)] text-[var(--yellow)] border border-[var(--yellow-border)]",
        green:     "bg-green-500/10 text-green-500 border border-green-500/20",
        red:       "bg-red-500/10 text-red-500 border border-red-500/20",
        amber:     "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
      },
    },
    defaultVariants: { variant: "secondary" },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
export { Badge, badgeVariants };
