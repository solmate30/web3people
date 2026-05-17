import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'
import { getPayload, formatDate } from '@/lib/getPayload'
import { cldUrl, transforms } from '@/lib/cloudinary'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { InterviewCard } from '@/components/InterviewCard'
import { LexicalContent } from '@/components/LexicalContent'
import { CommentSection } from '@/components/comments/CommentSection'
import {
  findPublishedInterviewBySlug,
  findPublishedInterviewSlugs,
  findRelatedPublishedInterviews,
} from '@/lib/publicContent'
import type { Interview, Media, Person, Tag } from '@/payload-types'

export const revalidate = 60

const getPublishedInterview = cache(async (slug: string) => {
  const payload = await getPayload()
  const { docs } = await findPublishedInterviewBySlug(payload, slug, {
    depth: 2,
  })

  return docs[0] ?? null
})

export async function generateStaticParams() {
  const payload = await getPayload()
  const { docs } = await findPublishedInterviewSlugs(payload)
  return docs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const interview = await getPublishedInterview(slug)
  if (!interview) return {}

  const cover = interview.coverImage as Media | null

  return {
    title: interview.title,
    description: interview.excerpt,
    openGraph: {
      title: interview.title,
      description: interview.excerpt,
      images: cover?.url ? [{ url: cldUrl(cover.url, transforms.hero) }] : [],
    },
  }
}

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayload()

  const interview = await getPublishedInterview(slug)
  if (!interview) notFound()

  const cover = interview.coverImage as Media | null
  const person = interview.subject as Person | null
  const personPhoto = person?.photo as Media | null
  const tags = (interview.tags as Tag[] | null) ?? []
  const tagIds = tags.map((tag) => tag.id)
  const readMinutes = estimateInterviewReadMinutes(interview)

  // 추천 인터뷰
  const { docs: related } = await findRelatedPublishedInterviews(payload, slug, {
    limit: 3,
    depth: 2,
    tagIds,
  })

  return (
    <>
      <Header />
      <main className="pt-16">
        {/* ── 커버 히어로 (풀 스크린) ── */}
        <div className="relative h-[55vh] min-h-[360px] overflow-hidden">
          {cover?.url ? (
            <Image
              src={cldUrl(cover.url, transforms.hero)}
              alt={cover.alt ?? interview.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--color-surface)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(10,10,10,0.4)] to-[#0A0A0A]" />
        </div>

        {/* ── 2컬럼 본문 레이아웃 ── */}
        <div className="mx-auto max-w-[1200px] px-8 pb-24 lg:px-16">
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-16">

            {/* ── 왼쪽: 메인 콘텐츠 ── */}
            <div>
              {/* 태그 */}
              {tags.length > 0 && (
                <Link
                  href={`/tags/${tags[0].slug}`}
                  className="mt-8 block font-mono text-xs uppercase tracking-widest text-[var(--color-neon)] transition-colors hover:text-[var(--color-text-primary)]"
                >
                  {tags[0].name}
                </Link>
              )}

              {/* 제목 */}
              <h1 className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight text-[var(--color-text-primary)] md:text-4xl lg:text-5xl">
                {interview.title}
              </h1>

              {/* 발행일 + 읽기 시간 */}
              <div className="mt-4 flex items-center gap-4 font-mono text-xs text-[var(--color-text-muted)]">
                {interview.publishedAt && (
                  <time>{formatDate(interview.publishedAt)}</time>
                )}
                <span>·</span>
                <span>{readMinutes} MIN READ</span>
              </div>

              {/* 요약 */}
              <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-secondary)]">
                {interview.excerpt}
              </p>

              {/* 구분선 */}
              <div className="my-10 border-t border-[var(--color-void-border)]" />

              {/* Q&A 콘텐츠 블록 */}
              <div className="space-y-14">
                {interview.content?.map((block, i) => {
                  if (block.blockType === 'qa') {
                    return (
                      <div key={block.id ?? i}>
                        {/* 질문 */}
                        <div className="flex gap-4">
                          <span className="shrink-0 font-mono text-2xl font-black leading-none text-[var(--color-neon)]">
                            Q.
                          </span>
                          <p className="text-lg font-bold leading-snug text-[var(--color-text-primary)]">
                            {block.question}
                          </p>
                        </div>

                        {/* 답변 — 인물명: 레이블 */}
                        <div className="mt-5 pl-10">
                          {person && (
                            <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-neon)]">
                              {person.name}:
                            </span>
                          )}
                          <LexicalContent
                            content={block.answer as Parameters<typeof LexicalContent>[0]['content']}
                            className="text-base leading-relaxed text-[#AAAAAA]"
                          />
                        </div>
                      </div>
                    )
                  }

                  if (block.blockType === 'text') {
                    return (
                      <LexicalContent
                        key={block.id ?? i}
                        content={block.content as Parameters<typeof LexicalContent>[0]['content']}
                        className="text-base leading-relaxed text-[#AAAAAA]"
                      />
                    )
                  }

                  if (block.blockType === 'image') {
                    const blockImg = typeof block.image === 'object' ? block.image as Media : null
                    return blockImg?.url ? (
                      <figure key={block.id ?? i}>
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={cldUrl(blockImg.url, transforms.articleImage)}
                            alt={blockImg.alt ?? ''}
                            fill
                            sizes="(max-width: 768px) 100vw, 800px"
                            className="object-cover"
                          />
                        </div>
                        {block.caption && (
                          <figcaption className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    ) : null
                  }

                  return null
                })}
              </div>
            </div>

            {/* ── 오른쪽: 사이드바 ── */}
            <aside className="mt-10 lg:mt-0">
              <div className="lg:sticky lg:top-24 space-y-8">
                {/* 인물 카드 */}
                {person && (
                  <div className="border border-[var(--color-void-border)] p-6">
                    {personPhoto?.url && (
                      <Link href={`/people/${person.slug}`}>
                        <div className="relative mb-4 aspect-square w-full overflow-hidden">
                          <Image
                            src={cldUrl(personPhoto.url, transforms.profile)}
                            alt={person.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                    )}
                    <Link
                      href={`/people/${person.slug}`}
                      className="block text-base font-bold uppercase tracking-tight text-[var(--color-text-primary)] hover:text-[var(--color-neon)] transition-colors"
                    >
                      {person.name}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {person.title}
                      {person.organization && (
                        <span className="block text-[var(--color-neon)]">{person.organization}</span>
                      )}
                    </p>

                    {/* 소셜 링크 */}
                    {person.socials && (
                      <div className="mt-4 flex gap-3">
                        {person.socials.twitter && (
                          <SocialLink href={person.socials.twitter} label="X" />
                        )}
                        {person.socials.linkedin && (
                          <SocialLink href={person.socials.linkedin} label="in" />
                        )}
                        {person.socials.website && (
                          <SocialLink href={person.socials.website} label="↗" />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 태그 목록 */}
                {tags.length > 0 && (
                  <div>
                    <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-muted)]">
                      Topics
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Link
                          key={(tag as Tag).id}
                          href={`/tags/${(tag as Tag).slug}`}
                          className="border border-[var(--color-void-border)] px-3 py-1 font-mono text-xs text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]"
                        >
                          {(tag as Tag).name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        <section className="border-t border-[var(--color-void-border)]">
          <div className="mx-auto max-w-[1200px] px-8 py-14 lg:px-16">
            <CommentSection interviewId={interview.id} callbackURL={`/interviews/${interview.slug}`} />
          </div>
        </section>

        {/* ── 관련 인터뷰 ── */}
        {related.length > 0 && (
          <section className="border-t border-[var(--color-void-border)] bg-[var(--color-surface)]">
            <div className="mx-auto max-w-[1440px] px-8 py-16 lg:px-16">
              <h2 className="mb-10 font-mono text-xs uppercase tracking-widest text-[var(--color-text-secondary)]">
                More Interviews
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <InterviewCard key={item.id} interview={item as Interview} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}

function estimateInterviewReadMinutes(interview: Interview): number {
  const text = [
    interview.title,
    interview.excerpt,
    ...(interview.content?.flatMap((block) => {
      if (block.blockType === 'qa') return [block.question, extractText(block.answer)]
      if (block.blockType === 'text') return [extractText(block.content)]
      if (block.blockType === 'image') return [block.caption ?? '']
      return []
    }) ?? []),
  ].join(' ')

  const words = text.trim().split(/\s+/).filter(Boolean).length
  const nonWhitespaceChars = text.replace(/\s/g, '').length
  const estimatedByWords = Math.ceil(words / 220)
  const estimatedByChars = Math.ceil(nonWhitespaceChars / 700)

  return Math.max(1, Math.max(estimatedByWords, estimatedByChars))
}

function extractText(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (!value) return ''
  if (Array.isArray(value)) return value.map(extractText).join(' ')
  if (typeof value !== 'object') return ''

  return Object.values(value as Record<string, unknown>).map(extractText).join(' ')
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-8 w-8 items-center justify-center border border-[var(--color-void-border)] font-mono text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]"
    >
      {label}
    </a>
  )
}
