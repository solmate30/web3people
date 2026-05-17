import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from '@/lib/getPayload'
import { cldUrl, transforms } from '@/lib/cloudinary'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { InterviewCard } from '@/components/InterviewCard'
import { LexicalContent } from '@/components/LexicalContent'
import {
  findPublishedInterviewsByPersonId,
  findPublishedPersonBySlug,
  findPublishedPersonSlugs,
} from '@/lib/publicContent'
import type { Interview, Media, Tag } from '@/payload-types'

export const revalidate = 60

export async function generateStaticParams() {
  const payload = await getPayload()
  const { docs } = await findPublishedPersonSlugs(payload)
  return docs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload()
  const { docs } = await findPublishedPersonBySlug(payload, slug, {
    depth: 1,
  })
  const person = docs[0]
  if (!person) return {}

  const photo = person.photo as Media | null

  return {
    title: `${person.name} — ${person.title}`,
    openGraph: {
      images: photo?.url ? [{ url: cldUrl(photo.url, transforms.profile) }] : [],
    },
  }
}

export default async function PersonProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayload()

  const { docs } = await findPublishedPersonBySlug(payload, slug, {
    depth: 1,
  })

  const person = docs[0]
  if (!person) notFound()

  const photo = person.photo as Media | null
  const tags = (person.tags as Tag[] | null) ?? []

  // 이 인물의 인터뷰 목록
  const { docs: interviews } = await findPublishedInterviewsByPersonId(payload, person.id, {
    depth: 2,
  })

  return (
    <>
      <Header />
      <main className="pt-16">
        {/* ── 프로필 헤더 ── */}
        <section className="border-b border-[var(--color-void-border)]">
          <div className="mx-auto max-w-[1440px] px-8 py-20 lg:px-16">
            <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-16">
              {/* 프로필 사진 */}
              {photo?.url && (
                <div className="relative size-40 shrink-0 overflow-hidden md:size-56">
                  <Image
                    src={cldUrl(photo.url, transforms.profile)}
                    alt={person.name}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              )}

              {/* 정보 */}
              <div className="flex-1">
                {/* 국가 */}
                {person.country && (
                  <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
                    {person.country}
                  </span>
                )}

                {/* 이름 */}
                <h1 className="mt-1 text-4xl font-bold text-[var(--color-text-primary)] md:text-5xl">
                  {person.name}
                </h1>
                {person.name_en && person.name_en !== person.name && (
                  <p className="mt-1 font-mono text-sm text-[var(--color-text-muted)]">
                    {person.name_en}
                  </p>
                )}

                {/* 직함 + 소속 */}
                <p className="mt-3 text-lg text-[var(--color-text-secondary)]">
                  {person.title}
                  {person.organization && (
                    <>
                      <span className="mx-2 text-[var(--color-text-muted)]">@</span>
                      <span className="text-[var(--color-neon)]">{person.organization}</span>
                    </>
                  )}
                </p>

                {/* 태그 */}
                {tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={(tag as Tag).id}
                        className="border border-[var(--color-void-border)] px-3 py-1 font-mono text-xs text-[var(--color-text-muted)]"
                      >
                        {(tag as Tag).name}
                      </span>
                    ))}
                  </div>
                )}

                {/* 소셜 링크 */}
                {person.socials && (
                  <div className="mt-5 flex gap-4">
                    {person.socials.twitter && (
                      <SocialLink href={person.socials.twitter} label="Twitter/X" />
                    )}
                    {person.socials.linkedin && (
                      <SocialLink href={person.socials.linkedin} label="LinkedIn" />
                    )}
                    {person.socials.website && (
                      <SocialLink href={person.socials.website} label="Website" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 소개 */}
            <div className="mt-12 max-w-3xl">
              <LexicalContent
                content={person.bio as Parameters<typeof LexicalContent>[0]['content']}
                className="text-base leading-relaxed text-[var(--color-text-secondary)]"
              />
            </div>
          </div>
        </section>

        {/* ── 인터뷰 목록 ── */}
        {interviews.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-8 py-16 lg:px-16">
            <h2 className="mb-10 font-mono text-xs uppercase tracking-widest text-[var(--color-text-secondary)]">
              Interviews ({interviews.length})
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview as Interview} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-neon)]"
    >
      {label} ↗
    </a>
  )
}
