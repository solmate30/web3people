import type { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    group: '콘텐츠',
    defaultColumns: ['name', 'slug'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: '태그명',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: '슬러그',
      admin: {
        description: 'URL에 사용됩니다. 영문 소문자, 숫자, 하이픈만 허용합니다.',
      },
    },
  ],
}
