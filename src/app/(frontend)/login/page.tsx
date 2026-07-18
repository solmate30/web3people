import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoginPanel } from '@/components/auth/LoginPanel'
import { env } from '@/lib/env'

export const metadata: Metadata = {
  title: 'Login',
  description: 'web3people 독자 로그인 및 회원가입',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string }>
}) {
  const { callbackURL } = await searchParams
  const safeCallbackURL = sanitizeCallbackURL(callbackURL) ?? '/'

  return (
    <>
      <Header />
      <main className="pt-16">
        <LoginPanel
          callbackURL={safeCallbackURL}
          googleEnabled={env.isGoogleAuthEnabled}
        />
      </main>
      <Footer />
    </>
  )
}

function sanitizeCallbackURL(value: string | undefined): string | null {
  if (!value) return null
  if (!value.startsWith('/')) return null
  if (value.startsWith('//')) return null
  return value
}
