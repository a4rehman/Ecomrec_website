import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("focus-ring h-13 w-full rounded-full border border-line bg-white/55 px-5 text-sm outline-none transition placeholder:text-muted focus:border-accent", props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("focus-ring min-h-32 w-full rounded-3xl border border-line bg-white/55 px-5 py-4 text-sm outline-none transition placeholder:text-muted focus:border-accent", props.className)} />;
}
