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

export const auth = betterAuth({
  secret: env.betterAuthSecret,
  baseURL: env.appUrl,
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
  trustedOrigins: [
    ...env.trustedOrigins,
  ],
})

export type Session = typeof auth.$Infer.Session
