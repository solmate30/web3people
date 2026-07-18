'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { signOut, useSession } from '@/lib/auth-client'

export function AuthNav() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <span className="h-8 w-28 animate-pulse border border-[var(--color-void-border)]" aria-hidden="true" />
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

  const label = session.user.name?.trim() || session.user.email || 'Reader'
  const imageUrl = session.user.image?.trim() || null
  const initials = getInitials(label)

  return (
    <div className="flex items-center gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0 rounded-full border border-[var(--color-void-border)] object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-void-border)] bg-[var(--color-surface)] font-mono text-[10px] font-bold uppercase text-[var(--color-neon)]"
          >
            {initials}
          </span>
        )}
        <span className="max-w-[140px] truncate font-mono text-xs uppercase tracking-widest text-[var(--color-text-primary)]">
          {label}
        </span>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            const result = await signOut()

            if (result.error) {
              toast.error(result.error.message || '로그아웃 중 문제가 발생했습니다.')
              return
            }

            toast.success('로그아웃되었습니다.')
            router.refresh()
          } catch {
            toast.error('로그아웃 중 문제가 발생했습니다.')
          }
        }}
        className="border border-[var(--color-void-border)] px-3 py-2 font-mono text-xs uppercase tracking-widest text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]"
      >
        Logout
      </button>
    </div>
  )
}

function getInitials(label: string): string {
  const parts = label
    .replace(/@.*/, '')
    .split(/[\s._-]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}
