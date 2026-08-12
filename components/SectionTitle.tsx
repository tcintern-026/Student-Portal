// components/SectionTitle.tsx
//
// The "heading + optional description + optional 'view all' link" row that
// was hand-rolled once on the homepage and needed again for related
// courses. One component, so both stay visually consistent.

import Link from "next/link";

export default function SectionTitle({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-950">{title}</h2>
        {description && (
          <p className="mt-2 max-w-xl font-body text-sm text-ink-900/70">{description}</p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="ink-link shrink-0 pb-0.5 font-body text-sm">
          {actionLabel} &rarr;
        </Link>
      )}
    </div>
  );
}
