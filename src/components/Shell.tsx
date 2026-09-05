import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";

export function Shell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="no-print border-b border-rule">
        <div className={`mx-auto flex items-center justify-between gap-3 px-4 py-3 ${wide ? "max-w-5xl" : "max-w-[46rem]"}`}>
          <Link href="/" className="text-sm font-semibold tracking-[0.14em] uppercase text-muted">
            Borrower <span className="text-accent">Copilot</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm text-muted">
            <LanguageToggle />
            <Link href="/" className="hover:text-ink">
              Dashboard
            </Link>
            <Link href="/assess?new=1" className="hover:text-ink">
              Start
            </Link>
            <Link href="/studio" className="hidden sm:inline hover:text-ink">
              Lab
            </Link>
            <Link href="/compare" className="hidden md:inline hover:text-ink">
              Compare
            </Link>
            <Link href="/rules" className="hover:text-ink">
              Rules
            </Link>
          </nav>
        </div>
      </header>
      <main className={`mx-auto px-4 py-8 pb-20 ${wide ? "max-w-5xl" : "max-w-[46rem]"}`}>
        {children}
      </main>
    </div>
  );
}
