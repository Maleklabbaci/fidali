import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fidali — Carte de fidélité digitale',
  description: 'Créez votre programme de fidélité digital en Algérie',
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
