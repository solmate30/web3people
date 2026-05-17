import React from 'react'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import { ToastProvider } from '@/components/ui/ToastProvider'
import './styles.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'web3people — web3를 만드는 사람들의 이야기',
    template: '%s | web3people',
  },
  description: 'web3 빌더, 창업자, 투자자들의 심층 인터뷰 매거진',
  openGraph: {
    siteName: 'web3people',
    locale: 'ko_KR',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
