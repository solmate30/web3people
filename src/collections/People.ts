import type { CollectionConfig } from 'payload'

export const People: CollectionConfig = {
  slug: 'people',
  admin: {
    useAsTitle: 'name',
    group: '콘텐츠',
    defaultColumns: ['name', 'title', 'organization', 'status'],
    listSearchableFields: ['name', 'name_en', 'organization'],
  },
  access: {
    read: ({ req }) => {
      // 발행된 인물은 누구나 조회 가능
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
  },
  fields: [
    // 기본 정보
    {
      name: 'name',
      type: 'text',
      required: true,
      label: '이름',
    },
    {
      name: 'name_en',
      type: 'text',
      label: '영문 이름',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: '슬러그',
      admin: {
        description: 'URL에 사용됩니다. 예: vitalik-buterin',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: '프로필 사진',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: '직함',
      admin: {
        description: '예: Co-founder & CEO',
      },
    },
    {
      name: 'organization',
      type: 'text',
      label: '소속',
      admin: {
        description: '회사명 또는 프로젝트명',
      },
    },
    {
      name: 'country',
      type: 'text',
      label: '국가',
      admin: {
        description: '예: KR, US, SG',
      },
    },
    // 소개
    {
      name: 'bio',
      type: 'richText',
      required: true,
      label: '소개',
    },
    // 소셜 링크
    {
      name: 'socials',
      type: 'group',
      label: '소셜 링크',
      fields: [
        {
          name: 'twitter',
          type: 'text',
          label: 'Twitter/X URL',
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn URL',
        },
        {
          name: 'website',
          type: 'text',
          label: '개인/프로젝트 웹사이트',
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
    },
    // 발행 상태
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
  ],
}
