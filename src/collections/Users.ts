import type { CollectionConfig } from 'payload'
import { adminOrSelf, isAdmin, isAdminField } from '@/access/admin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: '설정',
  },
  auth: true,
  access: {
    create: isAdmin,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: '이름',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      label: '권한',
      options: [
        { label: '관리자', value: 'admin' },
        { label: '편집자', value: 'editor' },
      ],
      saveToJWT: true,
      access: {
        update: isAdminField,
      },
    },
  ],
}
