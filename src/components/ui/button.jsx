import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30 cursor-pointer rounded-md",
  {
    variants: {
      variant: {
        default:  "bg-white text-black text-sm hover:bg-neutral-200",
        outline:  "border border-[#2a2a2a] bg-transparent text-[#f5f5f5] text-sm hover:border-[#444] hover:bg-[#1a1a1a]",
        ghost:    "text-[#888] text-sm hover:text-white hover:bg-[#1a1a1a]",
        yellow:   "bg-[#f2d94e] text-black text-sm font-semibold hover:bg-[#e8cf3a]",
        danger:   "bg-[#ef4444] text-white text-sm hover:bg-[#dc2626]",
        surface:  "bg-[#1a1a1a] border border-[#2a2a2a] text-[#f5f5f5] text-sm hover:bg-[#222] hover:border-[#333]",
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
