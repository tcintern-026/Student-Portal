// components/Footer.tsx

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink-950 text-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body text-sm text-paper/70">
          &copy; {new Date().getFullYear()} Student Course Portal — built with Next.js App Router.
        </p>
        <ul className="flex gap-6 font-body text-sm">
          <li>
            <Link href="/courses" className="ink-link pb-0.5">
              Courses
            </Link>
          </li>
          <li>
            <Link href="/instructors" className="ink-link pb-0.5">
              Instructors
            </Link>
          </li>
          <li>
            <Link href="/contact" className="ink-link pb-0.5">
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
