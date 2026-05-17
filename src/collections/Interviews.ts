import type { CollectionConfig } from 'payload'
import {
  revalidateFrontendAfterChange,
  revalidateFrontendAfterDelete,
} from '@/hooks/revalidateFrontend'

export const Interviews: CollectionConfig = {
  slug: 'interviews',
  admin: {
    useAsTitle: 'title',
    group: '콘텐츠',
    defaultColumns: ['title', 'subject', 'status', 'publishedAt'],
    listSearchableFields: ['title', 'excerpt'],
  },
  access: {
    read: ({ req }) => {
      // 발행된 인터뷰는 누구나 조회 가능
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
  },
  fields: [
    // 기본 정보
    {
      name: 'title',
      type: 'text',
      required: true,
      label: '인터뷰 제목',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: '슬러그',
      admin: {
        description: 'URL에 사용됩니다. 예: vitalik-buterin-ethereum-vision-2025',
      },
    },
    {
      name: 'subject',
      type: 'relationship',
      relationTo: 'people',
      required: true,
      label: '인터뷰 대상 인물',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: '대표 이미지',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      label: '요약',
      admin: {
        description: '카드에 표시되는 요약문입니다. 140자 내외로 작성해 주세요.',
      },
    },
    // Q&A 본문 (블록 기반)
    {
      name: 'content',
      type: 'blocks',
      required: true,
      label: '인터뷰 본문',
      blocks: [
        {
          slug: 'qa',
          labels: { singular: 'Q&A', plural: 'Q&A 목록' },
          fields: [
            {
              name: 'question',
              type: 'textarea',
              required: true,
              label: '질문',
            },
            {
              name: 'answer',
              type: 'richText',
              required: true,
              label: '답변',
            },
          ],
        },
        {
          slug: 'text',
          labels: { singular: '텍스트', plural: '텍스트 블록' },
          fields: [
            {
              name: 'content',
              type: 'richText',
              required: true,
              label: '내용',
            },
          ],
        },
        {
          slug: 'image',
          labels: { singular: '이미지', plural: '이미지 블록' },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: '이미지',
            },
            {
              name: 'caption',
              type: 'text',
              label: '캡션',
            },
          ],
        },
      ],
    },
    // 태그
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: '태그',
      admin: {
        position: 'sidebar',
        description:
          '인터뷰 태그는 주제, 산업, 독자 대상, 시리즈/기획 분류를 우선 사용합니다.',
      },
    },
    // 발행 정보
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: '발행 상태',
      options: [
        { label: '초안', value: 'draft' },
        { label: '발행', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: '발행일',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (data) => data.status === 'published',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const isPublishing = data.status === 'published' && originalDoc?.status !== 'published'

        if (isPublishing && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }

        return data
      },
    ],
    afterChange: [
      revalidateFrontendAfterChange({
        detailPathPrefix: '/interviews',
        paths: ['/', '/interviews'],
      }),
    ],
    afterDelete: [
      revalidateFrontendAfterDelete({
        detailPathPrefix: '/interviews',
        paths: ['/', '/interviews'],
      }),
    ],
  },
}
