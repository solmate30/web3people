'use client'

import Link from 'next/link'
import { useSession } from '@/lib/auth-client'

export function CommentLoginCTA({ callbackURL }: { callbackURL: string }) {
  const { data: session, isPending } = useSession()

  return (
    <div className="border border-[var(--color-void-border)] bg-[var(--color-surface)] p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-neon)]">
        Comments
      </p>
      {isPending ? (
        <div className="mt-4 h-20 animate-pulse bg-[var(--color-void)]" aria-hidden="true" />
      ) : session ? (
        <>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
            댓글 작성 준비 중
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            {session.user.name || session.user.email} 계정으로 로그인되어 있습니다. 댓글 작성 기능은 다음 단계에서 연결됩니다.
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
            로그인 후 댓글에 참여하세요
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[var(--color-text-secondary)]">
            댓글은 독자 계정으로 자유롭게 작성하고 즉시 공개하는 방향으로 준비 중입니다.
          </p>
          <Link
            href={`/login?callbackURL=${encodeURIComponent(callbackURL)}`}
            className="mt-5 inline-flex border border-[var(--color-neon)] px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-neon)] transition-colors hover:bg-[var(--color-neon)] hover:text-[var(--color-void)]"
          >
            Login to comment
          </Link>
        </>
      )}
    </div>
  )
}
