import { env } from './env'

export function isTrustedRequestOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false

  return env.trustedOrigins.includes(origin)
}
