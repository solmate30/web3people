import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/getPayload'
import { auth } from '@/lib/auth'
import { findPublishedBoardPosts } from '@/lib/publicContent'
import { isTrustedRequestOrigin } from '@/lib/requestOrigin'
import type { BoardPost, Interview, Person } from '@/payload-types'

const MAX_TITLE_LENGTH = 160
const MAX_CONTENT_LENGTH = 8000

type BoardPostResponse = {
  id: number
  title: string
  content: string
  authorName: string
  createdAt: string
  updatedAt: string
  canManage: boolean
  relatedInterview: { id: number; title: string; slug: string } | null
  relatedPerson: { id: number; name: string; slug: string } | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const relatedInterviewId = parsePositiveInteger(searchParams.get('interviewId'))
  const relatedPersonId = parsePositiveInteger(searchParams.get('personId'))

  const payload = await getPayload()
  const session = await auth.api.getSession({ headers: request.headers })
  const { docs } = await findPublishedBoardPosts(payload, {
    relatedInterviewId: relatedInterviewId ?? undefined,
    relatedPersonId: relatedPersonId ?? undefined,
    limit: 50,
    depth: 1,
  }).catch(() => ({ docs: [] as BoardPost[] }))

  return NextResponse.json({
    posts: docs.map((post) => toBoardPostResponse(post as BoardPost, session?.user.email)),
  })
}

export async function POST(request: Request) {
  if (!isTrustedRequestOrigin(request)) {
    return NextResponse.json({ message: 'Forbidden origin' }, { status: 403 })
  }

  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user.id || !session.user.email) {
    return NextResponse.json({ message: 'Login required' }, { status: 401 })
  }

  const body = await readJsonBody(request)
  const title = parseText(body.title, MAX_TITLE_LENGTH)
  const content = parseText(body.content, MAX_CONTENT_LENGTH)
  const relatedInterviewId = parsePositiveInteger(body.relatedInterviewId)
  const relatedPersonId = parsePositiveInteger(body.relatedPersonId)

  if (!title || !content) {
    return NextResponse.json({ message: 'Invalid board post payload' }, { status: 400 })
  }

  if (relatedInterviewId && relatedPersonId) {
    return NextResponse.json({ message: 'Only one related target is allowed' }, { status: 400 })
  }

  const payload = await getPayload()

  if (relatedInterviewId) {
    const interview = await payload.findByID({
      collection: 'interviews',
      id: relatedInterviewId,
      depth: 0,
      overrideAccess: false,
    }).catch(() => null)

    if (!interview || interview.status !== 'published') {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 })
    }
  }

  if (relatedPersonId) {
    const person = await payload.findByID({
      collection: 'people',
      id: relatedPersonId,
      depth: 0,
      overrideAccess: false,
    }).catch(() => null)

    if (!person || person.status !== 'published') {
      return NextResponse.json({ message: 'Person not found' }, { status: 404 })
    }
  }

  const post = await payload.create({
    collection: 'boardPosts',
    data: {
      title,
      content,
      authorName: session.user.name || session.user.email,
      authorEmail: session.user.email,
      relatedInterview: relatedInterviewId ?? undefined,
      relatedPerson: relatedPersonId ?? undefined,
      visibility: 'published',
    },
    overrideAccess: true,
  }).catch(() => null)

  if (!post) {
    return NextResponse.json({ message: 'Board storage is not ready' }, { status: 503 })
  }

  return NextResponse.json(
    { post: toBoardPostResponse(post as BoardPost, session.user.email) },
    { status: 201 },
  )
}

export function toBoardPostResponse(
  post: BoardPost,
  currentUserEmail?: string,
): BoardPostResponse {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    authorName: post.authorName,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    canManage: Boolean(currentUserEmail && post.authorEmail === currentUserEmail),
    relatedInterview: normalizeInterview(post.relatedInterview),
    relatedPerson: normalizePerson(post.relatedPerson),
  }
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json()
    return isRecord(body) ? body : {}
  } catch {
    return {}
  }
}

function parsePositiveInteger(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null

  const numberValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(numberValue) || numberValue <= 0) return null

  return numberValue
}

function parseText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null

  const text = value.trim()
  if (!text || text.length > maxLength) return null

  return text
}

function normalizeInterview(value: number | Interview | null | undefined) {
  if (!value || typeof value !== 'object') return null

  return {
    id: value.id,
    title: value.title,
    slug: value.slug,
  }
}

function normalizePerson(value: number | Person | null | undefined) {
  if (!value || typeof value !== 'object') return null

  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
