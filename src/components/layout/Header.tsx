import Link from 'next/link'
import { AuthNav } from '@/components/auth/AuthNav'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-void-border)] bg-[rgba(10,10,10,0.85)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-8 lg:px-16">
        {/* 로고 */}
        <Link
          href="/"
          className="font-mono text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon)]"
        >
          web3<span className="text-[var(--color-neon)]">people</span>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-4 sm:gap-6 lg:gap-8">
          <Link
            href="/search"
            className="text-sm font-medium uppercase tracking-wider text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            Search
          </Link>
          <Link
            href="/interviews"
            className="text-sm font-medium uppercase tracking-wider text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            Interviews
          </Link>
          <Link
            href="/people"
            className="text-sm font-medium uppercase tracking-wider text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            People
          </Link>
          <a
            href="https://www.solmatecollective.online/"
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm font-medium uppercase tracking-wider text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] sm:inline"
          >
            Solmate
          </a>
          <AuthNav />
        </nav>
      </div>
    </header>
  )
}
