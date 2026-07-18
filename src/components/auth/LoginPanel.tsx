'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { signIn, signUp } from '@/lib/auth-client'

type Mode = 'login' | 'signup'

type LoginPanelProps = {
  callbackURL?: string
  googleEnabled?: boolean
}

export function LoginPanel({
  callbackURL = '/',
  googleEnabled = false,
}: LoginPanelProps) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submitEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (mode === 'signup') {
      if (password.length < 8) {
        setError('비밀번호는 8자 이상이어야 합니다.')
        return
      }

      if (password !== passwordConfirm) {
        setError('비밀번호가 일치하지 않습니다.')
        return
      }
    }

    setIsLoading(true)

    try {
      const result = mode === 'login'
        ? await signIn.email({
            email,
            password,
            callbackURL,
          })
        : await signUp.email({
            email,
            password,
            name: name.trim() || email,
            callbackURL,
          })

      if (result.error) {
        const message = result.error.message || (mode === 'login'
          ? '로그인에 실패했습니다.'
          : '회원가입 중 문제가 발생했습니다.')
        setError(message)
        toast.error(message)
        return
      }

      toast.success(mode === 'login' ? '로그인되었습니다.' : '계정이 생성되었습니다.')
      router.push(callbackURL)
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  async function continueWithGoogle() {
    if (!googleEnabled) {
      const message = 'Google 로그인이 아직 설정되지 않았습니다.'
      setError(message)
      toast.error(message)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn.social({
        provider: 'google',
        callbackURL,
      })

      if (result.error) {
        const message = result.error.message || 'Google 로그인 중 문제가 발생했습니다.'
        setError(message)
        toast.error(message)
        return
      }

      // Better Auth usually redirects; fall back to returned URL when present.
      const redirectUrl =
        result.data && typeof result.data === 'object' && 'url' in result.data
          ? String((result.data as { url?: string }).url ?? '')
          : ''

      if (redirectUrl) {
        window.location.assign(redirectUrl)
      }
    } catch {
      const message = 'Google 로그인 중 문제가 발생했습니다.'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1120px] items-center px-8 py-20 lg:px-16">
      <div className="grid w-full gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-neon)]">
            Reader Access
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black uppercase leading-none text-[var(--color-text-primary)] md:text-6xl">
            Join the conversation
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            독자 계정은 Payload 어드민 계정과 분리됩니다. 댓글과 게시판 참여는 Better Auth 독자 세션으로 처리합니다.
          </p>
        </div>

        <div className="border border-[var(--color-void-border)] bg-[var(--color-surface)] p-6">
          <div className="grid grid-cols-2 border border-[var(--color-void-border)]">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setPasswordConfirm('')
                setError(null)
              }}
              className={mode === 'login' ? activeTabClass : inactiveTabClass}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setPasswordConfirm('')
                setError(null)
              }}
              className={mode === 'signup' ? activeTabClass : inactiveTabClass}
            >
              Sign Up
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={submitEmailAuth}>
            {mode === 'signup' && (
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
                  Name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClass}
                  autoComplete="name"
                  placeholder="Your name"
                />
              </label>
            )}

            <label className="block">
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
                Email
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
                autoComplete="email"
                placeholder="name@example.com"
              />
            </label>

            <label className="block">
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
                Password
              </span>
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={8}
              />
            </label>

            {mode === 'signup' && (
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
                  Confirm Password
                </span>
                <input
                  required
                  type="password"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  className={inputClass}
                  autoComplete="new-password"
                  minLength={8}
                />
              </label>
            )}

            {error && (
              <p className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <button type="submit" disabled={isLoading} className={primaryButtonClass}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
              {mode === 'login' ? 'Continue with Email' : 'Create Account'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-void-border)]" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
              or
            </span>
            <div className="h-px flex-1 bg-[var(--color-void-border)]" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={continueWithGoogle}
              disabled={isLoading || !googleEnabled}
              className={`${secondaryButtonClass} ${!googleEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <span className="font-mono text-sm font-bold" aria-hidden="true">G</span>
              {googleEnabled ? 'Continue with Google' : 'Google 설정 필요'}
            </button>
            <button type="button" disabled className={`${secondaryButtonClass} cursor-not-allowed opacity-50`}>
              <span className="font-mono text-sm" aria-hidden="true">GH</span>
              GitHub 준비 중
            </button>
            <button type="button" disabled className={`${secondaryButtonClass} cursor-not-allowed opacity-50`}>
              <span className="font-mono text-sm" aria-hidden="true">◇</span>
              Wallet 준비 중
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

const activeTabClass = 'bg-[var(--color-neon)] px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-void)]'
const inactiveTabClass = 'px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]'
const inputClass = 'mt-2 w-full border border-[var(--color-void-border)] bg-[var(--color-void)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-neon)]'
const primaryButtonClass = 'flex w-full items-center justify-center gap-2 bg-[var(--color-neon)] px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-void)] transition-opacity disabled:opacity-60'
const secondaryButtonClass = 'flex w-full items-center justify-center gap-2 border border-[var(--color-void-border)] px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)] disabled:hover:border-[var(--color-void-border)] disabled:hover:text-[var(--color-text-secondary)]'
