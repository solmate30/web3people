'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from '@/lib/auth-client'

export function AuthNav() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <span className="h-8 w-16 animate-pulse border border-[var(--color-void-border)]" aria-hidden="true" />
    )
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="border border-[var(--color-void-border)] px-3 py-2 font-mono text-xs uppercase tracking-widest text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]"
      >
        Login
      </Link>
    )
  }

  const label = session.user.name || session.user.email

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-[140px] truncate font-mono text-xs text-[var(--color-text-muted)] sm:inline">
        {label}
      </span>
      <button
        type="button"
        onClick={async () => {
          await signOut()
          router.refresh()
        }}
        className="border border-[var(--color-void-border)] px-3 py-2 font-mono text-xs uppercase tracking-widest text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]"
      >
        Logout
      </button>
    </div>
  )
}
