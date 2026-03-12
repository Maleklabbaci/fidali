import type { Metadata } from 'next'
import './globals.css'
import SplashProvider from '@/components/SplashProvider'

export const metadata: Metadata = {
  title: 'Fidali',
  description: 'Cartes de fidélité digitales',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
