'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useSession } from '@/lib/auth-client'

type BoardPost = {
  id: number
  title: string
  content: string
  authorName: string
  createdAt: string
  updatedAt: string
  canManage: boolean
  relatedInterview: { title: string; slug: string } | null
  relatedPerson: { name: string; slug: string } | null
}

export function BoardPostDetail({ postId }: { postId: number }) {
  const { data: session } = useSession()
  const [post, setPost] = useState<BoardPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadPost = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/reader/board/posts/${postId}`, {
        credentials: 'same-origin',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? '게시글을 불러오지 못했습니다.')
      }

      setPost(data.post)
      setTitle(data.post.title)
      setContent(data.post.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    void loadPost()
  }, [loadPost, session?.user.email])

  async function updatePost() {
    setError(null)

    try {
      const response = await fetch(`/api/reader/board/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ title, content }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? '게시글을 수정하지 못했습니다.')
      }

      setPost(data.post)
      setIsEditing(false)
      toast.success('게시글이 수정되었습니다.')
    } catch (err) {
      const message = err instanceof Error ? err.message : '게시글을 수정하지 못했습니다.'
      setError(message)
      toast.error(message)
    }
  }

  async function deletePost() {
    const confirmed = window.confirm('게시글을 삭제할까요?')
    if (!confirmed) return

    setError(null)

    try {
      const response = await fetch(`/api/reader/board/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? '게시글을 삭제하지 못했습니다.')
      }

      toast.success('게시글이 삭제되었습니다.')
      window.location.href = '/board'
    } catch (err) {
      const message = err instanceof Error ? err.message : '게시글을 삭제하지 못했습니다.'
      setError(message)
      toast.error(message)
    }
  }

  if (isLoading) {
    return <div className="h-80 animate-pulse bg-[var(--color-surface)]" aria-hidden="true" />
  }

  if (error && !post) {
    return (
      <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {error}
      </p>
    )
  }

  if (!post) return null

  return (
    <article className="border border-[var(--color-void-border)] bg-[var(--color-surface)] p-6">
      {isEditing ? (
        <div className="space-y-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full border border-[var(--color-void-border)] bg-[var(--color-void)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-neon)]"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={12}
            className="w-full resize-y border border-[var(--color-void-border)] bg-[var(--color-void)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-primary)] outline-none focus:border-[var(--color-neon)]"
          />
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-[var(--color-text-primary)] md:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-muted)]">
            <span>{post.authorName}</span>
            <time>{formatDate(post.createdAt)}</time>
            {post.relatedInterview && (
              <Link href={`/interviews/${post.relatedInterview.slug}`} className="text-[var(--color-neon)]">
                Interview
              </Link>
            )}
            {post.relatedPerson && (
              <Link href={`/people/${post.relatedPerson.slug}`} className="text-[var(--color-neon)]">
                Person
              </Link>
            )}
          </div>
          <p className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-[var(--color-text-secondary)]">
            {post.content}
          </p>
        </>
      )}

      {error && (
        <p className="mt-5 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {post.canManage && (
        <div className="mt-8 flex justify-end gap-3 font-mono text-xs uppercase tracking-widest">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void updatePost()}
                className="text-[var(--color-neon)] hover:text-[var(--color-text-primary)]"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-[var(--color-neon)] hover:text-[var(--color-text-primary)]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void deletePost()}
                className="text-[var(--color-text-muted)] hover:text-red-200"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </article>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
