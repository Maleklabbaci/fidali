import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fidali — Carte de fidélité digitale',
  description: 'Créez votre programme de fidélité digital en Algérie',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fidali',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
