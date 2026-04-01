import { getPayload as _getPayload } from 'payload'
import config from '@payload-config'

export const getPayload = () => _getPayload({ config })

export function formatDate(date: string | null | undefined): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}
