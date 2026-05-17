import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

type Role = User['role']

export function hasRole(user: User | null | undefined, roles: Role[]): boolean {
  return Boolean(user?.role && roles.includes(user.role))
}

export const isAdmin: Access = ({ req }) => hasRole(req.user as User | null | undefined, ['admin'])

export const isAdminField: FieldAccess = ({ req }) =>
  hasRole(req.user as User | null | undefined, ['admin'])

export const isAdminOrEditor: Access = ({ req }) =>
  hasRole(req.user as User | null | undefined, ['admin', 'editor'])

export const adminOrSelf: Access = ({ req, id }) => {
  const user = req.user as User | null | undefined

  if (hasRole(user, ['admin'])) return true
  if (!user?.id || !id) return false

  return {
    id: {
      equals: user.id,
    },
  }
}
