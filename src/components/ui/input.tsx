import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("focus-ring h-13 w-full border border-line bg-transparent px-4 text-sm outline-none placeholder:text-muted", props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("focus-ring min-h-32 w-full border border-line bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted", props.className)} />;
}
