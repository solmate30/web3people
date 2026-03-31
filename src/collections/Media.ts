import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: '설정',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        // 인터뷰 대표 이미지로 사용 중인지 확인
        const interviews = await req.payload.find({
          collection: 'interviews',
          where: { coverImage: { equals: id } },
          limit: 3,
          depth: 0,
          overrideAccess: true,
        })

        if (interviews.totalDocs > 0) {
          const titles = interviews.docs.map((d) => `"${(d as { title: string }).title}"`).join(', ')
          throw new Error(
            `이 이미지는 ${interviews.totalDocs}개의 인터뷰(${titles})에서 대표 이미지로 사용 중입니다. 먼저 해당 인터뷰에서 이미지를 교체한 후 삭제해 주세요.`,
          )
        }

        // 인물 프로필 사진으로 사용 중인지 확인
        const people = await req.payload.find({
          collection: 'people',
          where: { photo: { equals: id } },
          limit: 3,
          depth: 0,
          overrideAccess: true,
        })

        if (people.totalDocs > 0) {
          const names = people.docs.map((d) => `"${(d as { name: string }).name}"`).join(', ')
          throw new Error(
            `이 이미지는 ${people.totalDocs}명의 인물(${names}) 프로필 사진으로 사용 중입니다. 먼저 해당 인물 프로필에서 이미지를 교체한 후 삭제해 주세요.`,
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt 텍스트 (접근성)',
    },
    {
      // Cloudinary 플러그인이 자동으로 채움 — 직접 수정하지 마세요
      name: 'cloudinaryId',
      type: 'text',
      admin: { readOnly: true, hidden: true },
    },
  ],
  upload: {
    // imageSizes는 Cloudinary URL 변환으로 대체 (w_400, w_800, w_1440 등)
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
}
