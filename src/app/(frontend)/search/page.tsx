import Link from 'next/link'
import type { Metadata } from 'next'
import { Search } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { InterviewCard } from '@/components/InterviewCard'
import { PersonCard } from '@/components/PersonCard'
import { getPayload } from '@/lib/getPayload'
import {
  findPublicTags,
  searchPublishedContent,
  type SearchContentResult,
} from '@/lib/publicContent'

type SearchPageProps = {
  searchParams: Promise<{
    q?: string
    type?: string
    sort?: string
  }>
}

type SearchType = 'all' | 'interviews' | 'people'
type SearchSort = 'relevance' | 'latest'

export const metadata: Metadata = {
  title: 'Search',
  description: 'web3people 인터뷰와 인물을 검색합니다.',
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = (params.q ?? '').trim()
  const type = parseType(params.type)
  const sort = parseSort(params.sort)
  const payload = await getPayload()

  const [results, tagsRes] = await Promise.all([
    query
      ? searchPublishedContent(payload, {
          query,
          type,
          sort,
          limit: 36,
        })
      : Promise.resolve([]),
    findPublicTags(payload, { limit: 12 }),
  ])

  const interviews = results.filter(isInterviewResult)
  const people = results.filter(isPersonResult)

  return (
    <>
      <Header />
      <main className="w-full pt-32 pb-24">
        <div className="mx-auto max-w-[1440px] px-8 lg:px-16">
          <div className="mb-10 border-b border-[var(--color-void-border)] pb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-neon)]">
              Discovery
            </span>
            <h1 className="mt-2 text-4xl font-bold text-[var(--color-text-primary)] md:text-5xl">
              Search
            </h1>
          </div>

          <form action="/search" className="flex flex-col gap-3 md:flex-row">
            <label className="sr-only" htmlFor="search-query">
              Search web3people
            </label>
            <input
              id="search-query"
              name="q"
              defaultValue={query}
              placeholder="Search interviews, people, topics..."
              className="min-h-12 flex-1 border border-[var(--color-void-border)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-neon)]"
            />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="sort" value={sort} />
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-[var(--color-neon)] px-5 font-mono text-xs uppercase tracking-widest text-[var(--color-neon)] transition-colors hover:bg-[var(--color-neon)] hover:text-[#0A0A0A]"
            >
              <Search size={16} aria-hidden="true" />
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-4 border-b border-[var(--color-void-border)] pb-8 lg:flex-row lg:items-center lg:justify-between">
            <FilterLinks query={query} type={type} sort={sort} />
            <SortLinks query={query} type={type} sort={sort} />
          </div>

          {query ? (
            <SearchResults query={query} interviews={interviews} people={people} />
          ) : (
            <EmptyStart tags={tagsRes.docs} />
          )}

          {query && results.length === 0 && <NoResults query={query} tags={tagsRes.docs} />}
        </div>
      </main>
      <Footer />
    </>
  )
}

function SearchResults({
  query,
  interviews,
  people,
}: {
  query: string
  interviews: Extract<SearchContentResult, { type: 'interview' }>[]
  people: Extract<SearchContentResult, { type: 'person' }>[]
}) {
  const total = interviews.length + people.length

  if (total === 0) return null

  return (
    <div className="mt-10 space-y-16">
      <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
        {total} results for <span className="text-[var(--color-neon)]">{query}</span>
      </div>

      {interviews.length > 0 && (
        <section>
          <SectionTitle title="Interviews" count={interviews.length} />
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {interviews.map((result) => (
              <InterviewCard key={result.doc.id} interview={result.doc} />
            ))}
          </div>
        </section>
      )}

      {people.length > 0 && (
        <section>
          <SectionTitle title="People" count={people.length} />
          <div className="mt-6 grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {people.map((result) => (
              <PersonCard key={result.doc.id} person={result.doc} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function EmptyStart({
  tags,
}: {
  tags: Array<{ id: number | string; name: string; slug: string }>
}) {
  return (
    <div className="mt-16">
      <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
        Search across published interviews, people, topics, organizations, and profile bios.
      </p>
      <RecommendedTags tags={tags} />
    </div>
  )
}

function NoResults({
  query,
  tags,
}: {
  query: string
  tags: Array<{ id: number | string; name: string; slug: string }>
}) {
  return (
    <div className="mt-16 border border-[var(--color-void-border)] p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
        No results
      </p>
      <h2 className="mt-3 text-2xl font-bold text-[var(--color-text-primary)]">
        {query}
      </h2>
      <RecommendedTags tags={tags} />
    </div>
  )
}

function RecommendedTags({
  tags,
}: {
  tags: Array<{ id: number | string; name: string; slug: string }>
}) {
  if (tags.length === 0) return null

  return (
    <div className="mt-8">
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
        Suggested topics
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="border border-[var(--color-void-border)] px-3 py-1.5 font-mono text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

function FilterLinks({
  query,
  type,
  sort,
}: {
  query: string
  type: SearchType
  sort: SearchSort
}) {
  const items: Array<{ label: string; value: SearchType }> = [
    { label: 'All', value: 'all' },
    { label: 'Interviews', value: 'interviews' },
    { label: 'People', value: 'people' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.value}
          href={searchHref(query, item.value, sort)}
          className={controlClass(item.value === type)}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}

function SortLinks({
  query,
  type,
  sort,
}: {
  query: string
  type: SearchType
  sort: SearchSort
}) {
  const items: Array<{ label: string; value: SearchSort }> = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Latest', value: 'latest' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.value}
          href={searchHref(query, type, item.value)}
          className={controlClass(item.value === sort)}
        >
          {item.label}
        </Link>
      ))}
    </div>
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

function parseType(type: string | undefined): SearchType {
  if (type === 'interviews' || type === 'people') return type
  return 'all'
}

function parseSort(sort: string | undefined): SearchSort {
  if (sort === 'latest') return sort
  return 'relevance'
}

function searchHref(query: string, type: SearchType, sort: SearchSort): string {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (type !== 'all') params.set('type', type)
  if (sort !== 'relevance') params.set('sort', sort)

  const value = params.toString()
  return value ? `/search?${value}` : '/search'
}

function controlClass(active: boolean): string {
  return [
    'border px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors',
    active
      ? 'border-[var(--color-neon)] text-[var(--color-neon)]'
      : 'border-[var(--color-void-border)] text-[var(--color-text-muted)] hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]',
  ].join(' ')
}

function isInterviewResult(
  result: SearchContentResult,
): result is Extract<SearchContentResult, { type: 'interview' }> {
  return result.type === 'interview'
}

function isPersonResult(
  result: SearchContentResult,
): result is Extract<SearchContentResult, { type: 'person' }> {
  return result.type === 'person'
}
