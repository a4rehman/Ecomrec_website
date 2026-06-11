import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" };

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 border px-5 py-3 text-sm font-semibold uppercase tracking-[.18em] transition",
        variant === "primary" && "border-foreground bg-foreground text-background hover:bg-accent hover:text-white hover:border-accent",
        variant === "outline" && "border-foreground bg-transparent hover:bg-foreground hover:text-background",
        variant === "ghost" && "border-transparent bg-transparent hover:border-line",
        className
      )}
      {...props}
    />
  );
}
