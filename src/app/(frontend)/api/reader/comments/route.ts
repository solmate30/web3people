import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/getPayload'
import { auth } from '@/lib/auth'
import { findVisibleCommentsByInterviewId } from '@/lib/publicContent'
import { isTrustedRequestOrigin } from '@/lib/requestOrigin'
import type { Comment } from '@/payload-types'

const MAX_COMMENT_LENGTH = 2000

type CommentResponse = {
  id: number
  authorName: string
  authorImage: string | null
  content: string
  createdAt: string
  updatedAt: string
  canManage: boolean
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const interviewId = parsePositiveInteger(searchParams.get('interviewId'))

  if (!interviewId) {
    return NextResponse.json({ message: 'Invalid interviewId' }, { status: 400 })
  }

  const payload = await getPayload()
  const session = await auth.api.getSession({ headers: request.headers })
  const { docs } = await findVisibleCommentsByInterviewId(payload, interviewId)

  // Backfill missing profile images for the current reader's own comments.
  const sessionImage = typeof session?.user.image === 'string' ? session.user.image.trim() : ''
  if (session?.user.email && sessionImage) {
    await Promise.all(
      docs
        .filter((comment) => {
          const item = comment as Comment
          return item.authorEmail === session.user.email && !item.authorImage
        })
        .map((comment) =>
          payload.update({
            collection: 'comments',
            id: comment.id,
            data: { authorImage: sessionImage },
            overrideAccess: true,
            context: { skipHooks: true },
          }).then((updated) => {
            Object.assign(comment, { authorImage: updated.authorImage })
          }).catch(() => undefined),
        ),
    )
  }

  return NextResponse.json({
    comments: docs.map((comment) => toCommentResponse(comment as Comment, session?.user.email)),
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
  const interviewId = parsePositiveInteger(body.interviewId)
  const content = parseCommentContent(body.content)

  if (!interviewId || !content) {
    return NextResponse.json({ message: 'Invalid comment payload' }, { status: 400 })
  }

  const payload = await getPayload()
  const interview = await payload.findByID({
    collection: 'interviews',
    id: interviewId,
    depth: 0,
    overrideAccess: false,
  }).catch(() => null)

  if (!interview || interview.status !== 'published') {
    return NextResponse.json({ message: 'Interview not found' }, { status: 404 })
  }

  const authorImage = typeof session.user.image === 'string' ? session.user.image.trim() : ''

  const comment = await payload.create({
    collection: 'comments',
    data: {
      interview: interviewId,
      authorName: session.user.name || session.user.email,
      authorEmail: session.user.email,
      ...(authorImage ? { authorImage } : {}),
      content,
      status: 'visible',
    },
    overrideAccess: true,
  })

  return NextResponse.json(
    { comment: toCommentResponse(comment as Comment, session.user.email) },
    { status: 201 },
  )
}

function toCommentResponse(comment: Comment, currentUserEmail?: string): CommentResponse {
  return {
    id: comment.id,
    authorName: comment.authorName,
    authorImage: comment.authorImage?.trim() || null,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    canManage: Boolean(currentUserEmail && comment.authorEmail === currentUserEmail),
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

function parseCommentContent(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const content = value.trim()
  if (!content || content.length > MAX_COMMENT_LENGTH) return null

  return content
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
