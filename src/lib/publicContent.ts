import type { Payload } from 'payload'
import type { Interview, Person, Tag } from '@/payload-types'

type FindOptions = {
  depth?: number
  limit?: number
  sort?: string
}

type RelatedInterviewOptions = FindOptions & {
  tagIds?: Array<number | string>
}

type FindBySlugOptions = {
  depth?: number
}

type SearchType = 'all' | 'interviews' | 'people'
type SearchSort = 'relevance' | 'latest'

export type SearchContentOptions = {
  query: string
  type?: SearchType
  sort?: SearchSort
  limit?: number
}

export type InterviewSearchResult = {
  type: 'interview'
  doc: Interview
  score: number
  date: string
}

export type PersonSearchResult = {
  type: 'person'
  doc: Person
  score: number
  date: string
}

export type SearchContentResult = InterviewSearchResult | PersonSearchResult

export function findPublishedInterviews(payload: Payload, options: FindOptions = {}) {
  return payload.find({
    collection: 'interviews',
    where: { status: { equals: 'published' } },
    sort: options.sort ?? '-publishedAt',
    limit: options.limit ?? 24,
    depth: options.depth ?? 1,
    overrideAccess: false,
  })
}

export function findPublicTags(payload: Payload, options: FindOptions = {}) {
  return payload.find({
    collection: 'tags',
    sort: options.sort ?? 'name',
    limit: options.limit ?? 24,
    depth: options.depth ?? 0,
    overrideAccess: false,
  })
}

export function findPublishedInterviewSlugs(payload: Payload) {
  return collectPublishedInterviewSlugs(payload)
}

async function collectPublishedInterviewSlugs(payload: Payload) {
  const slugs: Array<{ slug: string }> = []
  let page = 1
  let totalPages = 1

  do {
    const result = await payload.find({
      collection: 'interviews',
      where: { status: { equals: 'published' } },
      select: { slug: true },
      limit: 100,
      page,
      depth: 0,
      overrideAccess: false,
    })

    slugs.push(...result.docs.map((doc) => ({ slug: doc.slug })))
    totalPages = result.totalPages
    page += 1
  } while (page <= totalPages)

  return { docs: slugs }
}

export function findPublishedInterviewBySlug(
  payload: Payload,
  slug: string,
  options: FindBySlugOptions = {},
) {
  return payload.find({
    collection: 'interviews',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    depth: options.depth ?? 1,
    limit: 1,
    overrideAccess: false,
  })
}

export function findRelatedPublishedInterviews(
  payload: Payload,
  slug: string,
  options: RelatedInterviewOptions = {},
) {
  const tagIds = options.tagIds?.filter(Boolean) ?? []

  return payload.find({
    collection: 'interviews',
    where: {
      and: [
        { status: { equals: 'published' } },
        { slug: { not_equals: slug } },
        ...(tagIds.length > 0 ? [{ tags: { in: tagIds } }] : []),
      ],
    },
    sort: options.sort ?? '-publishedAt',
    limit: options.limit ?? 3,
    depth: options.depth ?? 1,
    overrideAccess: false,
  })
}

export function findPublishedPeople(payload: Payload, options: FindOptions = {}) {
  return payload.find({
    collection: 'people',
    where: { status: { equals: 'published' } },
    sort: options.sort ?? '-createdAt',
    limit: options.limit ?? 48,
    depth: options.depth ?? 1,
    overrideAccess: false,
  })
}

export function findPublishedPersonSlugs(payload: Payload) {
  return collectPublishedPersonSlugs(payload)
}

async function collectPublishedPersonSlugs(payload: Payload) {
  const slugs: Array<{ slug: string }> = []
  let page = 1
  let totalPages = 1

  do {
    const result = await payload.find({
      collection: 'people',
      where: { status: { equals: 'published' } },
      select: { slug: true },
      limit: 100,
      page,
      depth: 0,
      overrideAccess: false,
    })

    slugs.push(...result.docs.map((doc) => ({ slug: doc.slug })))
    totalPages = result.totalPages
    page += 1
  } while (page <= totalPages)

  return { docs: slugs }
}

export function findPublishedPersonBySlug(
  payload: Payload,
  slug: string,
  options: FindBySlugOptions = {},
) {
  return payload.find({
    collection: 'people',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    depth: options.depth ?? 1,
    limit: 1,
    overrideAccess: false,
  })
}

export function findPublishedInterviewsByPersonId(
  payload: Payload,
  personId: string | number,
  options: FindOptions = {},
) {
  return payload.find({
    collection: 'interviews',
    where: {
      and: [
        { subject: { equals: personId } },
        { status: { equals: 'published' } },
      ],
    },
    sort: options.sort ?? '-publishedAt',
    limit: options.limit ?? 24,
    depth: options.depth ?? 1,
    overrideAccess: false,
  })
}

export async function searchPublishedContent(
  payload: Payload,
  options: SearchContentOptions,
): Promise<SearchContentResult[]> {
  const query = normalizeSearchText(options.query)
  if (!query) return []

  const type = options.type ?? 'all'
  const limit = options.limit ?? 24
  const [interviewsRes, peopleRes] = await Promise.all([
    type === 'people'
      ? Promise.resolve({ docs: [] as Interview[] })
      : findPublishedInterviews(payload, { limit: 100, depth: 1 }),
    type === 'interviews'
      ? Promise.resolve({ docs: [] as Person[] })
      : findPublishedPeople(payload, { limit: 100, depth: 1 }),
  ])

  const interviewResults = interviewsRes.docs
    .map((doc) => toInterviewSearchResult(doc as Interview, query))
    .filter((result): result is InterviewSearchResult => result !== null)

  const personResults = peopleRes.docs
    .map((doc) => toPersonSearchResult(doc as Person, query))
    .filter((result): result is PersonSearchResult => result !== null)

  return [...interviewResults, ...personResults]
    .sort((a, b) => compareSearchResults(a, b, options.sort ?? 'relevance'))
    .slice(0, limit)
}

function toInterviewSearchResult(
  interview: Interview,
  query: string,
): InterviewSearchResult | null {
  const subject = interview.subject as Person | null
  const tags = (interview.tags as Tag[] | null) ?? []
  const text = normalizeSearchText([
    interview.title,
    interview.excerpt,
    subject?.name,
    subject?.name_en,
    subject?.organization,
    ...tags.map((tag) => tag.name),
    extractUnknownText(interview.content),
  ].join(' '))
  const score = scoreText(text, query, [
    interview.title,
    interview.excerpt,
    subject?.name,
    ...tags.map((tag) => tag.name),
  ])

  if (score <= 0) return null

  return {
    type: 'interview',
    doc: interview,
    score,
    date: interview.publishedAt ?? interview.createdAt,
  }
}

function toPersonSearchResult(person: Person, query: string): PersonSearchResult | null {
  const tags = (person.tags as Tag[] | null) ?? []
  const text = normalizeSearchText([
    person.name,
    person.name_en,
    person.title,
    person.organization,
    person.country,
    ...tags.map((tag) => tag.name),
    extractUnknownText(person.bio),
  ].join(' '))
  const score = scoreText(text, query, [
    person.name,
    person.name_en,
    person.title,
    person.organization,
    ...tags.map((tag) => tag.name),
  ])

  if (score <= 0) return null

  return {
    type: 'person',
    doc: person,
    score,
    date: person.createdAt,
  }
}

function compareSearchResults(
  a: SearchContentResult,
  b: SearchContentResult,
  sort: SearchSort,
): number {
  if (sort === 'latest') return dateValue(b.date) - dateValue(a.date)

  return b.score - a.score || dateValue(b.date) - dateValue(a.date)
}

function scoreText(text: string, query: string, priorityFields: Array<string | null | undefined>) {
  const terms = query.split(' ').filter(Boolean)
  let score = text.includes(query) ? 5 : 0

  for (const term of terms) {
    if (text.includes(term)) score += 1
  }

  const priorityText = normalizeSearchText(priorityFields.filter(Boolean).join(' '))
  if (priorityText.includes(query)) score += 5

  for (const term of terms) {
    if (priorityText.includes(term)) score += 2
  }

  return score
}

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function dateValue(date: string): number {
  return new Date(date).getTime() || 0
}

function extractUnknownText(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (!value) return ''
  if (Array.isArray(value)) return value.map(extractUnknownText).join(' ')
  if (typeof value !== 'object') return ''

  return Object.values(value as Record<string, unknown>).map(extractUnknownText).join(' ')
}
