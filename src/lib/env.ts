const isProduction = process.env.NODE_ENV === 'production'

function requiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function requiredInProduction(name: string): string | undefined {
  const value = process.env[name]

  if (isProduction && !value) {
    throw new Error(`Missing required production environment variable: ${name}`)
  }

  return value
}

function requiredInProductionWithFallback(name: string, fallback: string): string {
  const value = process.env[name]

  if (isProduction && !value) {
    throw new Error(`Missing required production environment variable: ${name}`)
  }

  return value ?? fallback
}

function requiredAnyInProductionWithFallback(names: string[], fallback: string): string {
  const value = names.map((name) => process.env[name]).find(Boolean)

  if (isProduction && !value) {
    throw new Error(`Missing required production environment variable: ${names.join(' or ')}`)
  }

  return value ?? fallback
}

function listEnv(name: string): string[] {
  return (process.env[name] ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values)]
}

const appUrl = requiredAnyInProductionWithFallback(
  ['BETTER_AUTH_URL', 'NEXT_PUBLIC_APP_URL'],
  'http://localhost:3000',
)

export const env = {
  isProduction,
  allowDatabasePush: !isProduction && process.env.PAYLOAD_DB_PUSH === 'true',
  payloadSecret: requiredInProductionWithFallback('PAYLOAD_SECRET', 'dev-payload-secret'),
  databaseUrl: requiredInProductionWithFallback('DATABASE_URL', 'file:./payload.db'),
  databaseAuthToken: requiredInProduction('DATABASE_AUTH_TOKEN'),
  appUrl,
  trustedOrigins: uniqueValues([appUrl, ...listEnv('BETTER_AUTH_TRUSTED_ORIGINS')]),
  betterAuthSecret: requiredInProductionWithFallback('BETTER_AUTH_SECRET', 'dev-better-auth-secret'),
  googleClientId: requiredInProduction('GOOGLE_CLIENT_ID'),
  googleClientSecret: requiredInProduction('GOOGLE_CLIENT_SECRET'),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
}

export const getRequiredEnv = requiredEnv
