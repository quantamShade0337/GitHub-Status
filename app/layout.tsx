import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Link from "next/link";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "GitPersona — Your GitHub as a developer character sheet",
    template: "%s · GitPersona",
  },
  description:
    "Turn any public GitHub profile into a shareable developer character sheet: stats, languages, code footprint, scores, and a developer archetype.",
  openGraph: {
    title: "GitPersona",
    description: "Turn your GitHub into a developer character sheet.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-background transition group-hover:bg-accent-strong">
        <span className="mono text-[15px] font-bold leading-none">g</span>
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        Git<span className="text-muted">Persona</span>
      </span>
    </Link>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="flex items-center gap-1 text-sm text-muted">
          <Link
            href="/compare"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Compare
          </Link>
          <Link
            href="/about"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Methodology
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="mono text-xs">
          © {year} GitPersona · built on public GitHub data · not affiliated with GitHub
        </p>
        <div className="flex items-center gap-4">
          <Link href="/about" className="transition-colors hover:text-foreground">
            How stats are calculated
          </Link>
          <Link href="/compare" className="transition-colors hover:text-foreground">
            Compare
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
