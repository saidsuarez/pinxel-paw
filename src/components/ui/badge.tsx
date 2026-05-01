import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "info" | "success" | "warning" | "neutral" | "error";

const variants: Record<BadgeVariant, string> = {
  info: "bg-primary/15 text-primary",
  success: "bg-accent/20 text-[#1b6664]",
  warning: "bg-secondary/20 text-[#7b4a05]",
  neutral: "bg-muted text-muted-foreground",
  error: "bg-destructive/15 text-destructive"
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 w-fit items-center justify-start gap-1.5 rounded-full px-[11px] py-0 text-xs font-extrabold leading-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
