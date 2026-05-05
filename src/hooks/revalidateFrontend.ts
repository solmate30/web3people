import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

type RevalidateFrontendOptions = {
  detailPathPrefix: string
  paths: string[]
}

function getSlug(doc: unknown): string | undefined {
  if (!doc || typeof doc !== 'object' || !('slug' in doc)) return undefined

  const slug = doc.slug
  return typeof slug === 'string' ? slug : undefined
}

function revalidateFrontendPaths(
  { detailPathPrefix, paths }: RevalidateFrontendOptions,
  doc: unknown,
  previousDoc?: unknown,
) {
  for (const path of paths) {
    revalidatePathSafely(path)
  }

  const slug = getSlug(doc)
  if (slug) {
    revalidatePathSafely(`${detailPathPrefix}/${slug}`)
  }

  const previousSlug = getSlug(previousDoc)
  if (previousSlug && previousSlug !== slug) {
    revalidatePathSafely(`${detailPathPrefix}/${previousSlug}`)
  }
}

function revalidatePathSafely(path: string) {
  try {
    revalidatePath(path)
  } catch {
    // Payload hooks can also run from CLI scripts, where Next cache context is unavailable.
  }
}

export function revalidateFrontendAfterChange(
  options: RevalidateFrontendOptions,
): CollectionAfterChangeHook {
  return ({ doc, previousDoc }) => {
    revalidateFrontendPaths(options, doc, previousDoc)
    return doc
  }
}

export function revalidateFrontendAfterDelete(
  options: RevalidateFrontendOptions,
): CollectionAfterDeleteHook {
  return ({ doc }) => {
    revalidateFrontendPaths(options, doc)
    return doc
  }
}
