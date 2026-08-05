import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  name: string;
  href: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-[.14em] text-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href + item.name} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} aria-hidden="true" />}
              {isLast ? (
                <span aria-current="page" className="max-w-[220px] truncate text-foreground">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="transition hover:text-accent">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
