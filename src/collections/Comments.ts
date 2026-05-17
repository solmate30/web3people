import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/admin'

// Better-Auth가 독자 인증을 담당하므로,
// 댓글 작성자 정보는 Better-Auth 세션에서 전달받아 텍스트로 저장합니다.
export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'authorName',
    group: '커뮤니티',
    defaultColumns: ['authorName', 'interview', 'status', 'createdAt'],
  },
  access: {
    // 승인된 댓글은 누구나 조회
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'approved' } }
    },
    // 독자 댓글은 Better Auth 기반 Route Handler에서 세션 검증 후 생성합니다.
    // Payload REST API를 통한 공개 생성은 차단합니다.
    create: isAdmin,
    // 수정/삭제는 관리자만
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
      label: '작성자 이름',
    },
    {
      name: 'authorEmail',
      type: 'email',
      required: true,
      label: '작성자 이메일',
      admin: {
        description: 'Better-Auth 유저 이메일 (공개되지 않음)',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: '댓글 내용',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'approved',
      label: '승인 상태',
      options: [
        { label: '검토 중', value: 'pending' },
        { label: '승인', value: 'approved' },
        { label: '거부', value: 'rejected' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
