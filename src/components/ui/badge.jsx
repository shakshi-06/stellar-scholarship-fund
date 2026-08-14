import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium font-mono",
  {
    variants: {
      variant: {
        default:   "bg-white/10 text-white border border-white/10",
        secondary: "bg-[#1a1a1a] text-[#888] border border-[#2a2a2a]",
        yellow:    "bg-[#f2d94e]/15 text-[#f2d94e] border border-[#f2d94e]/30",
        green:     "bg-green-500/10 text-green-400 border border-green-500/20",
        red:       "bg-red-500/10 text-red-400 border border-red-500/20",
        amber:     "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
      },
    },
    defaultVariants: { variant: "secondary" },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
export { Badge, badgeVariants };
