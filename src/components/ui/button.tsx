import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-[15px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-dark shadow-none",
        destructive: "bg-alert text-white hover:bg-alert-dark shadow-none",
        outline: "border border-border bg-card text-foreground hover:bg-muted hover:text-foreground dark:border-white/[0.08] dark:hover:bg-white/[0.06]",
        secondary: "bg-[#e8e8ed] text-foreground hover:bg-[#dcdce0] dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.12]",
        ghost: "text-foreground hover:bg-muted dark:text-[#98989d] dark:hover:text-white dark:hover:bg-white/[0.06]",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-white hover:bg-success-dark shadow-none",
      },
      size: {
        default: "h-[42px] px-5 py-2",
        sm: "h-[36px] rounded-[8px] px-3.5 text-[14px]",
        lg: "h-[48px] rounded-[12px] px-7 text-[16px]",
        icon: "h-[42px] w-[42px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
