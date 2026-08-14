import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-9 w-full rounded-md border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm text-white placeholder:text-[#444] focus-visible:outline-none focus-visible:border-[#444] disabled:cursor-not-allowed disabled:opacity-40 transition-colors font-mono",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
export { Input };
