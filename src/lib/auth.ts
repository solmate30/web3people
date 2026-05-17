import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { env } from './env'

const turso = createClient({
  url: env.databaseUrl,
  authToken: env.databaseAuthToken,
})

const db = drizzle(turso)

const googleProvider =
  env.googleClientId && env.googleClientSecret
    ? {
        google: {
          clientId: env.googleClientId,
          clientSecret: env.googleClientSecret,
        },
      }
    : undefined

export const auth = betterAuth({
  secret: env.betterAuthSecret,
  baseURL: env.appUrl,
  basePath: '/auth',
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh every 24h
  },
  ...(googleProvider ? { socialProviders: googleProvider } : {}),
  trustedOrigins: [
    ...env.trustedOrigins,
  ],
})

export type Session = typeof auth.$Infer.Session
