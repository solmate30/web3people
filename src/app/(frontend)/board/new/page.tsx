import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BoardPostForm } from '@/components/board/BoardPostForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'New Board Post | web3people',
  description: 'web3people 게시글 작성',
}

type PageProps = {
  searchParams: Promise<{
    interviewId?: string
    personId?: string
  }>
}

export default async function NewBoardPostPage({ searchParams }: PageProps) {
  const params = await searchParams
  const relatedInterviewId = parsePositiveInteger(params.interviewId)
  const relatedPersonId = relatedInterviewId ? null : parsePositiveInteger(params.personId)

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[920px] px-8 pt-32 pb-24 lg:px-16">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-neon)]">
          Community
        </p>
        <h1 className="mt-4 text-4xl font-black uppercase leading-none text-[var(--color-text-primary)] md:text-6xl">
          New Post
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">
          독자 계정으로 질문과 토론 주제를 남길 수 있습니다.
        </p>
        <div className="mt-10">
          <BoardPostForm
            relatedInterviewId={relatedInterviewId ?? undefined}
            relatedPersonId={relatedPersonId ?? undefined}
            callbackURL={`/board/new${buildQueryString(relatedInterviewId, relatedPersonId)}`}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}

function parsePositiveInteger(value: string | undefined): number | null {
  if (!value) return null

  const numberValue = Number(value)
  if (!Number.isInteger(numberValue) || numberValue <= 0) return null

  return numberValue
}

function buildQueryString(relatedInterviewId: number | null, relatedPersonId: number | null) {
  const params = new URLSearchParams()
  if (relatedInterviewId) params.set('interviewId', String(relatedInterviewId))
  if (relatedPersonId) params.set('personId', String(relatedPersonId))

  const query = params.toString()
  return query ? `?${query}` : ''
}
