/**
 * 시드 스크립트 — 초기 어드민/편집자 계정 생성
 *
 * 실행: pnpm payload run src/scripts/seed.ts
 *
 * 이미 유저가 있으면 건너뜁니다.
 * 프로덕션에서는 계정 생성 후 반드시 비밀번호를 변경하세요.
 */
import { getPayload } from 'payload'
import config from '../payload.config'

async function seed() {
  const payload = await getPayload({ config })

  const existing = await payload.find({ collection: 'users', limit: 1 })

  if (existing.totalDocs > 0) {
    payload.logger.info('유저가 이미 존재합니다. 시드를 건너뜁니다.')
    process.exit(0)
  }

  // 관리자 계정
  const admin = await payload.create({
    collection: 'users',
    data: {
      name: '관리자',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@web3people.co',
      password: process.env.SEED_ADMIN_PASSWORD || '1234',
      role: 'admin',
    },
  })

  payload.logger.info(`관리자 생성 완료: ${admin.email}`)

  // 편집자 계정 1
  const editor1 = await payload.create({
    collection: 'users',
    data: {
      name: '편집자 1',
      email: process.env.SEED_EDITOR1_EMAIL || 'editor1@web3people.co',
      password: process.env.SEED_EDITOR1_PASSWORD || '1234',
      role: 'editor',
    },
  })

  payload.logger.info(`편집자 1 생성 완료: ${editor1.email}`)

  // 편집자 계정 2
  const editor2 = await payload.create({
    collection: 'users',
    data: {
      name: '편집자 2',
      email: process.env.SEED_EDITOR2_EMAIL || 'editor2@web3people.co',
      password: process.env.SEED_EDITOR2_PASSWORD || '1234',
      role: 'editor',
    },
  })

  payload.logger.info(`편집자 2 생성 완료: ${editor2.email}`)
  payload.logger.info('시드 완료. 반드시 /admin에서 비밀번호를 변경하세요.')

  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
