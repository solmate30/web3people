import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@/access/admin'

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
      admin: {
        description:
          'URL과 검색 필터에 사용됩니다. 영문 소문자, 숫자, 하이픈만 사용합니다. 예: ethereum, web3-founder',
      },
    },
  ],
}
