import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-shopify-border bg-white px-3 py-2 text-sm text-shopify-text placeholder:text-shopify-text-subdued focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shopify-focus focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card dark:border-border dark:text-card-foreground transition-colors",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
