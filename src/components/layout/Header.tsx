'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { AuthNav } from '@/components/auth/AuthNav'

const navLinks = [
  { href: '/search', label: 'Search' },
  { href: '/interviews', label: 'Interviews' },
  { href: '/people', label: 'People' },
  { href: '/board', label: 'Board' },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-void-border)] bg-[rgba(10,10,10,0.85)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-8 lg:px-16">
        {/* 로고 */}
        <Link
          href="/"
          onClick={closeMenu}
          className="font-mono text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon)]"
        >
          web3<span className="text-[var(--color-neon)]">people</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex lg:gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={desktopNavLinkClass}>
              {link.label}
            </Link>
          ))}
          <a
            href="https://www.solmatecollective.online/"
            target="_blank"
            rel="noreferrer"
            className={desktopNavLinkClass}
          >
            Solmate
          </a>
          <AuthNav />
        </nav>

        <button
          type="button"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="inline-flex size-10 items-center justify-center border border-[var(--color-void-border)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)] md:hidden"
        >
          {isMenuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={isMenuOpen ? 'border-t border-[var(--color-void-border)] md:hidden' : 'hidden'}
      >
        <nav className="mx-auto flex max-w-[1440px] flex-col px-8 py-5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={closeMenu} className={mobileNavLinkClass}>
              {link.label}
            </Link>
          ))}
          <a
            href="https://www.solmatecollective.online/"
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
            className={mobileNavLinkClass}
          >
            Solmate
          </a>
          <div className="mt-5 border-t border-[var(--color-void-border)] pt-5">
            <AuthNav />
          </div>
        </nav>
      </div>
    </header>
  )
}

const desktopNavLinkClass = 'text-sm font-medium uppercase tracking-wider text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]'
const mobileNavLinkClass = 'border-b border-[var(--color-void-border)] py-4 font-mono text-sm font-bold uppercase tracking-widest text-[var(--color-text-secondary)] transition-colors last:border-b-0 hover:text-[var(--color-neon)]'
