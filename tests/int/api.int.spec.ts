import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('blocks anonymous user listing when access control is enforced', async () => {
    await expect(
      payload.find({
        collection: 'users',
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('blocks anonymous comment creation when access control is enforced', async () => {
    await expect(
      payload.create({
        collection: 'comments',
        data: {
          interview: 1,
          authorName: 'Anonymous',
          authorEmail: 'anonymous@example.com',
          content: 'Blocked anonymous comment',
          status: 'visible',
        },
        draft: false,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
