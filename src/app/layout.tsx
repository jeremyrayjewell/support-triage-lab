import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupportOps Triage Lab",
  description: "A local support-engineering portfolio app for triage, investigation, and support writing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
                  SupportOps
                </p>
                <Link href="/" className="text-xl font-semibold text-slate-950">
                  Triage Lab
                </Link>
              </div>
              <nav className="flex items-center gap-3 text-sm text-slate-600">
                <Link href="/" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950">
                  Dashboard
                </Link>
                <Link href="/tickets" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950">
                  Tickets
                </Link>
                <Link
                  href="/investigations"
                  className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  SQL Investigations
                </Link>
                <Link
                  href="/case-studies"
                  className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Case Studies
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
