import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/getPayload'
import { auth } from '@/lib/auth'
import type { Comment } from '@/payload-types'

const MAX_COMMENT_LENGTH = 2000

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user.email) {
    return NextResponse.json({ message: 'Login required' }, { status: 401 })
  }

  const { id } = await params
  const commentId = parsePositiveInteger(id)
  const body = await readJsonBody(request)
  const content = parseCommentContent(body.content)

  if (!commentId || !content) {
    return NextResponse.json({ message: 'Invalid comment payload' }, { status: 400 })
  }

  const payload = await getPayload()
  const comment = await findComment(payload, commentId)

  if (!comment || comment.status !== 'visible') {
    return NextResponse.json({ message: 'Comment not found' }, { status: 404 })
  }

  if (comment.authorEmail !== session.user.email) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const updated = await payload.update({
    collection: 'comments',
    id: commentId,
    data: { content },
    overrideAccess: true,
  })

  return NextResponse.json({
    comment: {
      id: updated.id,
      authorName: updated.authorName,
      content: updated.content,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      canManage: true,
    },
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user.email) {
    return NextResponse.json({ message: 'Login required' }, { status: 401 })
  }

  const { id } = await params
  const commentId = parsePositiveInteger(id)

  if (!commentId) {
    return NextResponse.json({ message: 'Invalid comment id' }, { status: 400 })
  }

  const payload = await getPayload()
  const comment = await findComment(payload, commentId)

  if (!comment || comment.status === 'removed') {
    return NextResponse.json({ message: 'Comment not found' }, { status: 404 })
  }

  if (comment.authorEmail !== session.user.email) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  await payload.update({
    collection: 'comments',
    id: commentId,
    data: { status: 'removed' },
    overrideAccess: true,
  })

  return NextResponse.json({ id: commentId })
}

async function findComment(
  payload: Awaited<ReturnType<typeof getPayload>>,
  id: number,
): Promise<Comment | null> {
  return payload.findByID({
    collection: 'comments',
    id,
    depth: 0,
    overrideAccess: true,
  }).catch(() => null) as Promise<Comment | null>
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
