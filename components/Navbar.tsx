// components/Navbar.tsx
//
// Shared across every route because it's rendered from app/layout.tsx.
// next/link is what makes this client-side navigation instead of a full
// page reload — Next.js pre-fetches the linked route in the background.

import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/instructors", label: "Instructors" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-ink-950 text-paper">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          Portal<span className="text-highlight-500">.</span>
        </Link>

        {/* Simple responsive nav: stacks are avoided by letting it wrap on small screens */}
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 font-body text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="ink-link pb-0.5">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
