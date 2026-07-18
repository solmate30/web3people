import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Idempotent: ignore "duplicate column" if the field was already pushed.
  try {
    await db.run(sql`ALTER TABLE \`comments\` ADD COLUMN \`author_image\` text;`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!/duplicate column name/i.test(message)) {
      throw error
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // SQLite rollback for ADD COLUMN is skipped intentionally.
  void db
}
