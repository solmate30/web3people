'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { useSession } from '@/lib/auth-client'

type BoardPostFormProps = {
  relatedInterviewId?: number
  relatedPersonId?: number
  callbackURL: string
}

const MAX_TITLE_LENGTH = 160
const MAX_CONTENT_LENGTH = 8000

export function BoardPostForm({
  relatedInterviewId,
  relatedPersonId,
  callbackURL,
}: BoardPostFormProps) {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/reader/board/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          title,
          content,
          relatedInterviewId,
          relatedPersonId,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? '게시글을 저장하지 못했습니다.')
      }

      toast.success('게시글이 등록되었습니다.')
      router.push(`/board/${data.post.id}`)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : '게시글을 저장하지 못했습니다.'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isPending) {
    return <div className="h-64 animate-pulse bg-[var(--color-surface)]" aria-hidden="true" />
  }

  if (!session) {
    return (
      <div className="border border-[var(--color-void-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
          Login required
        </h2>
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          게시글은 독자 계정으로 로그인한 뒤 작성할 수 있습니다.
        </p>
        <Link
          href={`/login?callbackURL=${encodeURIComponent(callbackURL)}`}
          className="mt-5 inline-flex border border-[var(--color-neon)] px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-neon)] transition-colors hover:bg-[var(--color-neon)] hover:text-[var(--color-void)]"
        >
          Login to post
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border border-[var(--color-void-border)] bg-[var(--color-surface)] p-6">
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
          Title
        </span>
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={MAX_TITLE_LENGTH}
          className="mt-2 w-full border border-[var(--color-void-border)] bg-[var(--color-void)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-neon)]"
          placeholder="What should the community discuss?"
        />
      </label>
      <label className="block">
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
          Content
        </span>
        <textarea
          required
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={MAX_CONTENT_LENGTH}
          rows={10}
          className="mt-2 w-full resize-y border border-[var(--color-void-border)] bg-[var(--color-void)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-neon)]"
          placeholder="Share a question, insight, or follow-up."
        />
        <p className="mt-2 text-right font-mono text-[11px] text-[var(--color-text-muted)]">
          {content.length}/{MAX_CONTENT_LENGTH}
        </p>
      </label>
      {error && (
        <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {session.user.name || session.user.email} 계정으로 작성합니다.
        </p>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="inline-flex justify-center border border-[var(--color-neon)] px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-neon)] transition-colors hover:bg-[var(--color-neon)] hover:text-[var(--color-void)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Publish post'}
        </button>
      </div>
    </form>
  )
}
