'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'border border-[var(--color-void-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]',
          title: 'font-mono text-xs uppercase tracking-widest',
          description: 'text-sm text-[var(--color-text-secondary)]',
          actionButton: 'bg-[var(--color-neon)] text-[var(--color-void)]',
          cancelButton: 'bg-[var(--color-void)] text-[var(--color-text-secondary)]',
          error: 'border-red-500/40 bg-red-500/10 text-red-200',
          success: 'border-[rgba(0,255,157,0.35)]',
        },
      }}
    />
  )
}
