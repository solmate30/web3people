'use client'

import Image from 'next/image'

type ReaderAvatarProps = {
  name: string
  imageUrl?: string | null
  size?: number
}

export function ReaderAvatar({ name, imageUrl, size = 28 }: ReaderAvatarProps) {
  const label = name.trim() || 'Reader'
  const resolvedImage = imageUrl?.trim() || null
  const initials = getInitials(label)

  if (resolvedImage) {
    return (
      <Image
        src={resolvedImage}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full border border-[var(--color-void-border)] object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--color-void-border)] bg-[var(--color-surface)] font-mono font-bold uppercase text-[var(--color-neon)]"
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.36)) }}
    >
      {initials}
    </span>
  )
}

function getInitials(label: string): string {
  const parts = label
    .replace(/@.*/, '')
    .split(/[\s._-]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}
