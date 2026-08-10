import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-stone-900 text-stone-50",
        secondary: "border-transparent bg-stone-100 text-stone-900",
        destructive: "border-transparent bg-red-500 text-white",
        outline: "text-stone-900",
        peach: "border-transparent bg-[#FDDEC9] text-[#c45c2a]",
        yellow: "border-transparent bg-[#FBF0A8] text-[#7a6000]",
        green: "border-transparent bg-green-100 text-green-800",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
