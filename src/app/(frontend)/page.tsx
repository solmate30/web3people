import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPayload } from '@/lib/getPayload'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { InterviewCard } from '@/components/InterviewCard'
import { PersonCard } from '@/components/PersonCard'
import { cldUrl, transforms } from '@/lib/cloudinary'
import { findPublishedInterviews, findPublishedPeople } from '@/lib/publicContent'
import type { Interview, Media, Person } from '@/payload-types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Web3People',
  description: 'web3 생태계를 만들어가는 빌더, 창업자, 투자자들의 인물과 인터뷰를 만나는 매거진',
  openGraph: {
    title: 'Web3People',
    description: 'web3 생태계를 만들어가는 사람들의 깊이 있는 인터뷰',
    type: 'website',
  },
}

export default async function HomePage() {
  const payload = await getPayload()

  const [interviewsRes, peopleRes] = await Promise.all([
    findPublishedInterviews(payload, {
      limit: 9,
      depth: 2,
    }),
    findPublishedPeople(payload, {
      limit: 6,
      depth: 1,
    }),
  ])

  const [hero, ...gridInterviews] = interviewsRes.docs
  const people = peopleRes.docs

  return (
    <>
      <Header />
      <main>
        {/* ── 히어로 ── */}
        {hero && <HeroSection interview={hero as Interview} />}

        {/* ── 최신 인터뷰 그리드 ── */}
        {gridInterviews.length > 0 && (
          <section className="w-full py-20">
            <div className="mx-auto max-w-[1440px] px-8 lg:px-16">
              <SectionHeader title="Latest Interviews" href="/interviews" />
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview as Interview} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 인물 미리보기 ── */}
        {people.length > 0 && (
          <section className="w-full border-t border-[var(--color-void-border)] bg-[var(--color-surface)] py-20">
            <div className="mx-auto max-w-[1440px] px-8 lg:px-16">
              <SectionHeader title="People" href="/people" />
              <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
                {people.map((person) => (
                  <PersonCard key={person.id} person={person as Person} />
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

// ── 히어로 섹션 ─────────────────────────────────────────────
function HeroSection({ interview }: { interview: Interview }) {
  const cover = interview.coverImage as Media | null
  const person = interview.subject as Person | null

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* 배경 이미지 */}
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

      {/* 그라디언트 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,10,10,0.2)] via-[rgba(10,10,10,0.55)] to-[#0A0A0A]" />

      {/* 콘텐츠 — 화면 중앙 정렬 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        {/* 태그 */}
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-neon)]">
          Featured Interview
        </span>

        {/* 제목 — 대형 볼드 */}
        <h1 className="mt-4 max-w-5xl text-4xl font-black uppercase leading-none tracking-tight text-white md:text-6xl lg:text-7xl">
          {interview.title}
        </h1>

        {/* 인물 + 발췌 */}
        {person && (
          <p className="mt-5 max-w-xl text-sm text-[var(--color-text-secondary)] md:text-base">
            {person.name}
            {interview.excerpt && (
              <span className="ml-1">— {interview.excerpt}</span>
            )}
          </p>
        )}

        {/* 스크롤 다운 화살표 */}
        <Link
          href={`/interviews/${interview.slug}`}
          className="mt-10 flex h-10 w-10 items-center justify-center border border-[var(--color-neon)] text-xl text-[var(--color-neon)] transition-all hover:bg-[var(--color-neon)] hover:text-[#0A0A0A]"
          aria-label="인터뷰 읽기"
        >
          ↓
        </Link>
      </div>
    </section>
  )
}

// ── 섹션 헤더 ────────────────────────────────────────────────
function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-void-border)] pb-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-secondary)]">
        {title}
      </h2>
      <Link
        href={href}
        className="font-mono text-xs uppercase tracking-widest text-[var(--color-neon)] transition-opacity hover:opacity-70"
      >
        View All →
      </Link>
    </div>
  )
}
