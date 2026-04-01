import Image from 'next/image'
import Link from 'next/link'
import type { Person, Media } from '@/payload-types'
import { cldUrl, transforms } from '@/lib/cloudinary'

type Props = {
  person: Person
}

export function PersonCard({ person }: Props) {
  const { name, slug, title, organization, photo } = person
  const img = photo as Media | null

  return (
    <Link href={`/people/${slug}`} className="group block">
      {/* 프로필 이미지 */}
      <div className="relative aspect-square overflow-hidden bg-[var(--color-surface)]">
        {img?.url ? (
          <Image
            src={cldUrl(img.url, transforms.profile)}
            alt={img.alt ?? name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)]">
            <span className="font-mono text-2xl text-[var(--color-text-muted)]">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-[var(--color-neon-dim)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* 정보 */}
      <div className="mt-3 space-y-0.5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-neon)]">
          {name}
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)]">{title}</p>
        {organization && (
          <p className="font-mono text-xs text-[var(--color-text-muted)]">{organization}</p>
        )}
      </div>
    </Link>
  )
}
