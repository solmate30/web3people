import type { Metadata } from 'next'
import { getPayload } from '@/lib/getPayload'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { InterviewCard } from '@/components/InterviewCard'
import type { Interview } from '@/payload-types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Interviews',
  description: 'web3 빌더, 창업자, 투자자들의 심층 인터뷰',
}

export default async function InterviewsPage() {
  const payload = await getPayload()

  const { docs: interviews } = await payload.find({
    collection: 'interviews',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 24,
    depth: 2,
  })

  return (
    <>
      <Header />
      <main className="w-full pt-32 pb-24">
        <div className="mx-auto max-w-[1440px] px-8 lg:px-16">
          {/* 페이지 헤더 */}
          <div className="mb-14 border-b border-[var(--color-void-border)] pb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-neon)]">
              Archive
            </span>
            <h1 className="mt-2 text-4xl font-bold text-[var(--color-text-primary)] md:text-5xl">
              Interviews
            </h1>
            <p className="mt-3 text-[var(--color-text-secondary)]">
              web3를 만드는 사람들의 이야기
            </p>
          </div>

          {interviews.length === 0 ? (
            <p className="py-24 text-center text-[var(--color-text-muted)]">
              아직 발행된 인터뷰가 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview as Interview} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
