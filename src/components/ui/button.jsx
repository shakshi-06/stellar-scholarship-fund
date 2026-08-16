import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30 cursor-pointer rounded-md",
  {
    variants: {
      variant: {
        default:  "bg-[var(--text)] text-[var(--bg)] text-sm hover:opacity-80",
        outline:  "border border-[var(--border-2)] bg-transparent text-[var(--text)] text-sm hover:border-[var(--text-dim)] hover:bg-[var(--surface-2)]",
        ghost:    "text-[var(--text-muted)] text-sm hover:text-[var(--text)] hover:bg-[var(--surface-2)]",
        yellow:   "bg-[var(--yellow)] text-black text-sm font-semibold hover:opacity-85",
        danger:   "bg-red-600 text-white text-sm hover:bg-red-700",
        surface:  "bg-[var(--surface-2)] border border-[var(--border-2)] text-[var(--text)] text-sm hover:opacity-80",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-7 px-3 text-xs",
        lg:      "h-10 px-6",
        icon:    "h-8 w-8",
        xs:      "h-6 px-2 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, buttonVariants };
