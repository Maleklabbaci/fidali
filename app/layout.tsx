import type { Metadata } from 'next'
import './globals.css'
import SplashProvider from '@/components/SplashProvider'

export const metadata: Metadata = {
  title: 'Fidali — Cartes de fidélité digitales',
  description: 'Remplacez les cartes papier par une solution digitale. Vos clients collectent des points en scannant un QR code.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  themeColor: '#2563eb',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <SplashProvider>
          {children}
        </SplashProvider>
      </body>
    </html>
  )
}
