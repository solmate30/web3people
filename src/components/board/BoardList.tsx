'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

type BoardPost = {
  id: number
  title: string
  content: string
  authorName: string
  createdAt: string
  relatedInterview: { title: string; slug: string } | null
  relatedPerson: { name: string; slug: string } | null
}

type BoardListProps = {
  relatedInterviewId?: number
  relatedPersonId?: number
}

export function BoardList({ relatedInterviewId, relatedPersonId }: BoardListProps) {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPosts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (relatedInterviewId) params.set('interviewId', String(relatedInterviewId))
    if (relatedPersonId) params.set('personId', String(relatedPersonId))

    try {
      const response = await fetch(`/api/reader/board/posts?${params.toString()}`, {
        credentials: 'same-origin',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? '게시글을 불러오지 못했습니다.')
      }

      setPosts(Array.isArray(data.posts) ? data.posts : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [relatedInterviewId, relatedPersonId])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  if (isLoading) {
    return <div className="h-40 animate-pulse bg-[var(--color-surface)]" aria-hidden="true" />
  }

  if (error) {
    return (
      <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {error}
      </p>
    )
  }

  if (posts.length === 0) {
    return (
      <p className="border border-[var(--color-void-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
        아직 게시글이 없습니다.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="border border-[var(--color-void-border)] bg-[var(--color-surface)] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href={`/board/${post.id}`}
                className="text-xl font-black uppercase tracking-tight text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon)]"
              >
                {post.title}
              </Link>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {post.content}
              </p>
            </div>
            <time className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-muted)]">
              {formatDate(post.createdAt)}
            </time>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-muted)]">
            <span>{post.authorName}</span>
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
        </article>
      ))}
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
