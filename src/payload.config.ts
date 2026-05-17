import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudinaryStorage } from './plugins/cloudinaryStorage'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { env } from './lib/env'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tags } from './collections/Tags'
import { People } from './collections/People'
import { Interviews } from './collections/Interviews'
import { Comments } from './collections/Comments'
import { BoardPosts } from './collections/BoardPosts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [People, Interviews, Tags, Comments, BoardPosts, Media, Users],
  editor: lexicalEditor(),
  secret: env.payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: env.databaseUrl,
      authToken: env.databaseAuthToken,
    },
    push: env.allowDatabasePush,
  }),
  sharp,
  plugins: [
    cloudinaryStorage(),
  ],
})
