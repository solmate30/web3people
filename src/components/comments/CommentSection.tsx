'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useSession } from '@/lib/auth-client'

type CommentItem = {
  id: number
  authorName: string
  content: string
  createdAt: string
  updatedAt: string
  canManage: boolean
}

type CommentSectionProps = {
  interviewId: number
  callbackURL: string
}

const MAX_COMMENT_LENGTH = 2000

export function CommentSection({ interviewId, callbackURL }: CommentSectionProps) {
  const { data: session, isPending } = useSession()
  const [comments, setComments] = useState<CommentItem[]>([])
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadComments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/reader/comments?interviewId=${interviewId}`, {
        credentials: 'same-origin',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? '댓글을 불러오지 못했습니다.')
      }

      setComments(Array.isArray(data.comments) ? data.comments : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [interviewId])

  useEffect(() => {
    void loadComments()
  }, [loadComments])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/reader/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ interviewId, content }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? '댓글을 저장하지 못했습니다.')
      }

      setComments((current) => [data.comment, ...current])
      setContent('')
      toast.success('댓글이 등록되었습니다.')
    } catch (err) {
      const message = err instanceof Error ? err.message : '댓글을 저장하지 못했습니다.'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(commentId: number) {
    if (!editingContent.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/reader/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ content: editingContent }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? '댓글을 수정하지 못했습니다.')
      }

      setComments((current) =>
        current.map((comment) => (comment.id === commentId ? data.comment : comment)),
      )
      setEditingId(null)
      setEditingContent('')
      toast.success('댓글이 수정되었습니다.')
    } catch (err) {
      const message = err instanceof Error ? err.message : '댓글을 수정하지 못했습니다.'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(commentId: number) {
    const confirmed = window.confirm('댓글을 삭제할까요?')
    if (!confirmed) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/reader/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? '댓글을 삭제하지 못했습니다.')
      }

      setComments((current) => current.filter((comment) => comment.id !== commentId))
      toast.success('댓글이 삭제되었습니다.')
    } catch (err) {
      const message = err instanceof Error ? err.message : '댓글을 삭제하지 못했습니다.'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border border-[var(--color-void-border)] bg-[var(--color-surface)] p-6">
      <div className="flex flex-col gap-2 border-b border-[var(--color-void-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-neon)]">
            Comments
          </p>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
            Reader Notes
          </h2>
        </div>
        <p className="font-mono text-xs text-[var(--color-text-muted)]">
          {comments.length} visible
        </p>
      </div>

      <div className="py-6">
        {isPending ? (
          <div className="h-28 animate-pulse bg-[var(--color-void)]" aria-hidden="true" />
        ) : session ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="comment-content" className="sr-only">
                댓글 내용
              </label>
              <textarea
                id="comment-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={MAX_COMMENT_LENGTH}
                rows={4}
                className="w-full resize-y border border-[var(--color-void-border)] bg-[var(--color-void)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-neon)]"
                placeholder="Add your perspective..."
              />
              <p className="mt-2 text-right font-mono text-[11px] text-[var(--color-text-muted)]">
                {content.length}/{MAX_COMMENT_LENGTH}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--color-text-secondary)]">
                {session.user.name || session.user.email} 계정으로 작성합니다.
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="inline-flex justify-center border border-[var(--color-neon)] px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-neon)] transition-colors hover:bg-[var(--color-neon)] hover:text-[var(--color-void)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
              로그인 후 댓글에 참여하세요
            </h3>
            <p className="mt-3 max-w-2xl text-sm text-[var(--color-text-secondary)]">
              댓글은 독자 계정으로 자유롭게 작성하고 즉시 공개됩니다.
            </p>
            <Link
              href={`/login?callbackURL=${encodeURIComponent(callbackURL)}`}
              className="mt-5 inline-flex border border-[var(--color-neon)] px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-neon)] transition-colors hover:bg-[var(--color-neon)] hover:text-[var(--color-void)]"
            >
              Login to comment
            </Link>
          </div>
        )}
      </div>

      {error && (
        <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="space-y-4 border-t border-[var(--color-void-border)] pt-6">
        {isLoading ? (
          <div className="h-20 animate-pulse bg-[var(--color-void)]" aria-hidden="true" />
        ) : comments.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            아직 댓글이 없습니다. 첫 댓글을 남겨 주세요.
          </p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="border border-[var(--color-void-border)] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
                    {comment.authorName}
                  </p>
                  <time className="mt-1 block font-mono text-[11px] text-[var(--color-text-muted)]">
                    {formatCommentDate(comment.createdAt)}
                  </time>
                </div>
                {comment.canManage && (
                  <div className="flex gap-3 font-mono text-[11px] uppercase tracking-widest">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(comment.id)
                        setEditingContent(comment.content)
                      }}
                      className="text-[var(--color-neon)] hover:text-[var(--color-text-primary)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(comment.id)}
                      className="text-[var(--color-text-muted)] hover:text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                    maxLength={MAX_COMMENT_LENGTH}
                    rows={4}
                    className="w-full resize-y border border-[var(--color-void-border)] bg-[var(--color-void)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-neon)]"
                  />
                  <div className="flex justify-end gap-3 font-mono text-xs uppercase tracking-widest">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null)
                        setEditingContent('')
                      }}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting || !editingContent.trim()}
                      onClick={() => void handleUpdate(comment.id)}
                      className="text-[var(--color-neon)] hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {comment.content}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  )
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
