import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import OfflineDetector from '@/components/OfflineDetector'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'
import FloatingCTA from '@/components/FloatingCTA'
import Preloader from '@/components/Preloader'
import CookieConsent from '@/components/CookieConsent'
import ToastContainer from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Pizza Roma Siegen | Beste Italienische Pizza & Lieferservice',
  description: 'Original italienische Pizza in Siegen. Schnelle Lieferung in 30 Minuten. Bestellen Sie online! Pizza Siegen, Pizza Lieferservice Siegen, beste Pizza in Siegen.',
  keywords: 'Pizza Siegen, Pizza Lieferservice Siegen, beste Pizza in Siegen, italienische Pizza Siegen, Pizza Roma',
  openGraph: {
    title: 'Pizza Roma Siegen | Beste Pizza in der Stadt',
    description: 'Heiße pizza, schnell geliefert. Jetzt online bestellen!',
    images: ['/images/hero-bg.webp']
  },
  // Cache control to prevent old versions
  other: {
    'cache-control': 'no-cache, no-store, must-revalidate',
    'pragma': 'no-cache',
    'expires': '0'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          // Force clear any cached language and reload if needed
          if (localStorage.getItem('lang')) {
            localStorage.removeItem('lang');
          }
        `}} />
      </head>
      <body className="font-inter antialiased">
        <ErrorBoundary>
          <OfflineDetector />
          <Preloader>
            <LanguageProvider>
              <Header />
              <CartSidebar />
              <main>{children}</main>
              <FloatingCTA />
              <Footer />
              <CookieConsent />
              <ToastContainer />
            </LanguageProvider>
          </Preloader>
        </ErrorBoundary>
      </body>
    </html>
  )
}
