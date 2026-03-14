import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PaperOwl — Scan. Sign. Done.',
  description: 'QR-first mobile signing platform for creators, events, and small businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
