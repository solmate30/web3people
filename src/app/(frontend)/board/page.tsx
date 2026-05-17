import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BoardList } from '@/components/board/BoardList'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Board | web3people',
  description: 'web3people 독자 게시판',
}

export default function BoardPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] px-8 pt-32 pb-24 lg:px-16">
        <div className="flex flex-col gap-6 border-b border-[var(--color-void-border)] pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-neon)]">
              Community
            </p>
            <h1 className="mt-4 text-4xl font-black uppercase leading-none text-[var(--color-text-primary)] md:text-6xl">
              Board
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">
              인터뷰를 읽은 뒤 남는 질문, web3 빌더에게 묻고 싶은 이야기, 커뮤니티 토론을 남기는 공간입니다.
            </p>
          </div>
          <Link
            href="/board/new"
            className="inline-flex justify-center border border-[var(--color-neon)] px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-neon)] transition-colors hover:bg-[var(--color-neon)] hover:text-[var(--color-void)]"
          >
            New post
          </Link>
        </div>

        <section className="mt-10">
          <BoardList />
        </section>
      </main>
      <Footer />
    </>
  )
}
