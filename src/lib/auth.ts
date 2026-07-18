import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { authSchema } from './auth-schema'
import { env } from './env'

const turso = createClient({
  url: env.databaseUrl,
  authToken: env.databaseAuthToken,
})

const db = drizzle(turso, { schema: authSchema })

const googleProvider = env.isGoogleAuthEnabled
  ? {
      google: {
        clientId: env.googleClientId as string,
        clientSecret: env.googleClientSecret as string,
      },
    }
  : undefined

/**
 * Dynamic baseURL so production OAuth callbacks use the public custom domain
 * (www.web3people.online) even when BETTER_AUTH_URL still points at *.vercel.app.
 */
export const auth = betterAuth({
  secret: env.betterAuthSecret,
  baseURL: {
    allowedHosts: [
      'localhost:3000',
      '127.0.0.1:3000',
      'www.web3people.online',
      'web3people.online',
    ],
    fallback: 'https://www.web3people.online',
  },
  basePath: '/auth',
  advanced: {
    // Vercel sets X-Forwarded-Host / X-Forwarded-Proto for the public domain.
    trustedProxyHeaders: true,
  },
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24h
  },
  ...(googleProvider ? { socialProviders: googleProvider } : {}),
  trustedOrigins: [...env.trustedOrigins],
})

export type Session = typeof auth.$Infer.Session
