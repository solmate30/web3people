import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.run(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "email" text NOT NULL,
      "emailVerified" integer DEFAULT false NOT NULL,
      "image" text,
      "createdAt" integer NOT NULL,
      "updatedAt" integer NOT NULL
    );
  `)
  await payload.db.drizzle.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS "user_email_unique" ON "user" ("email");
  `)

  await payload.db.drizzle.run(`
    CREATE TABLE IF NOT EXISTS "session" (
      "id" text PRIMARY KEY NOT NULL,
      "expiresAt" integer NOT NULL,
      "token" text NOT NULL,
      "createdAt" integer NOT NULL,
      "updatedAt" integer NOT NULL,
      "ipAddress" text,
      "userAgent" text,
      "userId" text NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON UPDATE no action ON DELETE cascade
    );
  `)
  await payload.db.drizzle.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS "session_token_unique" ON "session" ("token");
  `)
  await payload.db.drizzle.run(`
    CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" ("userId");
  `)

  await payload.db.drizzle.run(`
    CREATE TABLE IF NOT EXISTS "account" (
      "id" text PRIMARY KEY NOT NULL,
      "accountId" text NOT NULL,
      "providerId" text NOT NULL,
      "userId" text NOT NULL,
      "accessToken" text,
      "refreshToken" text,
      "idToken" text,
      "accessTokenExpiresAt" integer,
      "refreshTokenExpiresAt" integer,
      "scope" text,
      "password" text,
      "createdAt" integer NOT NULL,
      "updatedAt" integer NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON UPDATE no action ON DELETE cascade
    );
  `)
  await payload.db.drizzle.run(`
    CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" ("userId");
  `)

  await payload.db.drizzle.run(`
    CREATE TABLE IF NOT EXISTS "verification" (
      "id" text PRIMARY KEY NOT NULL,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expiresAt" integer NOT NULL,
      "createdAt" integer NOT NULL,
      "updatedAt" integer NOT NULL
    );
  `)
  await payload.db.drizzle.run(`
    CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.run(`DROP TABLE IF EXISTS "verification";`)
  await payload.db.drizzle.run(`DROP TABLE IF EXISTS "account";`)
  await payload.db.drizzle.run(`DROP TABLE IF EXISTS "session";`)
  await payload.db.drizzle.run(`DROP TABLE IF EXISTS "user";`)
}
