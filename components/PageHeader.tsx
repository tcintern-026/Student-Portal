// components/PageHeader.tsx

export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-16">
      {eyebrow && (
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-highlight-500">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 font-display text-3xl font-bold text-ink-950 sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-2xl font-body text-ink-900/70">{description}</p>
      )}
    </div>
  );
}
