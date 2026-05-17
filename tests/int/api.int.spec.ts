import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
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
          status: 'approved',
        },
        draft: false,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
