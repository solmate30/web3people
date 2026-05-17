import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BoardPostDetail } from '@/components/board/BoardPostDetail'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Board Post | web3people',
  description: 'web3people 게시글 상세',
}

export default async function BoardPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const postId = parsePositiveInteger(id)

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[920px] px-8 pt-32 pb-24 lg:px-16">
        <Link
          href="/board"
          className="font-mono text-xs uppercase tracking-widest text-[var(--color-neon)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          Back to board
        </Link>
        <div className="mt-8">
          {postId ? (
            <BoardPostDetail postId={postId} />
          ) : (
            <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Invalid board post id.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function parsePositiveInteger(value: string): number | null {
  const numberValue = Number(value)
  if (!Number.isInteger(numberValue) || numberValue <= 0) return null

  return numberValue
}
