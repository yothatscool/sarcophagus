import './globals.css'
import { Inter } from 'next/font/google'
import { NotificationProvider } from './contexts/NotificationContext'
import { LoadingProvider } from './contexts/LoadingContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Sarcophagus Protocol',
  description: 'A decentralized protocol for preserving digital legacies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 min-h-screen`}>
        <NotificationProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </NotificationProvider>
      </body>
    </html>
  )
} 