import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[42px] w-full rounded-[10px] border-0 bg-[#e8e8ed] dark:bg-white/[0.08] dark:text-[#f5f5f7] px-4 py-2 text-[15px] text-foreground placeholder:text-[#86868b] dark:placeholder:text-[#98989d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:bg-white/[0.12] focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
