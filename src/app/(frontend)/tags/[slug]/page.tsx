import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { InterviewCard } from '@/components/InterviewCard'
import { PersonCard } from '@/components/PersonCard'
import { getPayload } from '@/lib/getPayload'
import {
  findPublishedInterviewsByTagId,
  findPublishedPeopleByTagId,
  findPublicTagBySlug,
  findPublicTagSlugs,
} from '@/lib/publicContent'
import type { Interview, Person } from '@/payload-types'

type TagPageProps = {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

const getPublicTag = cache(async (slug: string) => {
  const payload = await getPayload()
  const { docs } = await findPublicTagBySlug(payload, slug)
  return docs[0] ?? null
})

export async function generateStaticParams() {
  const payload = await getPayload()
  const { docs } = await findPublicTagSlugs(payload)
  return docs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await getPublicTag(slug)

  if (!tag) {
    return {
      title: 'Tag not found',
    }
  }

  return {
    title: `${tag.name} | Tags`,
    description: `${tag.name} 태그가 연결된 web3people 인터뷰와 인물`,
    openGraph: {
      title: `${tag.name} | web3people`,
      description: `${tag.name} 태그가 연결된 인터뷰와 인물을 살펴보세요.`,
      type: 'website',
    },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params
  const payload = await getPayload()
  const tag = await getPublicTag(slug)

  if (!tag) notFound()

  const [interviewsRes, peopleRes] = await Promise.all([
    findPublishedInterviewsByTagId(payload, tag.id, { limit: 24, depth: 2 }),
    findPublishedPeopleByTagId(payload, tag.id, { limit: 48, depth: 1 }),
  ])

  const interviews = interviewsRes.docs as Interview[]
  const people = peopleRes.docs as Person[]
  const total = interviewsRes.totalDocs + peopleRes.totalDocs

  return (
    <>
      <Header />
      <main className="w-full pt-32 pb-24">
        <div className="mx-auto max-w-[1440px] px-8 lg:px-16">
          <div className="mb-14 border-b border-[var(--color-void-border)] pb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-neon)]">
              Tag
            </span>
            <h1 className="mt-2 text-4xl font-bold text-[var(--color-text-primary)] md:text-5xl">
              {tag.name}
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              {total} linked items
            </p>
          </div>

          {total === 0 ? (
            <div className="border border-[var(--color-void-border)] p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
                No linked content
              </p>
              <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
                This tag is ready, but no published interviews or people are connected yet.
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {interviews.length > 0 && (
                <section>
                  <SectionTitle title="Interviews" count={interviewsRes.totalDocs} />
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {interviews.map((interview) => (
                      <InterviewCard key={interview.id} interview={interview} />
                    ))}
                  </div>
                </section>
              )}

              {people.length > 0 && (
                <section>
                  <SectionTitle title="People" count={peopleRes.totalDocs} />
                  <div className="mt-6 grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {people.map((person) => (
                      <PersonCard key={person.id} person={person} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-void-border)] pb-3">
      <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-secondary)]">
        {title}
      </h2>
      <span className="font-mono text-xs text-[var(--color-text-muted)]">{count}</span>
    </div>
  )
}
