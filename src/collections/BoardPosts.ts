import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/admin'
import {
  revalidateFrontendAfterChange,
  revalidateFrontendAfterDelete,
} from '@/hooks/revalidateFrontend'

export const BoardPosts: CollectionConfig = {
  slug: 'boardPosts',
  admin: {
    useAsTitle: 'title',
    group: '커뮤니티',
    defaultColumns: ['title', 'authorName', 'visibility', 'createdAt'],
    listSearchableFields: ['title', 'content', 'authorName'],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { visibility: { equals: 'published' } }
    },
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 160,
      label: '게시글 제목',
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 8000,
      label: '게시글 본문',
    },
    {
      name: 'authorName',
      type: 'text',
      required: true,
      maxLength: 120,
      label: '작성자 이름',
    },
    {
      name: 'authorEmail',
      type: 'email',
      required: true,
      index: true,
      label: '작성자 이메일',
      admin: {
        description: 'Better Auth 유저 이메일. 공개하지 않습니다.',
      },
    },
    {
      name: 'relatedInterview',
      type: 'relationship',
      relationTo: 'interviews',
      label: '연결 인터뷰',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedPerson',
      type: 'relationship',
      relationTo: 'people',
      label: '연결 인물',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'published',
      index: true,
      label: '공개 상태',
      options: [
        { label: '공개', value: 'published' },
        { label: '숨김', value: 'hidden' },
        { label: '삭제됨', value: 'removed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [
      revalidateFrontendAfterChange({
        detailPathPrefix: '/board',
        paths: ['/board'],
      }),
    ],
    afterDelete: [
      revalidateFrontendAfterDelete({
        detailPathPrefix: '/board',
        paths: ['/board'],
      }),
    ],
  },
  timestamps: true,
}
