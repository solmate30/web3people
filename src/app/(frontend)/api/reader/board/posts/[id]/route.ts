import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/getPayload'
import { auth } from '@/lib/auth'
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const postId = parsePositiveInteger(id)

  if (!postId) {
    return NextResponse.json({ message: 'Invalid board post id' }, { status: 400 })
  }

  const payload = await getPayload()
  const session = await auth.api.getSession({ headers: request.headers })
  const post = await findBoardPost(payload, postId)

  if (!post || post.visibility !== 'published') {
    return NextResponse.json({ message: 'Board post not found' }, { status: 404 })
  }

  return NextResponse.json({
    post: toBoardPostResponse(post, session?.user.email),
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isTrustedRequestOrigin(request)) {
    return NextResponse.json({ message: 'Forbidden origin' }, { status: 403 })
  }

  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user.email) {
    return NextResponse.json({ message: 'Login required' }, { status: 401 })
  }

  const { id } = await params
  const postId = parsePositiveInteger(id)
  const body = await readJsonBody(request)
  const title = parseText(body.title, MAX_TITLE_LENGTH)
  const content = parseText(body.content, MAX_CONTENT_LENGTH)

  if (!postId || !title || !content) {
    return NextResponse.json({ message: 'Invalid board post payload' }, { status: 400 })
  }

  const payload = await getPayload()
  const post = await findBoardPost(payload, postId)

  if (!post || post.visibility !== 'published') {
    return NextResponse.json({ message: 'Board post not found' }, { status: 404 })
  }

  if (post.authorEmail !== session.user.email) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const updated = await payload.update({
    collection: 'boardPosts',
    id: postId,
    data: { title, content },
    overrideAccess: true,
  })

  return NextResponse.json({
    post: toBoardPostResponse(updated as BoardPost, session.user.email),
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isTrustedRequestOrigin(request)) {
    return NextResponse.json({ message: 'Forbidden origin' }, { status: 403 })
  }

  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user.email) {
    return NextResponse.json({ message: 'Login required' }, { status: 401 })
  }

  const { id } = await params
  const postId = parsePositiveInteger(id)

  if (!postId) {
    return NextResponse.json({ message: 'Invalid board post id' }, { status: 400 })
  }

  const payload = await getPayload()
  const post = await findBoardPost(payload, postId)

  if (!post || post.visibility === 'removed') {
    return NextResponse.json({ message: 'Board post not found' }, { status: 404 })
  }

  if (post.authorEmail !== session.user.email) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  await payload.update({
    collection: 'boardPosts',
    id: postId,
    data: { visibility: 'removed' },
    overrideAccess: true,
  })

  return NextResponse.json({ id: postId })
}

async function findBoardPost(
  payload: Awaited<ReturnType<typeof getPayload>>,
  id: number,
): Promise<BoardPost | null> {
  return payload.findByID({
    collection: 'boardPosts',
    id,
    depth: 1,
    overrideAccess: true,
  }).catch(() => null) as Promise<BoardPost | null>
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

function toBoardPostResponse(
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
