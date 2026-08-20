import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" };

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-6 py-3 text-xs font-semibold uppercase tracking-[.16em] shadow-sm transition duration-300 ease-out active:translate-y-0 disabled:pointer-events-none",
        variant === "primary" && "border-accent bg-accent text-white hover:-translate-y-0.5 hover:border-foreground hover:bg-foreground hover:shadow-lg",
        variant === "outline" && "border-accent/55 bg-white/50 text-foreground hover:-translate-y-0.5 hover:bg-accent hover:text-white hover:shadow-md",
        variant === "ghost" && "border-transparent bg-transparent shadow-none hover:border-line hover:bg-blush/60",
        className
      )}
      {...props}
    />
  );
}
