import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Focus Buddy - Stay Focused, Boost Productivity',
  description: 'Focus Buddy helps you stay on track with attention and focus management.',
  openGraph: {
    title: 'Focus Buddy - Stay Focused, Boost Productivity',
    description: 'Focus Buddy helps you stay on track with attention and focus management.',
    url: 'https://focusbuddy.app',
    siteName: 'Focus Buddy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Focus Buddy',
    description: 'Stay Focused, Boost Productivity',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
