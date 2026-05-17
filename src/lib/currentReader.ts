import { headers } from 'next/headers'
import { auth } from './auth'

export async function getCurrentReader() {
  return auth.api.getSession({
    headers: await headers(),
  })
}
