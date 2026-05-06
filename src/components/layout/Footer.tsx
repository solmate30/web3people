import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-void-border)] mt-24">
      <div className="mx-auto max-w-[1440px] px-8 py-12 lg:px-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/"
              className="font-mono text-base font-bold uppercase tracking-widest text-[var(--color-text-primary)]"
            >
              web3<span className="text-[var(--color-neon)]">people</span>
            </Link>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              web3를 만드는 사람들의 이야기
            </p>
          </div>

          <nav className="flex flex-wrap gap-6 text-sm text-[var(--color-text-secondary)]">
            <Link href="/interviews" className="hover:text-[var(--color-text-primary)] transition-colors">
              Interviews
            </Link>
            <Link href="/people" className="hover:text-[var(--color-text-primary)] transition-colors">
              People
            </Link>
            <a
              href="https://www.solmatecollective.online/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              Solmate
            </a>
          </nav>
        </div>

        <div className="mt-8 border-t border-[var(--color-void-border)] pt-8 text-xs text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} web3people. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
