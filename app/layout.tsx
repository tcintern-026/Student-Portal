// app/layout.tsx
//
// The ROOT LAYOUT. In the App Router, any file named `layout.tsx` wraps
// every page below it in the folder tree and *persists* across navigation —
// Navbar/Footer here don't remount when you click between pages, only the
// `children` (the active page) swaps out. This is the file-based-routing
// equivalent of a classic <Layout> wrapper, but built into the framework.

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

// Exporting `metadata` from layout.tsx sets the default <title>/<meta> tags
// for every page under it; individual pages can override with their own.
export const metadata: Metadata = {
  title: "Student Course Portal",
  description: "Browse courses and instructors — built with Next.js App Router.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-paper font-body">
        <Navbar />
        {/* `children` here is whatever page.tsx matched the current URL */}
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
