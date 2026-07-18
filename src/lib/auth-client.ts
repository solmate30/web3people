import { createAuthClient } from 'better-auth/react'

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '')

/**
 * Prefer same-origin requests when NEXT_PUBLIC_APP_URL is unset so production
 * never falls back to localhost. Set NEXT_PUBLIC_APP_URL explicitly when the
 * auth client must call a different absolute origin.
 */
export const authClient = createAuthClient({
  ...(appUrl ? { baseURL: appUrl } : {}),
  basePath: '/auth',
})

export const { signIn, signOut, signUp, useSession } = authClient
