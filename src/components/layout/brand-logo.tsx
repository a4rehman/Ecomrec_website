import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  showTagline?: boolean;
  href?: string;
};

export function BrandLogo({ className, imageClassName, showTagline = false, href = "/" }: BrandLogoProps) {
  const logo = (
    <div className={cn("flex flex-col items-start", className)}>
      <Image
        src="/sawera-logo.webp"
        alt="Sawera Collection"
        width={1200}
        height={1200}
        priority
        className={cn("h-auto w-44 object-contain md:w-48", imageClassName)}
      />
      {showTagline && (
        <p className="font-serif mt-2 text-left text-xs italic tracking-[.08em] text-muted">
          Made for Her. Inspired by Grace
        </p>
      )}
    </div>
  );

  if (!href) return logo;

  return (
    <Link href={href} aria-label="Sawera Collection home" className="inline-flex">
      {logo}
    </Link>
  );
}
