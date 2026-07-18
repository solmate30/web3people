import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/admin'

// Better-Auth가 독자 인증을 담당하므로,
// 댓글 작성자 정보는 Better-Auth 세션에서 전달받아 저장합니다.
export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'authorName',
    group: '커뮤니티',
    defaultColumns: ['authorName', 'interview', 'status', 'createdAt'],
  },
  access: {
    // 공개 댓글은 누구나 조회하고, Payload 관리자는 전체 상태를 조회합니다.
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'visible' } }
    },
    // 독자 댓글은 Better Auth 기반 Route Handler에서 세션 검증 후 생성합니다.
    // Payload REST API를 통한 공개 생성은 차단합니다.
    create: isAdmin,
    // 관리자는 Payload Admin에서 숨김/삭제 운영을 담당합니다.
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'interview',
      type: 'relationship',
      relationTo: 'interviews',
      required: true,
      label: '인터뷰',
      admin: {
        position: 'sidebar',
      },
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
        description: 'Better-Auth 유저 이메일 (공개되지 않음)',
      },
    },
    {
      name: 'authorImage',
      type: 'text',
      label: '작성자 프로필 이미지',
      admin: {
        description: 'Better-Auth 프로필 이미지 URL (선택)',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 2000,
      label: '댓글 내용',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'visible',
      index: true,
      label: '공개 상태',
      options: [
        { label: '공개', value: 'visible' },
        { label: '숨김', value: 'hidden' },
        { label: '삭제됨', value: 'removed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
