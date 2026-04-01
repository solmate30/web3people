import Image from 'next/image'
import Link from 'next/link'
import type { Interview, Media, Person, Tag } from '@/payload-types'
import { cldUrl, transforms } from '@/lib/cloudinary'
import { formatDate } from '@/lib/getPayload'

type Props = {
  interview: Interview
}

export function InterviewCard({ interview }: Props) {
  const { title, slug, excerpt, coverImage, subject, tags, publishedAt } = interview

  const cover = coverImage as Media | null
  const person = subject as Person | null
  const tagList = (tags as Tag[] | null) ?? []

  return (
    <article className="group overflow-hidden rounded-xl border border-[rgba(0,255,157,0.15)] bg-[var(--color-surface)] transition-colors duration-300 hover:border-[rgba(0,255,157,0.45)]">
      <Link href={`/interviews/${slug}`} className="block">
        {/* 이미지 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-void)]">
          {cover?.url ? (
            <Image
              src={cldUrl(cover.url, transforms.card)}
              alt={cover.alt ?? title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--color-surface)]" />
          )}
        </div>

        {/* 콘텐츠 */}
        <div className="p-5">
          {/* 태그 */}
          {tagList.length > 0 && (
            <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-neon)]">
              {(tagList[0] as Tag).name}
            </span>
          )}

          {/* 제목 — UPPERCASE bold */}
          <h3 className="mt-2 line-clamp-2 text-base font-black uppercase leading-tight tracking-tight text-[var(--color-text-primary)] transition-colors duration-200 group-hover:text-[var(--color-neon)]">
            {title}
          </h3>

          {/* 요약 */}
          {excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {excerpt}
            </p>
          )}

          {/* 날짜 + READ INTERVIEW */}
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-void-border)] pt-3">
            {publishedAt ? (
              <time className="font-mono text-[11px] text-[var(--color-text-muted)]">
                {formatDate(publishedAt)}
              </time>
            ) : (
              <span />
            )}
            <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-neon)]">
              Read Interview →
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
