import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@/access/admin'

function formatTagSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    group: '콘텐츠',
    defaultColumns: ['name', 'slug'],
    listSearchableFields: ['name', 'slug'],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data?.name && !data.slug) {
          data.slug = formatTagSlug(String(data.name))
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: '태그명',
      admin: {
        description: '화면에 표시되는 이름입니다. 예: Founder, Ethereum, Korean',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: '슬러그',
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.length === 0) return '슬러그를 입력해 주세요.'
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return '슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.'
        }

        return true
      },
      admin: {
        description:
          'URL과 검색 필터에 사용됩니다. 영문 소문자, 숫자, 하이픈만 사용합니다. 예: ethereum, web3-founder',
      },
    },
  ],
}
