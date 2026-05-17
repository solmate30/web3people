import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS \`board_posts\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`title\` text NOT NULL,
      \`content\` text NOT NULL,
      \`author_name\` text NOT NULL,
      \`author_email\` text NOT NULL,
      \`related_interview_id\` integer,
      \`related_person_id\` integer,
      \`visibility\` text DEFAULT 'published' NOT NULL,
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      FOREIGN KEY (\`related_interview_id\`) REFERENCES \`interviews\`(\`id\`) ON UPDATE no action ON DELETE set null,
      FOREIGN KEY (\`related_person_id\`) REFERENCES \`people\`(\`id\`) ON UPDATE no action ON DELETE set null
    );
  `)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`board_posts_author_email_idx\` ON \`board_posts\` (\`author_email\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`board_posts_related_interview_idx\` ON \`board_posts\` (\`related_interview_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`board_posts_related_person_idx\` ON \`board_posts\` (\`related_person_id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`board_posts_visibility_idx\` ON \`board_posts\` (\`visibility\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`board_posts_updated_at_idx\` ON \`board_posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`board_posts_created_at_idx\` ON \`board_posts\` (\`created_at\`);`)

  await db.run(sql`CREATE INDEX IF NOT EXISTS \`comments_author_email_idx\` ON \`comments\` (\`author_email\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`comments_status_idx\` ON \`comments\` (\`status\`);`)
  await db.run(sql`UPDATE \`comments\` SET \`status\` = 'visible' WHERE \`status\` = 'approved';`)
  await db.run(sql`UPDATE \`comments\` SET \`status\` = 'hidden' WHERE \`status\` = 'pending';`)
  await db.run(sql`UPDATE \`comments\` SET \`status\` = 'removed' WHERE \`status\` = 'rejected';`)

  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD COLUMN \`board_posts_id\` integer REFERENCES \`board_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade;`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_board_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`board_posts_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_board_posts_id_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`board_posts_author_email_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`board_posts_related_interview_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`board_posts_related_person_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`board_posts_visibility_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`board_posts_updated_at_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`board_posts_created_at_idx\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`board_posts\`;`)
}
