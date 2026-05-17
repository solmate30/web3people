import type { Payload } from 'payload'

type FindOptions = {
  depth?: number
  limit?: number
  sort?: string
}

type FindBySlugOptions = {
  depth?: number
}

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

export function findPublishedInterviewSlugs(payload: Payload) {
  return payload.find({
    collection: 'interviews',
    where: { status: { equals: 'published' } },
    select: { slug: true },
    limit: 1000,
    depth: 0,
    overrideAccess: false,
  })
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
  options: FindOptions = {},
) {
  return payload.find({
    collection: 'interviews',
    where: {
      and: [
        { status: { equals: 'published' } },
        { slug: { not_equals: slug } },
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
  return payload.find({
    collection: 'people',
    where: { status: { equals: 'published' } },
    select: { slug: true },
    limit: 1000,
    depth: 0,
    overrideAccess: false,
  })
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
