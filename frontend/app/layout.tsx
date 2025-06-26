import { NotificationProvider } from './contexts/NotificationContext'
import { WalletProvider } from './contexts/WalletContext'
import { LoadingProvider } from './contexts/LoadingContext'
import GlobalWarningBanner from './components/GlobalWarningBanner'
import './globals.css'
import { Inter } from 'next/font/google'

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
      <body className={`${inter.className} bg-dark-900 min-h-screen`}>
        <NotificationProvider>
          <WalletProvider>
            <LoadingProvider>
              <GlobalWarningBanner />
              {children}
            </LoadingProvider>
          </WalletProvider>
        </NotificationProvider>
      </body>
    </html>
  )
} 