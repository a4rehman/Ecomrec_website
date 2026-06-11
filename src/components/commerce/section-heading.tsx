export function SectionHeading({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && <p className="tracked-luxury mb-3 text-xs text-accent">{eyebrow}</p>}
        <h2 className="font-serif text-4xl md:text-6xl">{title}</h2>
      </div>
      {text && <p className="max-w-md leading-7 text-muted">{text}</p>}
    </div>
  );
}
