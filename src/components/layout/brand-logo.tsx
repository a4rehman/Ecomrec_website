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
    <div className={cn("flex flex-col items-center", className)}>
      <Image
        src="/sawera-logo.png"
        alt="Sawera Collection"
        width={420}
        height={278}
        priority
        className={cn("h-auto w-40 object-contain md:w-52", imageClassName)}
      />
      {showTagline && (
        <p className="font-serif mt-2 text-center text-sm italic tracking-[.08em] text-muted">
          Made for Her, Inspired by Grace
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
