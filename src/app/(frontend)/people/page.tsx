import type { Metadata } from 'next'
import { getPayload } from '@/lib/getPayload'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PersonCard } from '@/components/PersonCard'
import { findPublishedPeople } from '@/lib/publicContent'
import type { Person } from '@/payload-types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'People',
  description: 'web3 생태계를 만들어가는 빌더, 창업자, 투자자들을 만나보세요.',
}

export default async function PeoplePage() {
  const payload = await getPayload()

  const { docs: people } = await findPublishedPeople(payload, {
    limit: 48,
    depth: 1,
  })

  return (
    <>
      <Header />
      <main className="w-full pt-32 pb-24">
        <div className="mx-auto max-w-[1440px] px-8 lg:px-16">
          {/* 페이지 헤더 */}
          <div className="mb-14 border-b border-[var(--color-void-border)] pb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-neon)]">
              Directory
            </span>
            <h1 className="mt-2 text-4xl font-bold text-[var(--color-text-primary)] md:text-5xl">
              People
            </h1>
            <p className="mt-3 text-[var(--color-text-secondary)]">
              web3 생태계를 만들어가는 사람들
            </p>
          </div>

          {people.length === 0 ? (
            <p className="py-24 text-center text-[var(--color-text-muted)]">
              아직 등록된 인물이 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {people.map((person) => (
                <PersonCard key={person.id} person={person as Person} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
